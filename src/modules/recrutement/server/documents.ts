import { crc32, inflateRawSync } from "node:zlib";

import { ApplicationError } from "./security";

const types = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const maxFileBytes = 5 * 1024 * 1024;
export const maxApplicationBytes = 2 * maxFileBytes + 64 * 1024;

function isPdf(data: Buffer) {
  const header = data.toString("ascii", 0, 9);
  const footer = data.subarray(-4096).toString("latin1").match(/startxref\s+(\d+)\s+%%EOF\s*$/);
  const xref = footer ? Number(footer[1]) : -1;
  return /^%PDF-(?:1\.[0-7]|2\.0)/.test(header) && xref > 0 && xref < data.length &&
    /^(?:xref\s|\d+\s+\d+\s+obj\b)/.test(data.toString("latin1", xref, xref + 64));
}

function isWordCompoundFile(data: Buffer) {
  if (data.length < 1024 || data.subarray(0, 8).toString("hex") !== "d0cf11e0a1b11ae1" ||
    data.readUInt16LE(28) !== 0xfffe || data.readUInt16LE(32) !== 6) return false;
  const major = data.readUInt16LE(26);
  const shift = data.readUInt16LE(30);
  if (!(major === 3 && shift === 9) && !(major === 4 && shift === 12)) return false;

  const sectorSize = 1 << shift;
  if (data.length % sectorSize !== 0) return false;
  const maxSector = data.length / sectorSize - 2;
  const fatCount = data.readUInt32LE(44);
  const fat: number[] = [];
  // For a document within our size ceiling all allocated FAT sectors fit in the header DIFAT.
  if (!fatCount || fatCount > 109) return false;
  for (let index = 0; index < fatCount; index++) {
    const sector = data.readUInt32LE(76 + index * 4);
    if (sector > maxSector) return false;
    const start = (sector + 1) * sectorSize;
    for (let offset = start; offset < start + sectorSize; offset += 4) fat.push(data.readUInt32LE(offset));
  }

  const seen = new Set<number>();
  let root: { sector: number; size: number } | undefined;
  let word: { sector: number; size: number } | undefined;
  let table: { sector: number; size: number } | undefined;
  let sector = data.readUInt32LE(48);
  while (sector <= maxSector && !seen.has(sector)) {
    seen.add(sector);
    const start = (sector + 1) * sectorSize;
    for (let offset = start; offset < start + sectorSize; offset += 128) {
      const nameLength = data.readUInt16LE(offset + 64);
      const type = data[offset + 66];
      if (![2, 5].includes(type) || nameLength < 4 || nameLength > 64 || nameLength % 2) continue;
      const stream = { sector: data.readUInt32LE(offset + 116), size: data.readUInt32LE(offset + 120) };
      if (data.readUInt32LE(offset + 124) || stream.size > data.length) continue;
      const name = data.toString("utf16le", offset, offset + nameLength - 2);
      if (type === 5 && name === "Root Entry") root = stream;
      if (type === 2 && name === "WordDocument") word = stream;
      if (type === 2 && (name === "0Table" || name === "1Table")) table = stream;
    }
    sector = fat[sector];
  }
  if (sector !== 0xfffffffe || !root || !word || word.size < 32 || !table?.size) return false;
  const start = (stream: { sector: number; size: number }) => {
    if (stream.size >= 4096) return stream.sector <= maxSector ? (stream.sector + 1) * sectorSize : -1;
    const miniOffset = stream.sector * 64;
    if (miniOffset >= root.size || !data.readUInt32LE(64)) return -1;
    let offset = miniOffset;
    let rootSector = root.sector;
    while (offset >= sectorSize && rootSector <= maxSector) {
      offset -= sectorSize;
      rootSector = fat[rootSector];
    }
    return rootSector <= maxSector ? (rootSector + 1) * sectorSize + offset : -1;
  };
  const wordStart = start(word);
  return wordStart >= 0 && start(table) >= 0 && data.readUInt16LE(wordStart) === 0xa5ec;
}

