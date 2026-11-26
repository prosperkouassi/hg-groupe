import type { RowDataPacket } from "mysql2";
import { isPublicOfferAsset } from "../public-assets";
import { publicApplicationsEnabled, publicOffersEnabled } from "../public-visibility";
import type { Job, JobsPage, Recruiter } from "../types";

const pageSize = 15;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const published = "published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP() AND slug <> 'confirmation'";
const mediaColumns = ", featured, image_url AS imageUrl, attachments";

const columns = `
  slug, title, city, country, country_code AS countryCode, company, contract,
  work_mode AS workMode, DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%sZ') AS publishedAt,
  DATE_FORMAT(deadline, '%Y-%m-%dT%H:%i:%sZ') AS deadline, closed,
  cover_letter_required AS coverLetterRequired, positions, experience, education,
  salary, hours, DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
  description, missions, profile, skills, benefits, process, recruiter
`;

type Section = "missions" | "profile" | "skills" | "benefits" | "process";

interface JobRow extends RowDataPacket, Omit<Job, "closed" | "demo" | "coverLetterRequired" | "recruiter" | "featured" | "imageUrl" | "attachments" | Section>, Record<Section, unknown> {
  closed: number;
  coverLetterRequired: number;
  recruiter: unknown;
  featured?: number;
  imageUrl?: unknown;
  attachments?: unknown;
}

function readJsonColumn(value: unknown): unknown {
  // mysql2 can return decoded JSON or JSON text, depending on the server metadata.
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function publicRecruiter(raw: unknown): Recruiter | null {
  const value = readJsonColumn(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  const visibleText = (key: string) => typeof fields[key] === "string" ? fields[key] : null;
  const name = visibleText("name");
  if (!name) return null;
  const initials = visibleText("initials");

  return {
    name,
    ...(initials && /^\p{L}{2,4}$/u.test(initials) ? { initials } : {}),
    role: visibleText("role") ?? "",
    company: visibleText("company") ?? "",
    email: visibleText("email"),
    phone: visibleText("phone"),
    linkedin: visibleText("linkedin"),
    avatar: visibleText("avatar"),
  };
}

function publicSection(raw: unknown) {
  const value = readJsonColumn(raw);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function publicAttachments(raw: unknown) {
  const entries = readJsonColumn(raw);
  return Array.isArray(entries) ? [...new Set(entries.filter(path => isPublicOfferAsset(path, false)))].slice(0, 10) : [];
}

function fromRow(row: JobRow): Job {
  return {
    ...row,
    recruiter: publicRecruiter(row.recruiter),
    missions: publicSection(row.missions),
    profile: publicSection(row.profile),
    skills: publicSection(row.skills),
    benefits: publicSection(row.benefits),
    process: publicSection(row.process),
    closed: Boolean(row.closed),
    coverLetterRequired: Boolean(row.coverLetterRequired),
    featured: Boolean(row.featured),
    imageUrl: isPublicOfferAsset(row.imageUrl, true) ? row.imageUrl : null,
    attachments: publicAttachments(row.attachments),
    demo: false,
  };
}

async function withPublicMedia<T>(query: (withMedia: boolean) => Promise<T>) {
  try {
    return await query(true);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ER_BAD_FIELD_ERROR") {
      return query(false);
    }
    throw error;
  }
}

export function parsePage(input: unknown) {
  if (typeof input === "string" && /^[1-9]\d{0,6}$/.test(input)) return Number(input);
  return 1;
}

export function isOpen(job: Job) {
  return !job.closed && (job.deadline === null || Date.parse(job.deadline) > Date.now());
}

export function canApply(job: Job) {
  return isOpen(job) && (job.demo || publicApplicationsEnabled());
}

export async function getJobs(requestedPage: number): Promise<JobsPage> {
  if (!publicOffersEnabled()) {
    return { jobs: [], page: 1, totalPages: 1, total: 0, unavailable: false };
  }

  try {
    if (process.env.NODE_ENV === "development") {
      const { demoJobs } = await import("./demo-jobs");
      const totalPages = Math.max(1, Math.ceil(demoJobs.length / pageSize));
      const page = Math.min(requestedPage, totalPages);
      return {
        jobs: demoJobs.slice((page - 1) * pageSize, page * pageSize),
        page,
        totalPages,
        total: demoJobs.length,
        unavailable: false,
      };
    }

    const { default: pool } = await import("@/lib/db");
    const [[{ total }]] = await pool.execute<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM recruitment_jobs WHERE ${published}`,
    );
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const [rows] = await withPublicMedia(withMedia =>
      pool.execute<JobRow[]>(
        `SELECT ${columns}${withMedia ? mediaColumns : ""} FROM recruitment_jobs WHERE ${published}
         ORDER BY ${withMedia ? "featured DESC, " : ""}published_at DESC, slug ASC LIMIT ? OFFSET ?`,
        [pageSize, (page - 1) * pageSize],
      ),
    );
    return { jobs: rows.map(fromRow), page, totalPages, total, unavailable: false };
  } catch {
    console.error("[recrutement] Offres indisponibles");
    return { jobs: [], page: 1, totalPages: 1, total: 0, unavailable: true };
  }
}

export async function getJob(slug: string): Promise<Job | null> {
  if (!publicOffersEnabled() || slug === "confirmation" || slug.length > 140 || !slugPattern.test(slug)) return null;

  if (process.env.NODE_ENV === "development") {
    const { demoJobs } = await import("./demo-jobs");
    return demoJobs.find((job) => job.slug === slug) ?? null;
  }

  const { default: pool } = await import("@/lib/db");
  const [rows] = await withPublicMedia(withMedia =>
    pool.execute<JobRow[]>(
      `SELECT ${columns}${withMedia ? mediaColumns : ""} FROM recruitment_jobs WHERE slug = ? AND ${published}`,
      [slug],
    ),
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function getPublicJobSitemapSlugs() {
  if (process.env.NODE_ENV === "development" || !publicOffersEnabled()) return [];

  const { default: pool } = await import("@/lib/db");
  const [rows] = await pool.execute<(RowDataPacket & { slug: string })[]>(
    `SELECT slug FROM recruitment_jobs WHERE ${published}
       AND closed = FALSE AND (deadline IS NULL OR deadline > UTC_TIMESTAMP())
       ORDER BY published_at DESC, slug ASC`,
  );
  return rows.map(({ slug }) => slug).filter(slug => slug.length <= 140 && slugPattern.test(slug));
}

export async function getJobPage(job: Job) {
  if (job.demo) {
    const { demoJobs } = await import("./demo-jobs");
    return Math.floor(demoJobs.findIndex(({ slug }) => slug === job.slug) / pageSize) + 1;
  }

  const { default: pool } = await import("@/lib/db");
  const publication = job.publishedAt.slice(0, 19).replace("T", " ");
  const newer = "(published_at > ? OR (published_at = ? AND slug < ?))";
  const dateParams = [publication, publication, job.slug];
  const [[{ total }]] = await withPublicMedia(withMedia => {
    const order = withMedia ? `(featured > ? OR (featured = ? AND ${newer}))` : newer;
    const featured = Number(Boolean(job.featured));
    return pool.execute<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM recruitment_jobs WHERE ${published} AND ${order}`,
      withMedia ? [featured, featured, ...dateParams] : dateParams,
    );
  });
  return Math.floor(total / pageSize) + 1;
}
