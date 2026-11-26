import { createHmac, timingSafeEqual } from "node:crypto";

const lifetime = 300;

function signature(key: Buffer, id: string, adminId: number, expiry: number) {
  return createHmac("sha256", key).update(JSON.stringify(["document-download", id, adminId, expiry])).digest();
}

export function createDownloadTicket(key: Buffer, id: string, adminId: number, now: number) {
  const expiry = now + lifetime;
  return `${expiry}.${signature(key, id, adminId, expiry).toString("hex")}`;
}

export function verifyDownloadTicket(key: Buffer, id: string, adminId: number, ticket: string, now: number) {
  const match = /^(\d{1,12})\.([a-f0-9]{64})$/.exec(ticket);
  if (!match) return false;
  const expiry = Number(match[1]);
  return expiry > now && expiry <= now + lifetime &&
    timingSafeEqual(Buffer.from(match[2], "hex"), signature(key, id, adminId, expiry));
}
