import { randomUUID } from "node:crypto";

import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import nodemailer from "nodemailer";

import { sealQueuedToken, tokenHash, unsealQueuedToken } from "./security";

type EmailKind = "verification" | "recruiter" | "candidate";

type QueuedEmail = RowDataPacket & {
  application_id: string;
  kind: EmailKind;
  token: string | null;
  attempts: number;
  email: string;
  first_name: string;
  last_name: string;
  application_type: "job_application" | "spontaneous_application";
  job_title: string | null;
  desired_position: string | null;
  created_at_iso: string;
};

export function getMailer() {
  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASSWORD: pass, SMTP_SECURE: secure,
    RECRUTEMENT_EMAIL_FROM: from, RECRUTEMENT_EMAIL_ADMIN: admin } = process.env;
  const numericPort = Number(port);
  if (!host || !Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535 || !user || !pass || !from || !admin) {
    throw new Error("Recruitment email configuration is incomplete");
  }
  return {
    transporter: nodemailer.createTransport({
      host, port: numericPort, secure: secure === "true", requireTLS: secure !== "true", auth: { user, pass },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 8000,
      disableFileAccess: true, disableUrlAccess: true,
    }),
    from, admin,
  };
}

export async function queueEmail(
  connection: PoolConnection,
  applicationId: string,
  kind: EmailKind,
  verification?: { token: string; key: Buffer },
) {
  const id = randomUUID();
  await connection.execute(
    "INSERT INTO recrutement_emails (id, application_id, kind, token, token_hash, next_attempt_at) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())",
    [id, applicationId, kind, verification ? sealQueuedToken(verification.key, verification.token) : null,
      verification ? tokenHash(verification.token) : null],
  );
  return id;
}

function messageFor(email: QueuedEmail, origin: string, admin: string, candidateToken: string | null) {
  const spontaneous = email.application_type === "spontaneous_application";
  const job = spontaneous ? "Candidature spontanée" : (email.job_title ?? "Offre d’emploi");
  const application = spontaneous ? "Votre candidature spontanée" : `Votre candidature au poste « ${job} »`;
  const desiredPosition = spontaneous && email.desired_position ? `Poste souhaité : ${email.desired_position}` : "";
  const signature = process.env.RECRUTEMENT_EMAIL_SIGNATURE ?? "L’équipe recrutement Hopla Groupe";
  if (email.kind === "verification" && candidateToken) {
    const url = new URL("/recrutement/confirmation", origin);
    url.hash = new URLSearchParams({ token: candidateToken }).toString();
    return {
      to: { name: "", address: email.email },
      subject: process.env.RECRUTEMENT_EMAIL_VERIFICATION_SUBJECT ?? "Confirmez votre candidature — Hopla",
      text: [
        `${application}.`,
        process.env.RECRUTEMENT_EMAIL_VERIFICATION_BODY ?? "Votre candidature ne sera transmise au recruteur qu’après validation.",
        `Valider mon e-mail (lien valide pendant 48 heures) : ${url.href}`,
        signature,
      ].join("\n\n"),
    };
  }
  if (email.kind === "recruiter") {
    const adminPath = process.env.RECRUTEMENT_ADMIN_PATH;
    const url = new URL(adminPath && /^\/admin\/(?:[a-z0-9-]+\/)*[a-z0-9-]+$/i.test(adminPath)
      ? `${adminPath}/${email.application_id}` : "/admin", origin);
    const date = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long", timeStyle: "short", timeZone: "Africa/Abidjan",
    }).format(new Date(email.created_at_iso));
    return {
      to: { name: "", address: admin },
      subject: (process.env.RECRUTEMENT_EMAIL_RECRUITER_SUBJECT ?? "Nouvelle candidature validée — [Poste]").replaceAll("[Poste]", () => job.replace(/[\r\n]/g, " ")),
      text: [
        process.env.RECRUTEMENT_EMAIL_RECRUITER_BODY ?? "Une candidature validée est disponible.",
        [`${email.first_name} ${email.last_name} — ${job}`, desiredPosition, `Candidature reçue le ${date}.`].filter(Boolean).join("\n"),
        `Espace sécurisé : ${url.href}`,
        signature,
      ].join("\n\n"),
    };
  }
  return {
    to: { name: "", address: email.email },
    subject: process.env.RECRUTEMENT_EMAIL_CANDIDATE_SUBJECT ?? "Votre candidature a bien été transmise — Hopla",
    text: [
      `${application} a bien été transmise.`,
      desiredPosition,
      process.env.RECRUTEMENT_EMAIL_CANDIDATE_BODY ??
        (spontaneous ? "Notre équipe vous contactera si une opportunité correspond à votre profil." :
          "Le délai de réponse dépend de l’offre. Notre équipe vous contactera si votre profil est retenu."),
      signature,
    ].filter(Boolean).join("\n\n"),
  };
}

