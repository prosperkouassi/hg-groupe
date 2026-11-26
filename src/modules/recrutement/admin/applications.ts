import { createHmac } from "node:crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import pool from "@/lib/db";
import { createDownloadTicket, verifyDownloadTicket } from "../server/downloads";
import { queueEmail } from "../server/email";
import { ApplicationError, createToken, getApplicationConfig, getRecruitmentTokenKey, limit, tokenHash } from "../server/security";
import { loadRecruitmentSettings } from "./settings";

export type ApplicationActor = { id: number; role: "admin" | "manager" | "recruiter" };
export type ApplicationType = "job_application" | "spontaneous_application";
export const workflowStatuses = ["validated", "rejected", "reviewing", "shortlisted", "not_selected", "hired"] as const;
type WorkflowStatus = typeof workflowStatuses[number];
export type ApplicationStatus = WorkflowStatus | "pending" | "expired";
export type ApplicationQuery = { q?: string; offer?: string; status?: string; validation?: string; from?: string; to?: string; sort?: string; page?: string | number };

type ApplicationRow = RowDataPacket & {
  id: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  jobSlug: string | null;
  jobTitle: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  nationality: string | null;
  desiredPosition: string | null;
  motivation: string | null;
  consentedAt: string | null;
  createdAt: string;
  validatedAt: string | null;
};
type DocumentRow = RowDataPacket & { id: string; kind: "cv" | "coverLetter"; extension: string; bytes: number };
type NoteRow = RowDataPacket & { id: number; actorId: number; actorName: string | null; note: string; createdAt: string };
type ActivityRow = RowDataPacket & {
  id: number; applicationId: string; actorId: number; action: string;
  fromStatus: ApplicationStatus | null; toStatus: ApplicationStatus | null; createdAt: string; actorName?: string | null;
};
type Predicate = { sql: string; args: (string | number)[] };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const status = `CASE WHEN c.validated_at IS NOT NULL THEN c.workflow_status
  WHEN c.token_expires_at <= UTC_TIMESTAMP() THEN 'expired' ELSE 'pending' END`;
const privateField = (field: string, alias: string) => `IF(c.validated_at IS NOT NULL, c.${field}, NULL) AS ${alias}`;
const utc = (field: string) => `DATE_FORMAT(${field}, '%Y-%m-%dT%H:%i:%sZ')`;
const fields = `c.id, c.application_type AS applicationType, c.job_slug AS jobSlug, c.job_title AS jobTitle,
  ${status} AS status, ${utc("c.created_at")} AS createdAt,
  ${utc("c.validated_at")} AS validatedAt,
  ${privateField("first_name", "firstName")}, ${privateField("last_name", "lastName")},
  ${privateField("email", "email")}, ${privateField("phone", "phone")}, ${privateField("city", "city")},
  ${privateField("nationality", "nationality")}, ${privateField("desired_position", "desiredPosition")},
  ${privateField("motivation", "motivation")}, ${utc("IF(c.validated_at IS NOT NULL, c.consented_at, NULL)")} AS consentedAt`;
const eventFields = `e.id, e.application_id AS applicationId, e.actor_id AS actorId, e.action,
  e.from_status AS fromStatus, e.to_status AS toStatus, ${utc("e.created_at")} AS createdAt`;
const noStore = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function unavailable(): never {
  throw new ApplicationError(404, "Ressource indisponible.");
}

function badInput(): never {
  throw new ApplicationError(422, "Vérifiez les paramètres de cette opération.");
}

function workflow(value: unknown): value is WorkflowStatus {
  return typeof value === "string" && (workflowStatuses as readonly string[]).includes(value);
}

function scope(actor: ApplicationActor): Predicate {
  if (!Number.isSafeInteger(actor.id) || actor.id < 1) return unavailable();
  if (actor.role === "admin" || actor.role === "manager") return { sql: "1 = 1", args: [] };
  if (actor.role !== "recruiter") return unavailable();
  return {
    sql: `c.application_type = 'job_application' AND c.validated_at IS NOT NULL
      AND EXISTS (SELECT 1 FROM recruitment_admin_offer_access s WHERE s.offer_slug = c.job_slug AND s.admin_id = ?)`,
    args: [actor.id],
  };
}

