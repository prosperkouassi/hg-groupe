import { randomUUID, timingSafeEqual } from "node:crypto";

import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

import { isNationalityCode, normalizeInternationalPhone } from "../application/fields";
import { maxApplicationBytes, readDocument } from "./documents";
import { deliverEmail, getMailer, queueEmail } from "./email";
import { getJob, isOpen } from "./jobs";
import {
  ApplicationError, applicationUnavailable, boundedBody, createToken, getApplicationConfig, ipScope, limit,
  readToken, reply, submissionHash, tokenHash, verifyOrigin,
} from "./security";

type ApplicationRow = RowDataPacket & { id: string; expired: number };

async function formData(request: Request) {
  const bounded = await boundedBody(request, "multipart/form-data", maxApplicationBytes);
  try {
    const form = await bounded.formData();
    const allowedFields = new Set([
      "applicationType", "slug", "firstName", "lastName", "email", "phone", "motivation",
      "city", "nationality", "desiredPosition", "consent", "website", "cv", "coverLetter", "submissionId",
    ]);
    for (const name of form.keys()) {
      if (!allowedFields.has(name) || form.getAll(name).length !== 1) throw new Error("Invalid form field");
    }
    return form;
  } catch {
    throw new ApplicationError(400, "Le formulaire est invalide.");
  }
}

function field(form: FormData, name: string, max: number, required = true, multiline = false) {
  const raw = form.get(name) ?? "";
  if (typeof raw !== "string") throw new ApplicationError(422, "Vérifiez les champs du formulaire.");
  const value = raw.normalize("NFC").trim().replace(/\r\n/g, "\n");
  const controls = multiline ? /[\x00-\x08\x0B-\x1F\x7F]/ : /[\x00-\x1F\x7F]/;
  if (value.length > max || (required && !value) || controls.test(value)) {
    throw new ApplicationError(422, "Vérifiez les champs du formulaire.");
  }
  return value;
}

function readApplicationTarget(form: FormData) {
  const type = field(form, "applicationType", 24, false) || "job_application";
  const phone = field(form, "phone", 35, type === "spontaneous_application");
  if (type === "spontaneous_application" && !form.has("slug") && !form.has("motivation")) {
    const city = field(form, "city", 120);
    const nationality = field(form, "nationality", 2);
    const desiredPosition = field(form, "desiredPosition", 180);
    const normalizedPhone = normalizeInternationalPhone(phone);
    if (!normalizedPhone || !isNationalityCode(nationality)) {
      throw new ApplicationError(422, "Vérifiez le numéro de téléphone international et la nationalité.");
    }
    return { type, slug: null, phone: normalizedPhone, motivation: "", city, nationality, desiredPosition } as const;
  }
  if (type === "job_application" && !form.has("city") && !form.has("nationality") && !form.has("desiredPosition")) {
    const slug = field(form, "slug", 140);
    const motivation = field(form, "motivation", 4000, false, true);
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && (!phone || /^[+\d(). -]{6,35}$/.test(phone))) {
      return { type, slug, phone, motivation, city: null, nationality: null, desiredPosition: null } as const;
    }
  }
  throw new ApplicationError(422, "Vérifiez les champs du formulaire.");
}

