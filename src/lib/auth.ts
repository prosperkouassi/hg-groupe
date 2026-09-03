import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "hopla_admin_session";

const SESSION_DURATION = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Variable d'environnement manquante : ADMIN_SESSION_SECRET"
    );
  }

  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}

function createSignature(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("hex");
}

export function createSessionToken(adminId: number) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;

  const payload = `${adminId}.${expiresAt}`;
  const signature = createSignature(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [adminIdValue, expiresAtValue, signature] = parts;

  const payload = `${adminIdValue}.${expiresAtValue}`;
  const expectedSignature = createSignature(payload);

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedSignatureBuffer = Buffer.from(
    expectedSignature,
    "hex"
  );

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(
      signatureBuffer,
      expectedSignatureBuffer
    )
  ) {
    return null;
  }

  const adminId = Number(adminIdValue);
  const expiresAt = Number(expiresAtValue);

  if (!Number.isInteger(adminId) || !Number.isInteger(expiresAt)) {
    return null;
  }

  if (expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    adminId,
    expiresAt,
  };
}

export async function setAdminSession(adminId: number) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: createSessionToken(adminId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}