function condition(actor: ApplicationActor, type: ApplicationType, filters: ApplicationQuery = {}): Predicate {
  if (type !== "job_application" && type !== "spontaneous_application") return badInput();
  const base = scope(actor);
  const clauses = [base.sql, "c.application_type = ?"];
  const args = [...base.args, type];
  const q = filters.q?.trim();
  if (q) {
    if (q.length > 180) return badInput();
    clauses.push(`(LOCATE(?, COALESCE(c.job_title, '')) > 0 OR
      (c.validated_at IS NOT NULL AND (
        LOCATE(?, CONCAT_WS(' ', c.first_name, c.last_name)) > 0 OR
        LOCATE(?, CONCAT_WS(' ', c.last_name, c.first_name)) > 0 OR
        LOCATE(?, c.email) > 0 OR LOCATE(?, c.phone) > 0 OR LOCATE(?, COALESCE(c.desired_position, '')) > 0
      )))`);
    args.push(q, q, q, q, q, q);
  }
  if (type === "job_application" && filters.offer) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(filters.offer) || filters.offer.length > 140) return badInput();
    clauses.push("c.job_slug = ?");
    args.push(filters.offer);
  }
  if (filters.status) {
    if (filters.status !== "pending" && filters.status !== "expired" && !workflow(filters.status)) return badInput();
    clauses.push(`(${status}) = ?`);
    args.push(filters.status);
  }
  if (filters.validation) {
    if (filters.validation !== "validated" && filters.validation !== "unconfirmed") return badInput();
    clauses.push(filters.validation === "validated" ? "c.validated_at IS NOT NULL" : "c.validated_at IS NULL");
  }
  for (const [value, clause] of [
    [filters.from, "c.created_at >= CAST(? AS DATE)"],
    [filters.to, "c.created_at < DATE_ADD(CAST(? AS DATE), INTERVAL 1 DAY)"],
  ] as const) {
    if (!value) continue;
    const date = new Date(value);
    if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(date.getTime())
      || date.toISOString().slice(0, 10) !== value) return badInput();
    clauses.push(clause);
    args.push(value);
  }
  return { sql: clauses.map((clause) => `(${clause})`).join(" AND "), args };
}

