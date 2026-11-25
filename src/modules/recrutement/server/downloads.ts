import { createHmac, timingSafeEqual } from "node:crypto";

import type { RowDataPacket } from "mysql2";

import { getAdminSession } from "@/lib/auth";
import { ApplicationError, getApplicationConfig, verifyOrigin } from "./security";

const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const lifetime = 300;

function unavailable() {
  return new ApplicationError(404, "Document indisponible.");
}

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

async function authorizedAdmin(id: string) {
  const allowed = new Set((process.env.RECRUTEMENT_DOCUMENT_ADMIN_IDS ?? "").split(",")
    .map((candidate) => candidate.trim()).filter((candidate) => /^[1-9]\d*$/.test(candidate)));
  if (!validId.test(id) || !allowed.size) throw unavailable();
  const session = await getAdminSession();
  if (!session || !allowed.has(String(session.adminId))) throw unavailable();
  const { getAdminUserById } = await import("@/lib/admin");
  if (!(await getAdminUserById(session.adminId))) throw unavailable();
  return session.adminId;
}

const noStore = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

const validatedDocument = `FROM recrutement_documents d JOIN recrutement_candidatures c
  ON d.application_id = c.id WHERE d.id = ? AND c.validated_at IS NOT NULL`;

export async function issueDownload(request: Request, id: string) {
  verifyOrigin(request);
  const adminId = await authorizedAdmin(id);
  const { key } = getApplicationConfig();
  const { default: pool } = await import("@/lib/db");
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT 1 ${validatedDocument}`, [id]);
  if (!rows.length) throw unavailable();
  const ticket = createDownloadTicket(key, id, adminId, Math.floor(Date.now() / 1000));
  return Response.json({
    url: `/api/recrutement/candidatures/documents/${id}#ticket=${ticket}`,
    expiresIn: lifetime,
  }, { headers: noStore });
}

export async function readDownload(request: Request, id: string) {
  // The fragment stays local. The authorized viewer forwards its ticket in a request header.
  const ticket = (request.headers.get("authorization") ?? "").match(/^Bearer (\S+)$/)?.[1];
  if (!ticket) throw unavailable();
  const adminId = await authorizedAdmin(id);
  const { key } = getApplicationConfig();
  if (!verifyDownloadTicket(key, id, adminId, ticket, Math.floor(Date.now() / 1000))) throw unavailable();

  const { default: pool } = await import("@/lib/db");
  const [[document]] = await pool.execute<(RowDataPacket & { extension: string; content: Buffer })[]>(
    `SELECT d.extension, d.content ${validatedDocument}`, [id],
  );
  if (!document || !["pdf", "doc", "docx"].includes(document.extension)) throw unavailable();
  return new Response(new Uint8Array(document.content), {
    headers: {
      ...noStore,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="document-${id}.${document.extension}"`,
      "Content-Security-Policy": "sandbox",
    },
  });
}

