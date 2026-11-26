import { randomUUID } from "node:crypto";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { isNationalityCode } from "../application/fields";
import { isPublicOfferAsset } from "../public-assets";
import type { Contract, Job, WorkMode } from "../types";

type Actor = { id: number; role: "admin" | "recruiter" | "manager" };
type Input = Record<string, unknown>;
export type OfferStatus = "draft" | "scheduled" | "open" | "closing" | "closed";
export const contracts = ["Stage", "Alternance", "CDD", "CDI", "Freelance", "Mission", "Temporaire"] as const;
export const workModes = ["Sur site", "Hybride", "Télétravail"] as const;

export type OfferSummary = Pick<Job, "slug" | "title" | "city" | "country" | "contract" | "workMode" | "deadline">
  & { publishedAt: string | null; status: OfferStatus; featured: boolean; recruiterId: string | null };
export type AdminOffer = Omit<Job, "publishedAt" | "demo"> & OfferSummary & { imageUrl: string | null; attachments: string[] };
export type RecruiterProfile = {
  id: string; firstName: string; lastName: string; role: string; company: "Hopla Groupe"; initials: string; offerCount: number;
};
type OfferFilters = { q?: string; status?: string; contract?: string; sort?: string; page?: number | string };
interface StatusCount extends RowDataPacket { status: OfferStatus; total: number; }
interface OfferListRow extends OfferRow { validatedApplications: number; }
interface OfferRow extends RowDataPacket, Omit<AdminOffer, "featured" | "closed" | "coverLetterRequired"> {
  featured: number;
  closed: number;
  coverLetterRequired: number;
}
interface RecruiterRow extends RowDataPacket, Pick<RecruiterProfile, "id" | "firstName" | "lastName" | "role"> {
  offerCount?: number;
}

export class OfferError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

const pageSize = 20;
const statusSQL = `CASE
  WHEN j.published_at IS NULL THEN 'draft'
  WHEN j.published_at > UTC_TIMESTAMP() THEN 'scheduled'
  WHEN j.closed = TRUE OR j.deadline <= UTC_TIMESTAMP() THEN 'closed'
  WHEN j.deadline <= UTC_TIMESTAMP() + INTERVAL 7 DAY THEN 'closing'
  ELSE 'open' END`;
const summaryColumns = `j.slug, j.title, j.city, j.country, j.contract, j.work_mode AS workMode,
  DATE_FORMAT(j.published_at, '%Y-%m-%dT%H:%i:%sZ') AS publishedAt,
  DATE_FORMAT(j.deadline, '%Y-%m-%dT%H:%i:%sZ') AS deadline, j.featured, j.recruiter_id AS recruiterId,
  ${statusSQL} AS status`;
const detailColumns = `${summaryColumns}, j.country_code AS countryCode, j.company,
  j.closed, j.cover_letter_required AS coverLetterRequired, j.positions, j.experience, j.education,
  j.salary, j.hours, DATE_FORMAT(j.start_date, '%Y-%m-%d') AS startDate, j.description,
  j.missions, j.profile, j.skills, j.benefits, j.process, j.recruiter, j.image_url AS imageUrl, j.attachments`;
const mutableColumns = `title city country country_code company contract work_mode published_at deadline closed
  cover_letter_required positions experience education salary hours start_date description
  missions profile skills benefits process recruiter recruiter_id featured image_url attachments`.split(/\s+/);

type Executor = Pick<PoolConnection, "execute">;

async function getPool() {
  return (await import("@/lib/db")).default;
}

function scope(actor: Actor) {
  return actor.role === "recruiter"
    ? { sql: "EXISTS (SELECT 1 FROM recruitment_admin_offer_access p WHERE p.offer_slug = j.slug AND p.admin_id = ?)", params: [actor.id] }
    : { sql: "TRUE", params: [] };
}

function requireAdmin(actor: Actor) {
  if (actor.role !== "admin") throw new OfferError(403, "Cette action est réservée à l’administration.");
}

function asSummary(row: OfferRow): OfferSummary {
  const { slug, title, city, country, contract, workMode, deadline, publishedAt, status, featured, recruiterId } = row;
  return { slug, title, city, country, contract, workMode, deadline, publishedAt, status, featured: Boolean(featured), recruiterId };
}