async function transaction<T>(run: (connection: PoolConnection) => Promise<T>) {
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

export async function listApplications(actor: ApplicationActor, type: ApplicationType, query: ApplicationQuery) {
  const filter = condition(actor, type, query);
  const countFilter = condition(actor, type, { ...query, status: undefined });
  const offerFilter = condition(actor, type);
  const pageSize = 25;
  const requested = Math.max(1, Math.min(100000, Math.trunc(Number(query.page)) || 1));
  const [[counts], [offers]] = await Promise.all([
    pool.execute<(RowDataPacket & { status: ApplicationStatus; total: number })[]>(
      `SELECT ${status} AS status, COUNT(*) AS total FROM recrutement_candidatures c WHERE ${countFilter.sql} GROUP BY status`,
      countFilter.args,
    ),
    type === "job_application" ? pool.execute<(RowDataPacket & { slug: string; title: string })[]>(
      `SELECT c.job_slug AS slug, MAX(c.job_title) AS title
        FROM recrutement_candidatures c WHERE c.job_slug IS NOT NULL AND ${offerFilter.sql}
        GROUP BY c.job_slug ORDER BY title, slug`, offerFilter.args,
    ) : Promise.resolve([[]] as const),
  ]);
  const statusCounts: Partial<Record<ApplicationStatus, number>> = Object.fromEntries(
    counts.map((row) => [row.status, Number(row.total)]),
  );
  const allStatuses = counts.reduce((sum, row) => sum + Number(row.total), 0);
  const total = query.status ? statusCounts[query.status as ApplicationStatus] ?? 0 : allStatuses;
  const page = Math.min(requested, Math.max(1, Math.ceil(total / pageSize)));
  const order = query.sort === "oldest" ? "ASC" : "DESC";
  const [rows] = await pool.execute<ApplicationRow[]>(
    `SELECT ${fields} FROM recrutement_candidatures c WHERE ${filter.sql}
      ORDER BY c.created_at ${order}, c.id ${order} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`, filter.args,
  );
  return { rows, total, page, pageSize, statusCounts, allStatuses, offers };
}

export async function getApplication(actor: ApplicationActor, type: ApplicationType, id: string) {
  if (!uuid.test(id)) return unavailable();
  const filter = condition(actor, type);
  const [[row]] = await pool.execute<ApplicationRow[]>(
    `SELECT ${fields} FROM recrutement_candidatures c WHERE c.id = ? AND ${filter.sql}`, [id, ...filter.args],
  );
  if (!row) return unavailable();
  const [history] = await pool.execute<ActivityRow[]>(
    `SELECT ${eventFields}, u.name AS actorName FROM recruitment_admin_application_events e
      LEFT JOIN admin_users u ON u.id = e.actor_id
      WHERE e.application_id = ? ORDER BY e.created_at DESC, e.id DESC LIMIT 100`, [id],
  );
  if (!row.validatedAt) return { ...row, documents: [] as DocumentRow[], notes: [] as NoteRow[], history };
  const [[documents], [notes]] = await Promise.all([
    pool.execute<DocumentRow[]>(`SELECT id, kind, extension, OCTET_LENGTH(content) AS bytes
      FROM recrutement_documents WHERE application_id = ? ORDER BY kind`, [id]),
    pool.execute<NoteRow[]>(`SELECT n.id, n.actor_id AS actorId, u.name AS actorName, n.note, ${utc("n.created_at")} AS createdAt
      FROM recruitment_admin_application_notes n LEFT JOIN admin_users u ON u.id = n.actor_id
      WHERE n.application_id = ? ORDER BY n.created_at DESC, n.id DESC LIMIT 100`, [id]),
  ]);
  return { ...row, documents, notes, history };
}

async function event(connection: PoolConnection, actor: ApplicationActor, row: Pick<ApplicationRow, "id" | "applicationType" | "status">,
  action: "status" | "note" | "delete" | "resend" | "download", next: ApplicationStatus | null = null) {
  await connection.execute(
    `INSERT INTO recruitment_admin_application_events
      (application_id, application_type, actor_id, action, from_status, to_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())`, [row.id, row.applicationType, actor.id, action, row.status, next],
  );
}

export async function mutateApplication(actor: ApplicationActor, type: ApplicationType, action: string, input: {
  id?: unknown; ids?: unknown; status?: unknown; note?: unknown; confirm?: unknown;
}) {
  if (!["status", "note", "delete", "resend"].includes(action)) return badInput();
  const ids = Array.isArray(input.ids) ? [...new Set(input.ids)] : [input.id];
  if (!ids.length || ids.length > 25 || !ids.every((id): id is string => typeof id === "string" && uuid.test(id))) return badInput();
  if ((action === "note" || action === "resend") && ids.length !== 1) return badInput();
  if (action === "delete" && actor.role !== "admin") return unavailable();
  if (action === "delete" && input.confirm !== true) return badInput();
  if (action === "resend" && actor.role === "recruiter") return unavailable();
  const filter = condition(actor, type);
  const note = typeof input.note === "string" ? input.note.replace(/\r\n/g, "\n").trim() : "";
  if (action === "note" && (!note || note.length > 4000 || /[\x00-\x08\x0b-\x1f\x7f]/.test(note))) return badInput();
  const next = input.status;
  if (action === "status" && !workflow(next)) return badInput();
  const config = action === "resend" ? getApplicationConfig() : null;
  if (config) await limit(pool, config.key, "admin-application-resend", String(actor.id), 20, 3600);
  const confirmationHours = config ? (await loadRecruitmentSettings()).confirmationHours : 48;

  return transaction(async (connection) => {
    const [rows] = await connection.execute<ApplicationRow[]>(
      `SELECT c.id, c.application_type AS applicationType, ${status} AS status, c.validated_at AS validatedAt
        FROM recrutement_candidatures c WHERE c.id IN (${ids.map(() => "?").join(",")})
        AND ${filter.sql} ORDER BY c.id FOR UPDATE`, [...ids, ...filter.args],
    );
    if (rows.length !== ids.length) return unavailable();
    if ((action === "status" || action === "note") && rows.some(({ validatedAt }) => !validatedAt)) {
      throw new ApplicationError(409, "L’adresse e-mail doit être validée avant l’étude du dossier.");
    }
    let affected = 0;
    for (const row of rows) {
      if (action === "status" && workflow(next) && row.status !== next) {
        await connection.execute("UPDATE recrutement_candidatures SET workflow_status = ? WHERE id = ?", [next, row.id]);
        await event(connection, actor, row, "status", next);
      } else if (action === "note") {
        await connection.execute(`INSERT INTO recruitment_admin_application_notes
          (application_id, actor_id, note, created_at) VALUES (?, ?, ?, UTC_TIMESTAMP())`, [row.id, actor.id, note]);
        await event(connection, actor, row, "note");
      } else if (action === "delete") {
        await event(connection, actor, row, "delete");
        await connection.execute("DELETE FROM recrutement_candidatures WHERE id = ?", [row.id]);
      } else if (action === "resend" && config) {
        if (row.status !== "expired") throw new ApplicationError(409, "Seul un lien expiré peut être renouvelé.");
        const replacement = createToken(config.key);
        await connection.execute(`UPDATE recrutement_candidatures SET token_hash = ?,
          token_expires_at = TIMESTAMPADD(HOUR, ?, UTC_TIMESTAMP()) WHERE id = ?`, [tokenHash(replacement), confirmationHours, row.id]);
        await queueEmail(connection, row.id, "verification", { token: replacement, key: config.key });
        await event(connection, actor, row, "resend", "pending");
      } else {
        continue;
      }
      affected++;
    }
    return { affected, count: affected };
  });
}

function csvCell(value: string | null) {
  const text = value ?? "";
  const safe = /^(?:[\t\r\n]|[\s\uFEFF]*[=+@\-＝＋＠－])/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function exportApplications(actor: ApplicationActor, type: ApplicationType, query: ApplicationQuery) {
  if (actor.role === "recruiter") return unavailable();
  const filter = condition(actor, type, query);
  const [rows] = await pool.execute<ApplicationRow[]>(
    `SELECT ${fields} FROM recrutement_candidatures c WHERE c.validated_at IS NOT NULL AND ${filter.sql}
      ORDER BY c.created_at DESC, c.id DESC LIMIT 5001`, filter.args,
  );
  if (rows.length > 5000) throw new ApplicationError(422, "Affinez les filtres pour exporter au maximum 5 000 candidatures.");
  const lines = [
    ["Nom", "Prénom", "E-mail", "Téléphone", "Offre", "Ville", "Nationalité", "Poste souhaité", "Réception UTC", "Validation UTC", "Statut"],
    ...rows.map((row) => [row.lastName, row.firstName, row.email, row.phone, row.jobTitle, row.city, row.nationality,
      row.desiredPosition, row.createdAt, row.validatedAt, row.status]),
  ];
  return new Response(`\uFEFF${lines.map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`, {
    headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type === "job_application" ? "candidatures" : "candidatures-spontanees"}.csv"` },
  });
}

function documentKey(actor: ApplicationActor, id: string) {
  scope(actor);
  const allowed = (process.env.RECRUTEMENT_DOCUMENT_ADMIN_IDS ?? "").split(",").map((value) => value.trim());
  if (!uuid.test(id) || (actor.role === "admin" && !allowed.includes(String(actor.id)))) return unavailable();
  return createHmac("sha256", getRecruitmentTokenKey()).update("recruitment-admin-audited-document-v1").digest();
}

export async function issueAdminDocument(actor: ApplicationActor, id: string) {
  const key = documentKey(actor, id);
  const filter = scope(actor);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 1 FROM recrutement_documents d JOIN recrutement_candidatures c ON c.id = d.application_id
      WHERE d.id = ? AND c.validated_at IS NOT NULL AND ${filter.sql}`, [id, ...filter.args],
  );
  if (!rows.length) return unavailable();
  return { ticket: createDownloadTicket(key, id, actor.id, Math.floor(Date.now() / 1000)), expiresIn: 300 };
}

export async function readAdminDocument(actor: ApplicationActor, id: string, ticket: string) {
  const key = documentKey(actor, id);
  if (!verifyDownloadTicket(key, id, actor.id, ticket, Math.floor(Date.now() / 1000))) return unavailable();
  const filter = scope(actor);
  const document = await transaction(async (connection) => {
    const [[row]] = await connection.execute<(ApplicationRow & { content: Buffer; extension: string })[]>(
      `SELECT c.id, c.application_type AS applicationType, ${status} AS status, d.content, d.extension
        FROM recrutement_documents d JOIN recrutement_candidatures c ON c.id = d.application_id
        WHERE d.id = ? AND c.validated_at IS NOT NULL AND ${filter.sql} FOR UPDATE`, [id, ...filter.args],
    );
    if (!row || !["pdf", "doc", "docx"].includes(row.extension)) return unavailable();
    await event(connection, actor, row, "download");
    return row;
  });
  return new Response(new Uint8Array(document.content), {
    headers: { ...noStore, "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="document-${id}.${document.extension}"`,
      "Content-Security-Policy": "sandbox" },
  });
}