function isWordPackage(data: Buffer) {
  if (data.length < 22 || data.readUInt32LE(0) !== 0x04034b50) return false;
  let eocd = data.length - 22;
  const minEnd = Math.max(0, eocd - 0xffff);
  while (eocd >= minEnd && !(data.readUInt32LE(eocd) === 0x06054b50 &&
    eocd + 22 + data.readUInt16LE(eocd + 20) === data.length)) eocd--;
  if (eocd < minEnd || data.readUInt32LE(eocd + 4) !== 0) return false;

  const entries = data.readUInt16LE(eocd + 10);
  let offset = data.readUInt32LE(eocd + 16);
  if (entries !== data.readUInt16LE(eocd + 8) || entries > 1000 ||
    offset + data.readUInt32LE(eocd + 12) !== eocd) return false;
  const names = new Set<string>();
  let hasContentTypes = false;
  let hasMainDocument = false;
  const bodyEnd = offset;
  for (let entry = 0; entry < entries; entry++) {
    if (offset + 46 > eocd || data.readUInt32LE(offset) !== 0x02014b50) return false;
    const nameLength = data.readUInt16LE(offset + 28);
    const endName = offset + 46 + nameLength;
    const next = endName + data.readUInt16LE(offset + 30) + data.readUInt16LE(offset + 32);
    if (next > eocd) return false;
    const name = data.toString("utf8", offset + 46, endName);
    if (names.has(name) || name.split("/").includes("..") || /[\\:\x00-\x1f]/.test(name) || name.startsWith("/") ||
      /(?:vbaproject|activex|embeddings)/i.test(name)) return false;
    names.add(name);
    if (name === "[Content_Types].xml" || name === "word/document.xml") {
      const local = data.readUInt32LE(offset + 42);
      const compression = data.readUInt16LE(offset + 10);
      const compressed = data.readUInt32LE(offset + 20);
      const expanded = data.readUInt32LE(offset + 24);
      if (local + 30 > bodyEnd || data.readUInt32LE(local) !== 0x04034b50 ||
        data.readUInt16LE(offset + 8) & 1 || data.readUInt16LE(local + 6) & 1 ||
        data.readUInt16LE(local + 8) !== compression || ![0, 8].includes(compression) ||
        expanded > 5 * 1024 * 1024) return false;
      const start = local + 30 + data.readUInt16LE(local + 26) + data.readUInt16LE(local + 28);
      if (data.toString("utf8", local + 30, local + 30 + data.readUInt16LE(local + 26)) !== name ||
        start + compressed > bodyEnd) return false;
      let xml: Buffer;
      try {
        const bytes = data.subarray(start, start + compressed);
        xml = compression === 0 ? bytes : inflateRawSync(bytes, { maxOutputLength: Math.max(1, expanded) });
      } catch {
        return false;
      }
      if (xml.length !== expanded || crc32(xml) !== data.readUInt32LE(offset + 16)) return false;
      const body = xml.toString("utf8");
      if (/<!DOCTYPE|<!ENTITY/i.test(body)) return false;
      if (name === "[Content_Types].xml") {
        hasContentTypes = /application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document\.main\+xml/.test(body);
      } else {
        hasMainDocument = /<(?:[\w.-]+:)?document[\s>]/.test(body) && /wordprocessingml\/(?:2006\/)?main/.test(body);
      }
    }
    offset = next;
  }
  return offset === eocd && names.has("_rels/.rels") && hasContentTypes && hasMainDocument;
}

export async function readDocument(value: FormDataEntryValue | null, field: "cv" | "coverLetter", required: boolean) {
  const label = field === "cv" ? "Le CV" : "La lettre de motivation";
  if (value === null || (value instanceof File && !value.name && !value.size)) {
    if (required) throw new ApplicationError(422, `${label} doit être joint au formulaire.`);
    return null;
  }
  if (!(value instanceof File) || !value.size || value.size > maxFileBytes) {
    throw new ApplicationError(422, `${label} doit être un fichier de 5 Mo maximum.`);
  }
  const extension = value.name.toLowerCase().match(/\.(pdf|doc|docx)$/)?.[1] as keyof typeof types | undefined;
  const content = Buffer.from(await value.arrayBuffer());
  const validType = extension && (!value.type || value.type === "application/octet-stream" || value.type === types[extension]);
  const validContent = extension === "pdf" ? isPdf(content)
    : extension === "doc" ? isWordCompoundFile(content)
      : extension === "docx" && isWordPackage(content);
  if (!extension || !validType || !validContent) {
    throw new ApplicationError(422, `${label} doit être au format PDF, DOC ou DOCX et être lisible.`);
  }
  return { kind: field, extension, mimeType: types[extension], content };
}