function json<T>(value: T | string | null, fallback: T): T {
  return typeof value === "string" ? JSON.parse(value) as T : value ?? fallback;
}

function asOffer(row: OfferRow): AdminOffer {
  return {
    ...asSummary(row),
    countryCode: row.countryCode, company: row.company, closed: Boolean(row.closed),
    coverLetterRequired: Boolean(row.coverLetterRequired), positions: row.positions, experience: row.experience,
    education: row.education, salary: row.salary, hours: row.hours, startDate: row.startDate, description: row.description,
    missions: json(row.missions, []), profile: json(row.profile, []), skills: json(row.skills, []),
    benefits: json(row.benefits, []), process: json(row.process, []), recruiter: json(row.recruiter, null),
    imageUrl: row.imageUrl, attachments: json(row.attachments, []),
  };
}

async function countOffersByStatus(pool: Executor, where: string, params: (string | number)[]) {
  const [rows] = await pool.execute<StatusCount[]>(
    `SELECT ${statusSQL} AS status, COUNT(*) AS total FROM recruitment_jobs j WHERE ${where} GROUP BY status`,
    params,
  );
  const total = (status: OfferStatus) => Number(rows.find(row => row.status === status)?.total ?? 0);
  return {
    open: total("open"), closing: total("closing"), scheduled: total("scheduled"),
    draft: total("draft"), closed: total("closed"),
  };
}