export async function getApplicationDashboard(actor: ApplicationActor) {
  const filter = scope(actor);
  const job = "c.application_type = 'job_application'";
  const unrestrictedCounts = actor.role === "recruiter" ? "" : `
      COUNT(CASE WHEN ${job} AND c.validated_at IS NULL AND c.token_expires_at > UTC_TIMESTAMP() THEN 1 END) AS pending,
      COUNT(CASE WHEN c.application_type = 'spontaneous_application' THEN 1 END) AS spontaneous,`;
  const [[[counts]], [recent], [activity]] = await Promise.all([
    pool.execute<(RowDataPacket & { pending?: number; validated: number; reviewing: number; shortlisted: number;
      today: number; week: number; spontaneous?: number })[]>(`
      SELECT ${unrestrictedCounts}
        COUNT(CASE WHEN ${job} AND c.validated_at IS NOT NULL THEN 1 END) AS validated,
        COUNT(CASE WHEN ${job} AND c.validated_at IS NOT NULL AND c.workflow_status = 'reviewing' THEN 1 END) AS reviewing,
        COUNT(CASE WHEN ${job} AND c.validated_at IS NOT NULL AND c.workflow_status = 'shortlisted' THEN 1 END) AS shortlisted,
        COUNT(CASE WHEN ${job} AND c.created_at >= UTC_DATE() AND c.created_at < DATE_ADD(UTC_DATE(), INTERVAL 1 DAY) THEN 1 END) AS today,
        COUNT(CASE WHEN ${job} AND c.created_at >= DATE_SUB(UTC_DATE(), INTERVAL WEEKDAY(UTC_DATE()) DAY)
          AND c.created_at < DATE_ADD(UTC_DATE(), INTERVAL 1 DAY) THEN 1 END) AS week
      FROM recrutement_candidatures c WHERE ${filter.sql}`, filter.args),
    pool.execute<ApplicationRow[]>(`SELECT ${fields} FROM recrutement_candidatures c WHERE ${filter.sql}
      ORDER BY c.created_at DESC, c.id DESC LIMIT 6`, filter.args),
    pool.execute<ActivityRow[]>(`SELECT ${eventFields} FROM recruitment_admin_application_events e
      JOIN recrutement_candidatures c ON c.id = e.application_id WHERE ${filter.sql}
      ORDER BY e.created_at DESC, e.id DESC LIMIT 8`, filter.args),
  ]);
  return { ...counts, recent, activity };
}