export async function deliverEmail(
  pool: Pool, config: { origin: string; key: Buffer }, mailer: ReturnType<typeof getMailer>, id: string,
) {
  const lease = randomUUID();
  const [claim] = await pool.execute<ResultSetHeader>(
    `UPDATE recrutement_emails SET lease = ?, next_attempt_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 MINUTE)
     WHERE id = ? AND sent_at IS NULL AND next_attempt_at <= UTC_TIMESTAMP()`,
    [lease, id],
  );
  if (claim.affectedRows === 0) return false;
  const [rows] = await pool.execute<QueuedEmail[]>(
    `SELECT e.application_id, e.kind, e.token, e.attempts, c.email, c.first_name, c.last_name,
       c.application_type, c.job_title, c.desired_position,
       DATE_FORMAT(c.created_at, '%Y-%m-%dT%H:%i:%sZ') AS created_at_iso
     FROM recrutement_emails e JOIN recrutement_candidatures c ON e.application_id = c.id
     WHERE e.id = ? AND e.lease = ?
       AND (e.kind <> 'verification' OR (
         c.validated_at IS NULL AND c.token_hash = e.token_hash AND c.token_expires_at > UTC_TIMESTAMP()
       ))`,
    [id, lease],
  );
  const email = rows[0];
  if (!email) {
    await pool.execute("DELETE FROM recrutement_emails WHERE id = ? AND lease = ?", [id, lease]);
    return false;
  }
  if (email.kind === "candidate") {
    const [previous] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM recrutement_emails WHERE application_id = ? AND kind = 'recruiter' AND sent_at IS NOT NULL LIMIT 1",
      [email.application_id],
    );
    if (!previous.length) return false;
  }
  try {
    const token = email.token ? unsealQueuedToken(config.key, email.token) : null;
    if (email.kind === "verification" && !token) throw new Error("Verification token unavailable");
    const result = await mailer.transporter.sendMail({
      from: { name: "Hopla Groupe", address: mailer.from },
      messageId: `<recrutement-${id}@${new URL(config.origin).hostname}>`,
      ...messageFor(email, config.origin, mailer.admin, token),
    });
    if (result.accepted.length !== 1) throw new Error("Recruitment email was not accepted");
  } catch {
    const delay = Math.min(6 * 3600, 60 * 2 ** Math.min(email.attempts, 9));
    await pool.execute(
      `UPDATE recrutement_emails SET attempts = attempts + 1, lease = NULL,
         next_attempt_at = TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP()) WHERE id = ? AND lease = ?`,
      [delay, id, lease],
    );
    console.warn("[recrutement] Courriel en attente de réessai.");
    return false;
  }
  await pool.execute(
    "UPDATE recrutement_emails SET token = NULL, token_hash = NULL, sent_at = UTC_TIMESTAMP(), lease = NULL WHERE id = ? AND lease = ?",
    [id, lease],
  );
  return true;
}

