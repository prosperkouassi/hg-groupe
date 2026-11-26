import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";

import type { Pool } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

import { checkWriteOrigin } from "@/lib/blog/write-origin";

export class ApplicationError extends Error {
  constructor(readonly status: number, message: string, readonly code?: string) {
    super(message);
  }
}

export const applicationUnavailable = "Les candidatures sont temporairement indisponibles. Veuillez réessayer plus tard.";

export function applicationError(error: unknown) {
  if (error instanceof ApplicationError) return reply(error.message, error.status, error.code);
  console.error("[recrutement] Échec interne du traitement de la candidature.");
  return reply(applicationUnavailable, 503);
}

export function reply(message: string, status = 200, code?: string) {
  return Response.json({ message, ...(code && { code }) }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function verifyOrigin(request: Request) {
  if (!checkWriteOrigin(request, process.env.RECRUTEMENT_ORIGIN, process.env.NODE_ENV === "production").allowed) {
    throw new ApplicationError(403, "Origine de la requête refusée.");
  }
}

export function getRecruitmentTokenKey() {
  const key = process.env.RECRUTEMENT_TOKEN_KEY;
  if (!key || !/^[a-f0-9]{64}$/i.test(key)) throw new ApplicationError(503, applicationUnavailable);
  return Buffer.from(key, "hex");
}

export function getApplicationConfig() {
  const { RECRUTEMENT_ORIGIN: input, RECRUTEMENT_CANDIDATURES_ENABLED: enabled,
    RECRUTEMENT_OUTBOX_SECRET: secret } = process.env;
  if (enabled !== "true" || !input || !secret || secret.length < 32) {
    throw new ApplicationError(503, applicationUnavailable);
  }
  const key = getRecruitmentTokenKey();
  const origin = new URL(input);
  if (origin.protocol !== "https:" || origin.origin !== input) {
    throw new ApplicationError(503, applicationUnavailable);
  }
  return { key, origin: origin.origin };
}

const tokenContext = Buffer.from("hopla-recrutement-verification-v1");
const outboxContext = Buffer.from("hopla-recrutement-outbox-v1");

function seal(key: Buffer, context: Buffer, plaintext: Buffer) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(context);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([nonce, encrypted, cipher.getAuthTag()]).toString("base64url");
}

function unseal(key: Buffer, context: Buffer, input: string) {
  const bytes = Buffer.from(input, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
  decipher.setAAD(context);
  decipher.setAuthTag(bytes.subarray(-16));
  return Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]);
}

export function createToken(key: Buffer) {
  return seal(key, tokenContext, randomBytes(32));
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest();
}

export function submissionHash(key: Buffer, slug: string, email: string, id: string) {
  return createHmac("sha256", key).update(JSON.stringify(["submission", slug, email, id])).digest();
}

export function sealQueuedToken(key: Buffer, token: string) {
  return seal(key, outboxContext, Buffer.from(token, "ascii"));
}

export function unsealQueuedToken(key: Buffer, input: string) {
  return unseal(key, outboxContext, input).toString("ascii");
}

export function readToken(value: unknown, key: Buffer) {
  if (typeof value === "string" && /^[\w-]{80}$/.test(value)) {
    try {
      unseal(key, tokenContext, value);
      return value;
    } catch {
      // Authenticating the encrypted token must precede a lookup.
    }
  }
  throw new ApplicationError(400, "Ce lien de validation est invalide.", "invalid");
}

export function ipScope(request: Request) {
  // Only set this name when a trusted edge overwrites the chosen header.
  const header = process.env.RECRUTEMENT_TRUSTED_IP_HEADER;
  const value = header ? request.headers.get(header)?.trim() : undefined;
  return value && isIP(value) ? value.toLowerCase() : "shared";
}

export async function limit(pool: Pool, key: Buffer, scope: string, value: string, cap: number, seconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / seconds);
  const hash = createHmac("sha256", key).update(JSON.stringify([scope, value, window])).digest();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO recrutement_rate_limits (bucket, hits, expires_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE hits = hits + 1",
      [hash, sqlDate((window + 1) * seconds * 1000)],
    );
    const [rows] = await connection.execute<(RowDataPacket & { hits: number })[]>(
      "SELECT hits FROM recrutement_rate_limits WHERE bucket = ?", [hash],
    );
    await connection.commit();
    if (rows[0].hits <= cap) return;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  throw new ApplicationError(429, "Trop de tentatives. Veuillez réessayer plus tard.");
}

export function sqlDate(timestamp = Date.now()) {
  return new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");
}

export async function boundedBody(request: Request, mediaType: string, maxBytes: number) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.split(";", 1)[0].trim().toLowerCase() !== mediaType) {
    throw new ApplicationError(415, "Format de requête non accepté.");
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > maxBytes)) {
    throw new ApplicationError(413, "La taille maximale de la requête est dépassée.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ApplicationError(400, "La requête est vide.");
  let received = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new ApplicationError(413, "La taille maximale de la requête est dépassée.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(Buffer.concat(chunks, received)),
  });
}

