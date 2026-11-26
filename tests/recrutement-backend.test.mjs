import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { crc32 } from "node:zlib";
import ts from "typescript";

const asModule = (js) => `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`;
const files = new URL("../src/modules/recrutement/server/", import.meta.url);
async function moduleSource(file, imports) {
  let source = await readFile(new URL(file, files), "utf8");
  for (const [name, path] of Object.entries(imports)) source = source.replaceAll(JSON.stringify(name), JSON.stringify(path));
  return asModule(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  } }).outputText);
}
const securityUrl = await moduleSource("security.ts", {
  "@/lib/blog/write-origin": new URL("../src/lib/blog/write-origin.ts", import.meta.url).href,
});
const documentsUrl = await moduleSource("documents.ts", { "./security": securityUrl });
const { boundedBody, createToken, readToken, sealQueuedToken, submissionHash, tokenHash, unsealQueuedToken } = await import(securityUrl);
const { readDocument } = await import(documentsUrl);

const key = randomBytes(32);

test("confirmation and durable email queue tokens use separate authenticated contexts", () => {
  const token = createToken(key);
  const second = createToken(key);
  assert.notEqual(token, second);
  assert.deepEqual(tokenHash(token), tokenHash(readToken(token, key)));
  assert.notDeepEqual(tokenHash(token), tokenHash(second));
  const changed = `${token[0] === "A" ? "B" : "A"}${token.slice(1)}`;
  assert.throws(() => readToken(changed, key), { code: "invalid" });
  assert.throws(() => readToken(token, randomBytes(32)), { code: "invalid" });
  const stored = sealQueuedToken(key, token);
  assert.equal(unsealQueuedToken(key, stored), token);
  assert.throws(() => readToken(stored, key), { code: "invalid" });
  assert.throws(() => unsealQueuedToken(key, token));
});

test("submission idempotency is limited to a single form, email and offer", () => {
  const id = randomUUID();
  const digest = submissionHash(key, "hopla", "cv@example.test", id);
  assert.deepEqual(digest, submissionHash(key, "hopla", "cv@example.test", id));
  assert.notDeepEqual(digest, submissionHash(key, "hopla", "cv@example.test", randomUUID()));
  assert.notDeepEqual(digest, submissionHash(key, "different", "cv@example.test", id));
  assert.notDeepEqual(digest, submissionHash(key, "hopla", "different@example.test", id));
});

test("request size is bounded even without Content-Length", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("too long"));
      controller.close();
    },
  });
  const request = new Request("https://example.test", {
    method: "POST", body, duplex: "half", headers: { "Content-Type": "application/json" },
  });
  await assert.rejects(boundedBody(request, "application/json", 4), { status: 413 });
});

const downloadsUrl = await moduleSource("downloads.ts", {});
const { createDownloadTicket, verifyDownloadTicket } = await import(downloadsUrl);

test("private document tickets expire and are bound to the document and admin", () => {
  const first = randomUUID();
  const second = randomUUID();
  const ticket = createDownloadTicket(key, first, 42, 1000);
  assert.equal(verifyDownloadTicket(key, first, 42, ticket, 1000), true);
  assert.equal(verifyDownloadTicket(key, first, 42, ticket, 1300), false);
  assert.equal(verifyDownloadTicket(key, first, 43, ticket, 1000), false);
  assert.equal(verifyDownloadTicket(key, second, 42, ticket, 1000), false);
});

function pdfFixture() {
  const header = "%PDF-1.4\n";
  const catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const pages = "2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n";
  const padded = (offset) => String(offset).padStart(10, "0");
  return header + catalog + pages + "xref\n0 3\n0000000000 65535 f \n" +
    `${padded(header.length)} 00000 n \n${padded(header.length + catalog.length)} 00000 n \n` +
    `trailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n${header.length + catalog.length + pages.length}\n%%EOF\n`;
}

