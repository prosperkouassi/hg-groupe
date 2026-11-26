import type { RowDataPacket } from "mysql2";

import { RecruitmentAdminError, requireRecruitmentRole, type Actor } from "./permissions";

const formats = ["pdf", "doc", "docx"] as const;
const mailbox = /^[^\s<>,;@]+@[^\s<>,;@]+\.[^\s<>,;@]+$/;
const notificationMailbox = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

function configuredAdministrator() {
  const address = process.env.RECRUTEMENT_EMAIL_ADMIN?.trim() ?? "";
  return address.length <= 254 && notificationMailbox.test(address) ? address : "";
}

function defaults() {
  return {
    administratorEmail: configuredAdministrator(),
    sender: process.env.RECRUTEMENT_EMAIL_FROM ?? "",
    additionalRecipient: "",
    additionalRecipientConfirmed: false,
    signature: process.env.RECRUTEMENT_EMAIL_SIGNATURE ?? "L’équipe recrutement Hopla Groupe",
    verificationSubject: process.env.RECRUTEMENT_EMAIL_VERIFICATION_SUBJECT ?? "Confirmez votre candidature — Hopla",
    verificationBody: process.env.RECRUTEMENT_EMAIL_VERIFICATION_BODY ?? "Votre candidature sera transmise après validation de votre adresse e-mail.",
    recruiterSubject: process.env.RECRUTEMENT_EMAIL_RECRUITER_SUBJECT ?? "Nouvelle candidature validée — [Poste]",
    recruiterBody: process.env.RECRUTEMENT_EMAIL_RECRUITER_BODY ?? "Une candidature validée est disponible.",
    candidateSubject: process.env.RECRUTEMENT_EMAIL_CANDIDATE_SUBJECT ?? "Votre candidature a bien été transmise — Hopla",
    candidateBody: process.env.RECRUTEMENT_EMAIL_CANDIDATE_BODY ?? "Votre candidature a été transmise à l’équipe recrutement.",
    confirmationHours: 48,
    allowedFormats: [...formats],
    maxFileMiB: 5,
    consentText: "J’accepte le traitement de mes données pour l’étude de ma candidature.",
    retentionDays: 365,
    anonymize: false,
    automaticDeletion: false,
    ipLimit: 12,
    emailLimit: 3,
    honeypot: true as const,
  };
}

export type RecruitmentSettings = ReturnType<typeof defaults>;

const settingsCategories = {
  messagerie: ["sender", "additionalRecipient", "signature"],
  modeles: ["verificationSubject", "verificationBody", "recruiterSubject", "recruiterBody", "candidateSubject", "candidateBody"],
  candidatures: ["consentText", "allowedFormats", "maxFileMiB", "confirmationHours"],
  securite: ["ipLimit", "emailLimit"],
  conservation: ["retentionDays", "anonymize", "automaticDeletion"],
} as const satisfies Record<string, readonly (keyof RecruitmentSettings)[]>;

function isCategory(value: unknown): value is keyof typeof settingsCategories {
  return typeof value === "string" && Object.hasOwn(settingsCategories, value);
}

export function parseSettings(input: Record<string, unknown>, allowUnconfigured = false): RecruitmentSettings {
  const text = (key: string, max: number, singleLine = false) => {
    const value = input[key];
    if (typeof value !== "string" || !value.trim() || value.length > max ||
      (singleLine && /[\r\n]/.test(value))) {
      throw new RecruitmentAdminError(422, `Vérifiez le champ « ${key} ».`);
    }
    return value.trim();
  };
  const email = (key: string) => {
    if (allowUnconfigured && input[key] === "") return "";
    const address = text(key, 254, true);
    if (!mailbox.test(address)) {
      throw new RecruitmentAdminError(422, `Adresse e-mail invalide pour « ${key} ».`);
    }
    return address;
  };
  const integer = (key: string, min: number, max: number) => {
    const value = input[key];
    const number = typeof value === "number" ? value
      : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
    if (!Number.isInteger(number) || number < min || number > max) {
      throw new RecruitmentAdminError(422, `« ${key} » doit être compris entre ${min} et ${max}.`);
    }
    return number;
  };
  const selected = input.allowedFormats;
  const allowedFormats = formats.filter((format) => Array.isArray(selected) && selected.includes(format));
  if (!allowedFormats.length || !Array.isArray(selected) || selected.length !== allowedFormats.length ||
    input.honeypot === false || input.anonymize === true && input.automaticDeletion === true) {
    throw new RecruitmentAdminError(422, "Vérifiez les formats, la protection antispam et la règle de conservation.");
  }
  return {
    administratorEmail: email("administratorEmail"),
    sender: email("sender"),
    additionalRecipient: email("additionalRecipient"),
    additionalRecipientConfirmed: false,
    signature: text("signature", 1200),
    verificationSubject: text("verificationSubject", 180, true),
    verificationBody: text("verificationBody", 6000),
    recruiterSubject: text("recruiterSubject", 180, true),
    recruiterBody: text("recruiterBody", 6000),
    candidateSubject: text("candidateSubject", 180, true),
    candidateBody: text("candidateBody", 6000),
    confirmationHours: integer("confirmationHours", 1, 48),
    allowedFormats,
    maxFileMiB: integer("maxFileMiB", 1, 5),
    consentText: text("consentText", 1000),
    retentionDays: integer("retentionDays", 1, 730),
    anonymize: input.anonymize === true,
    automaticDeletion: input.automaticDeletion === true,
    ipLimit: integer("ipLimit", 1, 12),
    emailLimit: integer("emailLimit", 1, 3),
    honeypot: true,
  };
}