export async function listOffers(actor: Actor, filters: OfferFilters = {}) {
  const pool = await getPool();
  const access = scope(actor);
  const conditions = ["j.deleted_at IS NULL", access.sql];
  const params: (string | number)[] = [...access.params];
  const q = filters.q?.trim().slice(0, 120);
  if (q) {
    conditions.push("(j.title LIKE ? ESCAPE '!' OR j.city LIKE ? ESCAPE '!' OR j.slug LIKE ? ESCAPE '!')");
    const pattern = `%${q.replace(/[!%_]/g, "!$&")}%`;
    params.push(pattern, pattern, pattern);
  }
  if (isContract(filters.contract)) {
    conditions.push("j.contract = ?");
    params.push(filters.contract);
  }
  const where = conditions.join(" AND ");
  const orders: Readonly<Record<string, string>> = {
    newest: "j.published_at DESC, j.slug",
    oldest: "j.published_at ASC, j.slug",
    title: "j.title ASC, j.slug",
    deadline: "j.deadline IS NULL, j.deadline ASC, j.slug",
  };
  const order = filters.sort && Object.hasOwn(orders, filters.sort) ? orders[filters.sort] : orders.newest;
  const counts = await countOffersByStatus(pool, where, params);
  const all = counts.open + counts.closing + counts.scheduled + counts.draft + counts.closed;
  const status = filters.status && Object.hasOwn(counts, filters.status) ? filters.status as OfferStatus : undefined;
  const active = counts.open + counts.closing;
  const activeFilter = filters.status === "active";
  const total = activeFilter ? active : status ? counts[status] : all;
  const statusCondition = activeFilter ? ` AND (${statusSQL}) IN ('open', 'closing')`
    : status ? ` AND (${statusSQL}) = ?` : "";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Number(filters.page);
  const page = Number.isSafeInteger(requestedPage) ? Math.min(Math.max(1, requestedPage), totalPages) : 1;
  const [rows] = await pool.execute<OfferListRow[]>(
    `SELECT ${summaryColumns}, (SELECT COUNT(*) FROM recrutement_candidatures c
      WHERE c.job_slug = j.slug AND c.application_type = 'job_application'
        AND c.validated_at IS NOT NULL) AS validatedApplications
      FROM recruitment_jobs j WHERE ${where}${statusCondition}
      ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, ...(status ? [status] : []), pageSize, (page - 1) * pageSize],
  );
  return {
    items: rows.map(row => ({ ...asSummary(row), validatedApplications: Number(row.validatedApplications) })),
    counts: { all, active, ...counts }, total, page, totalPages,
  };
}

export async function getOfferDashboard(actor: Actor) {
  const pool = await getPool();
  const access = scope(actor);
  const where = `j.deleted_at IS NULL AND ${access.sql}`;
  const [counts, [attention]] = await Promise.all([
    countOffersByStatus(pool, where, access.params),
    pool.execute<OfferRow[]>(
      `SELECT ${summaryColumns} FROM recruitment_jobs j WHERE ${where}
        AND ((${statusSQL}) = 'closing' OR j.published_at > UTC_TIMESTAMP())
       ORDER BY CASE WHEN j.published_at > UTC_TIMESTAMP() THEN j.published_at ELSE j.deadline END ASC,
         j.slug ASC LIMIT 8`, access.params,
    ),
  ]);
  return {
    openOffers: counts.open + counts.closing,
    closedOffers: counts.closed,
    draftOffers: counts.draft,
    scheduledOffers: counts.scheduled,
    attentionOffers: attention.map(asSummary),
  };
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;

function readSlug(value: unknown) {
  if (typeof value !== "string" || value.length > 140 || !slugPattern.test(value) || value === "confirmation") {
    throw new OfferError(422, "Saisissez un slug valide, composé de lettres minuscules, de chiffres et de tirets.");
  }
  return value;
}

async function fetchOffer(db: Executor, actor: Actor, slug: string, lock = false) {
  const access = scope(actor);
  const [rows] = await db.execute<OfferRow[]>(
    `SELECT ${detailColumns} FROM recruitment_jobs j WHERE j.slug = ? AND j.deleted_at IS NULL AND ${access.sql}${lock ? " FOR UPDATE" : ""}`,
    [slug, ...access.params],
  );
  return rows[0] ? asOffer(rows[0]) : null;
}

export async function getOffer(actor: Actor, slug: string) {
  if (slug.length > 140 || !slugPattern.test(slug) || slug === "confirmation") return null;
  return fetchOffer(await getPool(), actor, slug);
}

function asRecruiter(row: RecruiterRow): RecruiterProfile {
  const { id, firstName, lastName, role, offerCount } = row;
  return { id, firstName, lastName, role, company: "Hopla Groupe",
    initials: ([...firstName][0] + [...lastName][0]).toLocaleUpperCase("fr"), offerCount: Number(offerCount ?? 0) };
}

export async function listRecruiters(actor: Actor) {
  const pool = await getPool();
  const access = scope(actor);
  const [rows] = await pool.execute<RecruiterRow[]>(
    `SELECT r.id, r.first_name AS firstName, r.last_name AS lastName, r.role,
      (SELECT COUNT(*) FROM recruitment_jobs j WHERE j.recruiter_id = r.id AND j.deleted_at IS NULL AND ${access.sql}) AS offerCount
    FROM recruitment_recruiters r ORDER BY r.last_name, r.first_name, r.id`, access.params,
  );
  return rows.map(asRecruiter);
}

function text(input: Input, key: string, max: number, required: boolean): string | null {
  const value = input[key];
  if ((value === null || value === undefined || value === "") && !required) return null;
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new OfferError(422, `Vérifiez le champ « ${key} ».`);
  }
  return value.trim() || null;
}

function requiredText(input: Input, key: string, max: number) {
  return text(input, key, max, true)!;
}

function isContract(value: unknown): value is Contract {
  return contracts.some(contract => contract === value);
}

function isWorkMode(value: unknown): value is WorkMode {
  return workModes.some(mode => mode === value);
}

function dateValue(value: unknown, dateOnly = false) {
  if (value === undefined || value === null || value === "") return null;
  const format = dateOnly ? /^\d{4}-\d{2}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z?$/;
  if (typeof value === "string" && format.test(value) && Number(value.slice(0, 4)) >= 1000) {
    const iso = dateOnly ? `${value}T00:00:00Z` : `${value.replace(/Z$/, "")}${value.replace(/Z$/, "").length === 16 ? ":00" : ""}Z`;
    const date = new Date(iso);
    if (!Number.isNaN(date.valueOf()) && date.toISOString().replace(".000Z", "Z") === iso) {
      return dateOnly ? value : iso;
    }
  }
  throw new OfferError(422, "Indiquez une date valide en UTC.");
}

function sqlDate(iso: string | null) {
  return iso?.replace("T", " ").replace(/Z$/, "") ?? null;
}

function strings(value: unknown, maxCount = 30, maxLength = 500): string[] {
  if (value === undefined || value === null) return [];
  const entries = typeof value === "string" ? value.split(/\r?\n/) : value;
  if (!Array.isArray(entries) || entries.length > maxCount || !entries.every(item =>
    typeof item === "string" && item.length <= maxLength,
  )) throw new OfferError(422, "Vérifiez la longueur et le nombre d’éléments des listes.");
  return entries.map(item => item.trim()).filter(Boolean);
}

function publicPath(value: string | null, image: boolean) {
  if (!value) return null;
  if (!isPublicOfferAsset(value, image)) throw new OfferError(422, "Utilisez le chemin d’un fichier public autorisé.");
  return value;
}

function flag(value: unknown) {
  return value === true || value === 1 || value === "true" || value === "on" || value === "1";
}

function readRecruiterId(value: unknown) {
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new OfferError(422, "Choisissez un profil recruteur valide.");
  return value;
}

function readFields(input: Input) {
  const contract = input.contract, workMode = input.workMode;
  if (!isContract(contract) || !isWorkMode(workMode)) throw new OfferError(422, "Choisissez un contrat et un mode de travail valides.");
  const positions = Number(input.positions);
  if ((typeof input.positions !== "number" && typeof input.positions !== "string")
    || !Number.isInteger(positions) || positions < 1 || positions > 65535) {
    throw new OfferError(422, "Indiquez un nombre de postes compris entre 1 et 65 535.");
  }
  const countryCode = requiredText(input, "countryCode", 2).toUpperCase();
  if (!isNationalityCode(countryCode)) throw new OfferError(422, "Choisissez un code pays reconnu.");
  const publishedAt = dateValue(input.publishedAt);
  const deadline = dateValue(input.deadline);
  if (publishedAt && deadline && deadline <= publishedAt) throw new OfferError(422, "La clôture doit être postérieure à la publication.");
  return {
    title: requiredText(input, "title", 180),
    city: requiredText(input, "city", 120),
    country: requiredText(input, "country", 120),
    countryCode,
    company: text(input, "company", 180, false),
    contract, workMode, publishedAt, deadline, positions,
    coverLetterRequired: flag(input.coverLetterRequired),
    experience: requiredText(input, "experience", 180),
    education: requiredText(input, "education", 180),
    salary: text(input, "salary", 180, false),
    hours: text(input, "hours", 180, false),
    startDate: dateValue(input.startDate, true),
    description: requiredText(input, "description", 12000),
    missions: strings(input.missions), profile: strings(input.profile), skills: strings(input.skills),
    benefits: strings(input.benefits), process: strings(input.process),
    featured: flag(input.featured),
    imageUrl: publicPath(text(input, "imageUrl", 500, false), true),
    attachments: strings(input.attachments, 10).map(path => publicPath(path, false)!),
  };
}

async function lookupRecruiter(db: Executor, id: string) {
  const [[row]] = await db.execute<RecruiterRow[]>(
    "SELECT id, first_name AS firstName, last_name AS lastName, role FROM recruitment_recruiters WHERE id = ? FOR UPDATE",
    [id],
  );
  if (!row) throw new OfferError(404, "Profil recruteur introuvable.");
  return row;
}

function publicRecruiter(profile: Pick<RecruiterProfile, "firstName" | "lastName" | "role">): NonNullable<Job["recruiter"]> {
  return { name: `${profile.firstName} ${profile.lastName}`, role: profile.role, company: "Hopla Groupe",
    initials: ([...profile.firstName][0] + [...profile.lastName][0]).toLocaleUpperCase("fr"),
    avatar: null, email: null, phone: null, linkedin: null };
}

async function transaction<T>(actor: Actor, action: string, run: (db: PoolConnection) => Promise<T>) {
  const connection = await (await getPool()).getConnection();
  try {
    await connection.beginTransaction();
    const result = await run(connection);
    await connection.execute(
      "INSERT INTO recruitment_admin_audit (actor_id, action, created_at) VALUES (?, ?, UTC_TIMESTAMP())",
      [actor.id, action],
    );
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw new OfferError(409, "Ce slug est déjà utilisé. Choisissez un autre slug.");
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function saveOffer(db: Executor, slug: string, fields: ReturnType<typeof readFields>, recruiterId: string | null,
  recruiter: Job["recruiter"], closed: boolean, insert: boolean) {
  const values = [
    fields.title, fields.city, fields.country, fields.countryCode, fields.company, fields.contract, fields.workMode,
    sqlDate(fields.publishedAt), sqlDate(fields.deadline), closed, fields.coverLetterRequired, fields.positions,
    fields.experience, fields.education, fields.salary, fields.hours, fields.startDate, fields.description,
    JSON.stringify(fields.missions), JSON.stringify(fields.profile), JSON.stringify(fields.skills), JSON.stringify(fields.benefits),
    JSON.stringify(fields.process), recruiter ? JSON.stringify(recruiter) : null, recruiterId, fields.featured,
    fields.imageUrl, JSON.stringify(fields.attachments),
  ];
  if (insert) {
    await db.execute(
      `INSERT INTO recruitment_jobs (slug, ${mutableColumns.join(", ")}) VALUES (?, ${mutableColumns.map(() => "?").join(", ")})`,
      [slug, ...values],
    );
  } else {
    await db.execute(
      `UPDATE recruitment_jobs SET ${mutableColumns.map(column => `${column} = ?`).join(", ")} WHERE slug = ?`,
      [...values, slug],
    );
  }
}

export async function mutateOffer(actor: Actor, input: Input) {
  requireAdmin(actor);
  const action = input.action;
  if (!["create", "update", "duplicate", "publish", "unpublish", "draft", "close", "delete"].some(value => value === action)) {
    throw new OfferError(422, "Action inconnue.");
  }
  const slug = readSlug(input.slug);
  return transaction(actor, `offer.${action}`, async db => {
    if (action === "create") {
      const fields = readFields(input);
      const [profiles] = !Object.hasOwn(input, "recruiterId")
        ? await db.execute<RecruiterRow[]>("SELECT id, first_name AS firstName, last_name AS lastName, role FROM recruitment_recruiters ORDER BY id LIMIT 2 FOR UPDATE")
        : [[]];
      const profile = input.recruiterId ? await lookupRecruiter(db, readRecruiterId(input.recruiterId))
        : profiles.length === 1 ? profiles[0] : null;
      await saveOffer(db, slug, fields, profile?.id ?? null, profile ? publicRecruiter(profile) : null, false, true);
      return { slug };
    }
    const existing = await fetchOffer(db, actor, slug, true);
    if (!existing) throw new OfferError(404, "Offre introuvable.");
    if (action === "update" || action === "duplicate") {
      const duplicate = action === "duplicate";
      const target = duplicate
        ? input.newSlug === undefined
          ? `${slug.slice(0, 96).replace(/-$/, "")}-copie-${randomUUID()}`
          : readSlug(input.newSlug)
        : slug;
      const fields = duplicate
        ? { ...existing, publishedAt: null, featured: false }
        : readFields({ ...input, publishedAt: Object.hasOwn(input, "publishedAt") ? input.publishedAt : existing.publishedAt });
      const changesRecruiter = !duplicate && Object.hasOwn(input, "recruiterId");
      const profile = changesRecruiter && input.recruiterId ? await lookupRecruiter(db, readRecruiterId(input.recruiterId)) : null;
      const recruiterId = changesRecruiter ? profile?.id ?? null : existing.recruiterId;
      const recruiter = changesRecruiter ? profile && publicRecruiter(profile) : existing.recruiter;
      await saveOffer(db, target, fields, recruiterId, recruiter, !duplicate && existing.closed, duplicate);
      return { slug: target };
    }
    if (action === "delete") {
      if (input.confirmation !== slug) throw new OfferError(422, "Saisissez le slug de l’offre pour confirmer la suppression.");
      const [[match]] = await db.execute<RowDataPacket[]>(
        "SELECT 1 FROM recrutement_candidatures WHERE job_slug = ? LIMIT 1", [slug],
      );
      if (match || existing.publishedAt) throw new OfferError(409, "Dépubliez l’offre. Une offre liée à des candidatures doit être conservée.");
      // Reserve the slug and preserve the historical row if a public request was already in flight.
      await db.execute(
        `UPDATE recruitment_jobs SET deleted_at = UTC_TIMESTAMP(), published_at = NULL, closed = TRUE,
          recruiter_id = NULL, recruiter = NULL WHERE slug = ?`, [slug],
      );
      await db.execute("DELETE FROM recruitment_admin_offer_access WHERE offer_slug = ?", [slug]);
    } else if (action === "publish") {
      const publishedAt = dateValue(input.publishedAt) ?? new Date().toISOString().slice(0, 19) + "Z";
      if (existing.deadline && existing.deadline <= publishedAt) throw new OfferError(422, "La clôture doit être postérieure à la publication.");
      await db.execute("UPDATE recruitment_jobs SET published_at = ?, closed = FALSE WHERE slug = ?", [sqlDate(publishedAt), slug]);
    } else if (action === "close") {
      if (existing.status === "draft" || existing.status === "scheduled") {
        throw new OfferError(409, "Seule une offre déjà publiée peut être fermée.");
      }
      await db.execute("UPDATE recruitment_jobs SET closed = TRUE WHERE slug = ?", [slug]);
    } else {
      await db.execute("UPDATE recruitment_jobs SET published_at = NULL, closed = FALSE WHERE slug = ?", [slug]);
    }
    return { slug };
  });
}

export async function mutateRecruiter(actor: Actor, input: Input) {
  requireAdmin(actor);
  const { action } = input;
  if (action !== "create" && action !== "update" && action !== "delete" && action !== "reassign") {
    throw new OfferError(422, "Action inconnue.");
  }
  return transaction(actor, `recruiter.${action}`, async db => {
    if (action === "create" || action === "update") {
      const fields = {
        firstName: requiredText(input, "firstName", 100), lastName: requiredText(input, "lastName", 100),
        role: requiredText(input, "role", 180),
      };
      const id = action === "create" ? randomUUID() : readRecruiterId(input.id);
      if (action === "create") {
        await db.execute("INSERT INTO recruitment_recruiters (id, first_name, last_name, role, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())",
          [id, fields.firstName, fields.lastName, fields.role]);
      } else {
        await lookupRecruiter(db, id);
        await db.execute("UPDATE recruitment_recruiters SET first_name = ?, last_name = ?, role = ? WHERE id = ?",
          [fields.firstName, fields.lastName, fields.role, id]);
        await db.execute("UPDATE recruitment_jobs SET recruiter = ? WHERE recruiter_id = ?",
          [JSON.stringify(publicRecruiter(fields)), id]);
      }
      return { id };
    }
    const id = readRecruiterId(input.id);
    if (action === "reassign") {
      const replacementId = readRecruiterId(input.replacementId);
      if (id === replacementId) throw new OfferError(422, "Choisissez un autre profil recruteur.");
      const sortedIds = [id, replacementId].sort();
      const locked = [await lookupRecruiter(db, sortedIds[0]), await lookupRecruiter(db, sortedIds[1])];
      const replacement = locked.find(profile => profile.id === replacementId)!;
      await db.execute("UPDATE recruitment_jobs SET recruiter_id = ?, recruiter = ? WHERE recruiter_id = ?",
        [replacementId, JSON.stringify(publicRecruiter(replacement)), id]);
    } else {
      if (!flag(input.confirmation)) throw new OfferError(422, "Confirmez la suppression du profil.");
      await lookupRecruiter(db, id);
      const [[match]] = await db.execute<RowDataPacket[]>("SELECT 1 FROM recruitment_jobs WHERE recruiter_id = ? LIMIT 1", [id]);
      if (match) throw new OfferError(409, "Réattribuez les offres associées avant de supprimer ce profil.");
      await db.execute("DELETE FROM recruitment_recruiters WHERE id = ?", [id]);
    }
    return { id };
  });
}