function wordFixture() {
  const file = Buffer.alloc(2560);
  Buffer.from("d0cf11e0a1b11ae1", "hex").copy(file);
  file.writeUInt16LE(3, 26);
  file.writeUInt16LE(0xfffe, 28);
  file.writeUInt16LE(9, 30);
  file.writeUInt16LE(6, 32);
  file.writeUInt32LE(1, 44);
  file.writeUInt32LE(1, 48);
  file.writeUInt32LE(4096, 56);
  file.writeUInt32LE(3, 60);
  file.writeUInt32LE(1, 64);
  const endOfChain = 0xfffffffe;
  file.fill(0xff, 512, 1024);
  file.writeUInt32LE(0xfffffffd, 512);
  for (const offset of [516, 520, 524]) file.writeUInt32LE(endOfChain, offset);
  function directory(name, type, index, sector, size) {
    const position = 1024 + index * 128;
    const encoded = Buffer.from(`${name}\0`, "utf16le");
    encoded.copy(file, position);
    file.writeUInt16LE(encoded.length, position + 64);
    file[position + 66] = type;
    file.writeUInt32LE(sector, position + 116);
    file.writeUInt32LE(size, position + 120);
  }
  directory("Root Entry", 5, 0, 2, 128);
  directory("WordDocument", 2, 1, 0, 64);
  directory("1Table", 2, 2, 1, 64);
  file.writeUInt16LE(0xa5ec, 1536);
  return file;
}

function zipFixture(entries) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(entries)) {
    const path = Buffer.from(name);
    const payload = Buffer.from(content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc32(payload), 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(payload.length, 22);
    local.writeUInt16LE(path.length, 26);
    locals.push(local, path, payload);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    record.writeUInt16LE(20, 6);
    record.writeUInt32LE(crc32(payload), 16);
    record.writeUInt32LE(payload.length, 20);
    record.writeUInt32LE(payload.length, 24);
    record.writeUInt16LE(path.length, 28);
    record.writeUInt32LE(offset, 42);
    central.push(record, path);
    offset += local.length + path.length + payload.length;
  }
  const centralDirectory = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  const count = Object.keys(entries).length;
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(count, 8);
  eocd.writeUInt16LE(count, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDirectory, eocd]);
}
const wordEntries = {
  "[Content_Types].xml": '<Types><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  "_rels/.rels": '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
  "word/document.xml": '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>',
};

test("document validation accepts PDF and Word formats, including neutral upload MIME", async () => {
  const pdf = new File([pdfFixture()], "cv.pdf", { type: "application/pdf" });
  const doc = new File([wordFixture()], "cv.doc", { type: "application/msword" });
  const docx = new File([zipFixture(wordEntries)], "cv.docx", { type: "application/octet-stream" });
  assert.equal((await readDocument(pdf, "cv", true)).mimeType, "application/pdf");
  assert.equal((await readDocument(doc, "cv", true)).mimeType, "application/msword");
  assert.match((await readDocument(docx, "cv", true)).mimeType, /wordprocessingml/);
  assert.equal(await readDocument(null, "coverLetter", false), null);
});

test("document validation rejects missing, oversized and falsely labelled files", async () => {
  await assert.rejects(readDocument(null, "coverLetter", true), { status: 422 });
  const wrongMime = new File([pdfFixture()], "cv.pdf", { type: "text/plain" });
  const fauxPdf = new File(["%PDF-1.4\nThis is not a PDF"], "cv.pdf", { type: "application/pdf" });
  const fauxDoc = new File([Buffer.from("d0cf11e0a1b11ae1", "hex")], "cv.doc", { type: "application/msword" });
  const fauxDocx = new File([zipFixture({ "plain.txt": "not a Word document" })], "cv.docx");
  const oversized = new File([Buffer.alloc(5 * 1024 * 1024 + 1)], "cv.pdf");
  for (const file of [wrongMime, fauxPdf, fauxDoc, fauxDocx, oversized]) {
    await assert.rejects(readDocument(file, "cv", true), { status: 422 });
  }
});