async function transaction<T>(pool: Pool, run: (connection: PoolConnection) => Promise<T>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function sendIfAvailable(...args: Parameters<typeof deliverEmail>) {
  try {
    return await deliverEmail(...args);
  } catch {
    console.warn("[recrutement] Courriel en attente de réessai.");
    return false;
  }
}

export async function submitApplication(request: Request) {
  verifyOrigin(request);
  const enabled = process.env.RECRUTEMENT_CANDIDATURES_ENABLED === "true";
  if (!enabled && process.env.NODE_ENV !== "development") throw new ApplicationError(503, applicationUnavailable);

  const config = enabled ? getApplicationConfig() : null;
  const pool = config ? (await import("@/lib/db")).default : null;
  if (config && pool) await limit(pool, config.key, "submit-ip", ipScope(request), 12, 600);

  const form = await formData(request);
  if (field(form, "website", 0, false)) throw new ApplicationError(422, "Le formulaire est invalide.");
  const firstName = field(form, "firstName", 100);
  const lastName = field(form, "lastName", 100);
  const email = field(form, "email", 254).toLowerCase();
  const target = readApplicationTarget(form);
  const submissionId = field(form, "submissionId", 36, false);
  if (!/^[^\s@<>,;:"\\]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(email) || field(form, "consent", 2) !== "on") {
    throw new ApplicationError(422, "Vérifiez l’adresse e-mail et votre consentement.");
  }
  if (submissionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    throw new ApplicationError(422, "Le formulaire est invalide.");
  }
  if (pool && config) await limit(pool, config.key, "submit-email", email, 3, 3600);
  const job = target.slug ? await getJob(target.slug) : null;
  if (target.slug && (!job || !isOpen(job))) throw new ApplicationError(409, "Les candidatures pour cette offre sont closes.");

  const documents = await Promise.all([
    readDocument(form.get("cv"), "cv", true),
    readDocument(form.get("coverLetter"), "coverLetter", job?.coverLetterRequired ?? false),
  ]);
  if (job?.demo) throw new ApplicationError(503, "Cette offre est une démonstration. Aucune candidature n’a été enregistrée.");
  if (!pool || !config) throw new ApplicationError(503, applicationUnavailable);
  const mailer = getMailer();
  const token = createToken(config.key);
  const id = randomUUID();
  const submissionKey = submissionId ? submissionHash(config.key, target.slug ?? ":spontaneous", email, submissionId.toLowerCase()) : null;
  const queued = "Votre candidature a été enregistrée. L’envoi de l’e-mail de validation est en attente. Votre candidature restera en attente jusqu’à la validation de votre adresse.";
  let notification: string;
  try {
    notification = await transaction(pool, async (connection) => {
      let jobTitle: string | null = null;
      if (target.slug) {
        const [[currentJob]] = await connection.execute<(RowDataPacket & { title: string; cover_letter_required: number })[]>(
          `SELECT title, cover_letter_required FROM recruitment_jobs
           WHERE slug = ? AND published_at <= UTC_TIMESTAMP() AND closed = 0
             AND (deadline IS NULL OR deadline > UTC_TIMESTAMP()) FOR UPDATE`, [target.slug],
        );
        if (!currentJob) throw new ApplicationError(409, "Les candidatures pour cette offre sont closes.");
        if (currentJob.cover_letter_required && !documents[1]) {
          throw new ApplicationError(422, "La lettre de motivation doit être jointe au formulaire.");
        }
        jobTitle = currentJob.title;
      }
      await connection.execute(
        `INSERT INTO recrutement_candidatures
         (id, application_type, job_slug, job_title, first_name, last_name, email, phone, motivation, city, nationality,
          desired_position, consented_at, created_at, token_hash, token_expires_at, submission_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 48 HOUR), ?)`,
        [id, target.type, target.slug, jobTitle, firstName, lastName, email, target.phone, target.motivation,
          target.city, target.nationality, target.desiredPosition, tokenHash(token), submissionKey],
      );
      for (const document of documents) {
        if (!document) continue;
        await connection.execute(
          `INSERT INTO recrutement_documents (id, application_id, kind, mime_type, extension, content)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [randomUUID(), id, document.kind, document.mimeType, document.extension, document.content],
        );
      }
      return queueEmail(connection, id, "verification", { token, key: config.key });
    });
  } catch (error) {
    if (submissionKey && error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY") {
      return reply("Si une validation est nécessaire, le lien de confirmation sera envoyé à l’adresse indiquée. Vérifiez également vos courriers indésirables.", 202);
    }
    throw error;
  }
  const delivered = await sendIfAvailable(pool, config, mailer, notification);
  return delivered
    ? reply("Votre candidature a été enregistrée. Un e-mail de validation vous a été envoyé. Votre candidature ne sera transmise au recruteur qu’après avoir cliqué sur le lien de validation.", 201)
    : reply(queued, 202);
}

async function tokenFromRequest(request: Request, key: Buffer) {
  const bounded = await boundedBody(request, "application/json", 1024);
  let payload: { token?: unknown } | null;
  try {
    payload = await bounded.json();
  } catch {
    throw new ApplicationError(400, "Ce lien de validation est invalide.", "invalid");
  }
  return readToken(payload?.token, key);
}

export async function processConfirmation(request: Request, operation: "validate" | "resend") {
  verifyOrigin(request);
  const config = getApplicationConfig();
  const key = config.key;
  const pool = (await import("@/lib/db")).default;
  const ip = ipScope(request);
  await limit(pool, key, `${operation}-ip`, ip, 20, 600);
  const token = await tokenFromRequest(request, key);
  await limit(pool, key, `${operation}-token`, token, 4, 1800);
  const mailer = getMailer();
  const notifications = await transaction(pool, async (connection) => {
    const [rows] = await connection.execute<ApplicationRow[]>(
      `SELECT id, token_expires_at <= UTC_TIMESTAMP() AS expired FROM recrutement_candidatures
       WHERE token_hash = ? AND validated_at IS NULL FOR UPDATE`, [tokenHash(token)],
    );
    const application = rows[0];
    if (!application) throw new ApplicationError(409, "Ce lien a déjà été utilisé ou remplacé.", "invalid");
    if (operation === "resend") {
      if (!application.expired) throw new ApplicationError(409, "Le lien actuel est encore valide.", "active");
      const replacement = createToken(key);
      await connection.execute(
        `UPDATE recrutement_candidatures SET token_hash = ?, token_expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 48 HOUR)
         WHERE id = ?`,
        [tokenHash(replacement), application.id],
      );
      return [await queueEmail(connection, application.id, "verification", { token: replacement, key })];
    }
    if (application.expired) throw new ApplicationError(410, "Ce lien a expiré. Demandez un nouveau lien de validation.", "expired");
    await connection.execute(
      "UPDATE recrutement_candidatures SET validated_at = UTC_TIMESTAMP(), token_hash = NULL WHERE id = ?", [application.id],
    );
    return [
      await queueEmail(connection, application.id, "recruiter"),
      await queueEmail(connection, application.id, "candidate"),
    ];
  });
  const firstSent = await sendIfAvailable(pool, config, mailer, notifications[0]);
  if (operation === "resend") {
    return firstSent
      ? reply("Un nouveau lien de validation vous a été envoyé.")
      : reply("L’envoi de votre nouveau lien de validation est en attente.", 202);
  }
  if (firstSent) {
    await sendIfAvailable(pool, config, mailer, notifications[1]);
    return reply("Votre adresse e-mail a été validée et votre candidature a bien été transmise.");
  }
  return reply("Votre adresse e-mail a été validée. La notification au recruteur est en attente.", 202);
}

export async function retryNotifications(request: Request) {
  const secret = process.env.RECRUTEMENT_OUTBOX_SECRET;
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || secret.length < 32 || provided.byteLength !== expected.byteLength || !timingSafeEqual(provided, expected)) {
    throw new ApplicationError(404, "Ressource indisponible.");
  }
  const config = getApplicationConfig();
  const mailer = getMailer();
  const pool = (await import("@/lib/db")).default;
  await pool.execute("DELETE FROM recrutement_rate_limits WHERE expires_at <= UTC_TIMESTAMP() LIMIT 1000");
  const [rows] = await pool.execute<(RowDataPacket & { id: string })[]>(
    `SELECT id FROM recrutement_emails WHERE sent_at IS NULL AND next_attempt_at <= UTC_TIMESTAMP()
     ORDER BY next_attempt_at ASC, id ASC LIMIT 10`,
  );
  await Promise.all(rows.map(({ id }) => sendIfAvailable(pool, config, mailer, id)));
  return reply("Traitement de la file effectué.");
}

