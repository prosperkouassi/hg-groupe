import { createHash, randomUUID } from "node:crypto";

import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import nodemailer from "nodemailer";

import { resolveRecipients, type RecruitmentSettings } from "../admin/settings";
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

export function getMailer(settings?: RecruitmentSettings) {
  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASSWORD: pass, SMTP_SECURE: secure,
    RECRUTEMENT_EMAIL_FROM: legacyFrom, RECRUTEMENT_EMAIL_ADMIN: administrator } = process.env;
  const from = settings?.sender || legacyFrom;
  const admin = administrator?.trim();
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
    from, admin, settings,
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

function messageFor(email: QueuedEmail, origin: string, admin: string, candidateToken: string | null,
  settings?: RecruitmentSettings) {
  const spontaneous = email.application_type === "spontaneous_application";
  const job = spontaneous ? "Candidature spontanée" : (email.job_title ?? "Offre d’emploi");
  const application = spontaneous ? "Votre candidature spontanée" : `Votre candidature au poste « ${job} »`;
  const desiredPosition = spontaneous && email.desired_position ? `Poste souhaité : ${email.desired_position}` : "";
  const signature = settings?.signature ?? process.env.RECRUTEMENT_EMAIL_SIGNATURE ?? "L’équipe recrutement Hopla Groupe";
  if (email.kind === "verification" && candidateToken) {
    const url = new URL("/recrutement/confirmation", origin);
    url.hash = new URLSearchParams({ token: candidateToken }).toString();
    return {
      to: { name: "", address: email.email },
      subject: settings?.verificationSubject ?? process.env.RECRUTEMENT_EMAIL_VERIFICATION_SUBJECT ?? "Confirmez votre candidature — Hopla",
      text: [
        `${application}.`,
        settings?.verificationBody ?? process.env.RECRUTEMENT_EMAIL_VERIFICATION_BODY ?? "Votre candidature ne sera transmise au recruteur qu’après validation.",
        `Valider mon e-mail : ${url.href}`,
        signature,
      ].join("\n\n"),
    };
  }
  if (email.kind === "recruiter") {
    const url = new URL(spontaneous ? "/admin/recrutement/spontanees" : "/admin/recrutement/candidatures", origin);
    url.searchParams.set("id", email.application_id);
    const date = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long", timeStyle: "short", timeZone: "Africa/Abidjan",
    }).format(new Date(email.created_at_iso));
    return {
      to: { name: "", address: admin },
      subject: (settings?.recruiterSubject ?? process.env.RECRUTEMENT_EMAIL_RECRUITER_SUBJECT ?? "Nouvelle candidature validée — [Poste]").replaceAll("[Poste]", () => job.replace(/[\r\n]/g, " ")),
      text: [
        settings?.recruiterBody ?? process.env.RECRUTEMENT_EMAIL_RECRUITER_BODY ?? "Une candidature validée est disponible.",
        [`${email.first_name} ${email.last_name} — ${job}`, desiredPosition,
          `Type : ${spontaneous ? "candidature spontanée" : "candidature sur offre"}`, `Candidature reçue le ${date}.`].filter(Boolean).join("\n"),
        `Espace sécurisé : ${url.href}`,
        signature,
      ].join("\n\n"),
    };
  }
  return {
    to: { name: "", address: email.email },
    subject: settings?.candidateSubject ?? process.env.RECRUTEMENT_EMAIL_CANDIDATE_SUBJECT ?? "Votre candidature a bien été transmise — Hopla",
    text: [
      `${application} a bien été transmise.`,
      desiredPosition,
      settings?.candidateBody ?? process.env.RECRUTEMENT_EMAIL_CANDIDATE_BODY ??
        (spontaneous ? "Notre équipe vous contactera si une opportunité correspond à votre profil." :
          "Le délai de réponse dépend de l’offre. Notre équipe vous contactera si votre profil est retenu."),
      signature,
    ].filter(Boolean).join("\n\n"),
  };
}

async function sendRecruiterNotifications(
  pool: Pool, mailer: ReturnType<typeof getMailer>, id: string, lease: string,
  hostname: string, message: ReturnType<typeof messageFor>,
) {
  const recipients = mailer.settings ? resolveRecipients(mailer.settings, mailer.admin) : [mailer.admin];
  const [accepted] = await pool.execute<(RowDataPacket & { digest: string })[]>(
    "SELECT LOWER(HEX(recipient_hash)) AS digest FROM recruitment_admin_mail_receipts WHERE outbox_id = ?",
    [id],
  );
  const sent = new Set(accepted.map(({ digest }) => digest));
  for (const address of recipients) {
    const digest = createHash("sha256").update(address.toLowerCase()).digest("hex");
    if (sent.has(digest)) continue;
    const result = await mailer.transporter.sendMail({
      ...message,
      to: { name: "", address },
      from: { name: "Hopla Groupe", address: mailer.from },
      messageId: `<recrutement-${id}-${digest.slice(0, 16)}@${hostname}>`,
    });
    if (result.accepted.length !== 1) throw new Error("Recruitment email was not accepted");
    const [receipt] = await pool.execute<ResultSetHeader>(
      `INSERT INTO recruitment_admin_mail_receipts (outbox_id, recipient_hash, accepted_at)
       SELECT id, UNHEX(?), UTC_TIMESTAMP() FROM recrutement_emails WHERE id = ? AND lease = ?`,
      [digest, id, lease],
    );
    if (receipt.affectedRows !== 1) throw new Error("Recruitment delivery lease expired");
  }
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
    const hostname = new URL(config.origin).hostname;
    const message = messageFor(email, config.origin, mailer.admin, token, mailer.settings);
    if (email.kind === "recruiter" && mailer.settings) {
      await sendRecruiterNotifications(pool, mailer, id, lease, hostname, message);
    } else {
      const result = await mailer.transporter.sendMail({
        from: { name: "Hopla Groupe", address: mailer.from },
        messageId: `<recrutement-${id}@${hostname}>`,
        ...message,
      });
      if (result.accepted.length !== 1) throw new Error("Recruitment email was not accepted");
    }
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