const applicationsUrl = await moduleSource("applications.ts", {
  "../application/fields": await moduleSource("../application/fields.ts", {}),
  "./documents": documentsUrl,
  "./security": securityUrl,
  "./email": asModule(`
    export function getMailer() { return {}; }
    export function queueEmail(...args) { return globalThis.hoplaRecruitmentTest.queueEmail(...args); }
    export function deliverEmail(...args) { return globalThis.hoplaRecruitmentTest.deliverEmail(...args); }
  `),
  "./jobs": asModule(`
    export function getJob(slug) { return globalThis.hoplaRecruitmentTest.getJob?.(slug) ?? null; }
    export function isOpen(job) { return Boolean(job); }
  `),
  "@/lib/db": asModule("export default { getConnection() { return globalThis.hoplaRecruitmentTest.connection; } };"),
});
const { processConfirmation, submitApplication } = await import(applicationsUrl);

const origin = "https://example.test";
function configureApplications(context) {
  const saved = new Map();
  const environment = {
    RECRUTEMENT_ORIGIN: origin,
    RECRUTEMENT_TOKEN_KEY: key.toString("hex"),
    RECRUTEMENT_OUTBOX_SECRET: "test-outbox-key-for-control-only",
    RECRUTEMENT_CANDIDATURES_ENABLED: "true",
  };
  for (const [name, value] of Object.entries(environment)) {
    saved.set(name, process.env[name]);
    process.env[name] = value;
  }
  context.after(() => {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    delete globalThis.hoplaRecruitmentTest;
  });
}

function spontaneousRequest(change = () => {}) {
  const form = new FormData();
  const fields = {
    applicationType: "spontaneous_application", firstName: "Awa", lastName: "Koné",
    email: "cv@example.test", phone: "+225 (07) 01 02 03 04", city: "Abidjan",
    nationality: "CI", desiredPosition: "Responsable de projet", consent: "on",
  };
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  form.set("cv", new File([pdfFixture()], "test.pdf", { type: "application/pdf" }));
  change(form);
  return new Request(`${origin}/api/recrutement/candidatures`, {
    method: "POST", headers: { Origin: origin }, body: form,
  });
}

test("spontaneous submission persists its own fields without looking up a job and queues only a verification email", async (context) => {
  configureApplications(context);
  const saved = [];
  const events = [];
  globalThis.hoplaRecruitmentTest = {
    getJob() { assert.fail("spontaneous application must not look up an advertised job"); },
    queueEmail(_, id, kind, verification) {
      assert.equal(id, saved[0][0]);
      assert.equal(kind, "verification");
      assert.equal(readToken(verification.token, key), verification.token);
      events.push("queue");
      return "verification";
    },
    deliverEmail(_pool, _config, _mailer, id) {
      assert.equal(id, "verification");
      events.push("send");
      return true;
    },
    connection: {
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      release() {},
      async execute(sql, params) {
        if (sql.includes("recrutement_rate_limits")) return [[{ hits: 1 }]];
        if (sql.includes("INSERT INTO recrutement_candidatures")) {
          assert.match(sql, /INTERVAL 48 HOUR/);
          saved.push(params);
          return [];
        }
        if (sql.includes("INSERT INTO recrutement_documents")) {
          assert.equal(params[1], saved[0][0]);
          assert.equal(params[2], "cv");
          return [];
        }
        assert.fail(`unexpected SQL: ${sql}`);
      },
    },
  };

  const response = await submitApplication(spontaneousRequest());
  assert.equal(response.status, 201);
  assert.deepEqual(saved[0].slice(1, 12), [
    "spontaneous_application", null, null, "Awa", "Koné", "cv@example.test", "+2250701020304", "",
    "Abidjan", "CI", "Responsable de projet",
  ]);
  assert.deepEqual(events, ["queue", "send"]);
});