function approvedAdditionalRecipient(address: string, approved: string | undefined) {
  const recipient = approved?.trim();
  return recipient && recipient.length <= 254 && notificationMailbox.test(recipient) &&
    address.toLowerCase() === recipient.toLowerCase() ? recipient : undefined;
}

export function resolveRecipients(settings: RecruitmentSettings, administrator: string,
  approved = process.env.RECRUTEMENT_EMAIL_VERIFIED_ADDITIONAL_RECIPIENT) {
  if (administrator.length > 254 || !notificationMailbox.test(administrator)) {
    throw new Error("Recruitment administrator email is invalid");
  }
  const additional = approvedAdditionalRecipient(settings.additionalRecipient, approved);
  return additional && additional.toLowerCase() !== administrator.toLowerCase()
    ? [administrator, additional]
    : [administrator];
}

function readConfiguration(raw: unknown) {
  const configuration: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)) {
    throw new RecruitmentAdminError(503, "Les réglages de recrutement sont indisponibles.");
  }
  return parseSettings(configuration as Record<string, unknown>, true);
}

export function updateSettingsCategory(previous: RecruitmentSettings, input: Record<string, unknown>) {
  const category = input.category;
  if (!isCategory(category)) throw new RecruitmentAdminError(422, "Sélectionnez une catégorie de réglages valide.");
  const values = Object.fromEntries(settingsCategories[category].map(key => [key, input[key]]));
  return parseSettings({ ...previous, ...values }, true);
}

export async function loadRecruitmentSettings() {
  const { default: pool } = await import("@/lib/db");
  const [[row]] = await pool.execute<(RowDataPacket & { configuration: unknown })[]>(
    "SELECT configuration FROM recruitment_admin_settings WHERE id = 1",
  );
  return row ? readConfiguration(row.configuration) : defaults();
}

export async function readSettings(actor: Actor) {
  requireRecruitmentRole(actor, "admin");
  const settings = await loadRecruitmentSettings();
  return {
    ...settings,
    administratorEmail: configuredAdministrator(),
    additionalRecipientConfirmed: Boolean(approvedAdditionalRecipient(
      settings.additionalRecipient, process.env.RECRUTEMENT_EMAIL_VERIFIED_ADDITIONAL_RECIPIENT,
    )),
  };
}

export async function saveSettings(actor: Actor, input: Record<string, unknown>) {
  requireRecruitmentRole(actor, "admin");
  if (!isCategory(input.category)) throw new RecruitmentAdminError(422, "Sélectionnez une catégorie de réglages valide.");
  const { default: pool } = await import("@/lib/db");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Create or lock the singleton before reading, including on the first save.
    await connection.execute(
      `INSERT INTO recruitment_admin_settings (id, configuration, updated_by, updated_at)
       VALUES (1, ?, ?, UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE id = id`,
      [JSON.stringify(defaults()), actor.id],
    );
    const [[row]] = await connection.execute<(RowDataPacket & { configuration: unknown })[]>(
      "SELECT configuration FROM recruitment_admin_settings WHERE id = 1 FOR UPDATE",
    );
    const settings = updateSettingsCategory(readConfiguration(row.configuration), input);
    await connection.execute(
      "UPDATE recruitment_admin_settings SET configuration = ?, updated_by = ?, updated_at = UTC_TIMESTAMP() WHERE id = 1",
      [JSON.stringify(settings), actor.id],
    );
    await connection.execute(
      "INSERT INTO recruitment_admin_audit (actor_id, action, created_at) VALUES (?, 'settings.updated', UTC_TIMESTAMP())",
      [actor.id],
    );
    await connection.commit();
    return { message: "Réglages enregistrés." };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function previewRetention(actor: Actor) {
  const settings = await readSettings(actor);
  const { default: pool } = await import("@/lib/db");
  const [[row]] = await pool.execute<(RowDataPacket & { eligible: number })[]>(
    "SELECT COUNT(*) AS eligible FROM recrutement_candidatures WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)",
    [settings.retentionDays],
  );
  return { eligible: Number(row.eligible), retentionDays: settings.retentionDays };
}