test("spontaneous submission rejects invalid nationality, invalid international phone, missing CV and an extraneous slug", async (context) => {
  configureApplications(context);
  globalThis.hoplaRecruitmentTest = {
    connection: {
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      release() {},
      async execute(sql) {
        assert.match(sql, /recrutement_rate_limits/);
        return [[{ hits: 1 }]];
      },
    },
  };
  for (const change of [
    (form) => form.set("nationality", "XX"),
    (form) => form.set("phone", "0701020304"),
    (form) => form.delete("city"),
    (form) => form.delete("desiredPosition"),
    (form) => form.delete("cv"),
    (form) => form.set("slug", "offre-fermée"),
  ]) {
    await assert.rejects(submitApplication(spontaneousRequest(change)), { status: 422 });
  }
});

test("spontaneous and job submissions share the same IP and email rate limits", async (context) => {
  configureApplications(context);
  const buckets = [];
  globalThis.hoplaRecruitmentTest = {
    getJob() { assert.fail("rate-limited requests must stop before reading an offer"); },
    connection: {
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      release() {},
      async execute(sql, [bucket]) {
        assert.match(sql, /recrutement_rate_limits/);
        if (sql.startsWith("INSERT")) buckets.push(bucket.toString("hex"));
        return [[{ hits: buckets.length % 2 === 0 ? 4 : 1 }]];
      },
    },
  };
  await assert.rejects(submitApplication(spontaneousRequest()), { status: 429 });
  await assert.rejects(submitApplication(spontaneousRequest((form) => {
    for (const key of ["applicationType", "city", "nationality", "desiredPosition"]) form.delete(key);
    form.set("slug", "offre-test");
  })), { status: 429 });
  assert.equal(buckets.length, 4);
  assert.notEqual(buckets[0], buckets[1]);
  assert.deepEqual(buckets.slice(0, 2), buckets.slice(2));
});

test("expired link can be renewed once and only a valid token can trigger recruiter notification", async (context) => {
  configureApplications(context);

  const old = createToken(key);
  const events = [];
  let expired = false;
  let current = tokenHash(old);
  let replacement;
  globalThis.hoplaRecruitmentTest = {
    queueEmail(_, id, kind, verification) {
      assert.equal(id, "application-1");
      events.push(`queued:${kind}`);
      replacement = verification?.token ?? replacement;
      return kind;
    },
    deliverEmail(_pool, _config, _mailer, id) {
      events.push(`sent:${id}`);
      return true;
    },
    connection: {
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      release() {},
      async execute(sql, params) {
        if (sql.includes("recrutement_rate_limits")) return [[{ hits: 1 }]];
        if (sql.includes("SELECT id, token_expires_at")) {
          return [current?.equals(params[0]) ? [{ id: "application-1", expired }] : []];
        }
        if (sql.includes("SET token_hash = ?")) {
          assert.match(sql, /INTERVAL 48 HOUR/);
          current = params[0];
          expired = false;
          return [];
        }
        if (sql.includes("SET validated_at")) {
          current = null;
          return [];
        }
        assert.fail(`unexpected SQL: ${sql}`);
      },
    },
  };
  const request = (token) => new Request(`${origin}/api/recrutement/candidatures/valider`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  await assert.rejects(processConfirmation(request(old), "resend"), { code: "active" });
  expired = true;
  await assert.rejects(processConfirmation(request(old), "validate"), { status: 410, code: "expired" });
  assert.deepEqual(events, []);
  assert.equal((await processConfirmation(request(old), "resend")).status, 200);
  await assert.rejects(processConfirmation(request(old), "validate"), { code: "invalid" });
  assert.deepEqual(events, ["queued:verification", "sent:verification"]);
  assert.equal((await processConfirmation(request(replacement), "validate")).status, 200);
  await assert.rejects(processConfirmation(request(replacement), "validate"), { code: "invalid" });
  assert.deepEqual(events, [
    "queued:verification", "sent:verification",
    "queued:recruiter", "queued:candidate", "sent:recruiter", "sent:candidate",
  ]);
});

