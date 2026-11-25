import type { RowDataPacket } from "mysql2";
import type { Job, JobsPage, Recruiter } from "../types";

const pageSize = 15;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const published = "published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP() AND slug <> 'confirmation'";

const columns = `
  slug, title, city, country, country_code AS countryCode, company, contract,
  work_mode AS workMode, DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%sZ') AS publishedAt,
  DATE_FORMAT(deadline, '%Y-%m-%dT%H:%i:%sZ') AS deadline, closed,
  cover_letter_required AS coverLetterRequired, positions, experience, education,
  salary, hours, DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
  description, missions, profile, skills, benefits, process, recruiter
`;

type Section = "missions" | "profile" | "skills" | "benefits" | "process";

interface JobRow extends RowDataPacket, Omit<Job, "closed" | "demo" | "coverLetterRequired" | "recruiter" | Section>, Record<Section, unknown> {
  closed: number;
  coverLetterRequired: number;
  recruiter: unknown;
}

function publicRecruiter(value: unknown): Recruiter | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  const visibleText = (key: string) => typeof fields[key] === "string" ? fields[key] : null;
  const name = visibleText("name");
  if (!name) return null;

  return {
    name,
    role: visibleText("role") ?? "",
    company: visibleText("company") ?? "",
    email: visibleText("email"),
    phone: visibleText("phone"),
    linkedin: visibleText("linkedin"),
    avatar: visibleText("avatar"),
  };
}

function publicSection(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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
    demo: false,
  };
}

export function parsePage(input: unknown) {
  if (typeof input === "string" && /^[1-9]\d{0,6}$/.test(input)) return Number(input);
  return 1;
}

export function isOpen(job: Job) {
  return !job.closed && (job.deadline === null || Date.parse(job.deadline) > Date.now());
}

export function canApply(job: Job) {
  return isOpen(job) && (job.demo || process.env.RECRUTEMENT_CANDIDATURES_ENABLED === "true");
}

export async function getJobs(requestedPage: number): Promise<JobsPage> {
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

    if (process.env.RECRUTEMENT_OFFRES_ENABLED !== "true") {
      return { jobs: [], page: 1, totalPages: 1, total: 0, unavailable: false };
    }

    const { default: pool } = await import("@/lib/db");
    const [[{ total }]] = await pool.execute<(RowDataPacket & { total: number })[]>(
      `SELECT COUNT(*) AS total FROM recruitment_jobs WHERE ${published}`,
    );
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const [rows] = await pool.execute<JobRow[]>(
      `SELECT ${columns} FROM recruitment_jobs WHERE ${published}
       ORDER BY published_at DESC, slug ASC LIMIT ? OFFSET ?`,
      [pageSize, (page - 1) * pageSize],
    );
    return { jobs: rows.map(fromRow), page, totalPages, total, unavailable: false };
  } catch {
    console.error("[recrutement] Offres indisponibles");
    return { jobs: [], page: 1, totalPages: 1, total: 0, unavailable: true };
  }
}

export async function getJob(slug: string): Promise<Job | null> {
  if (slug === "confirmation" || slug.length > 140 || !slugPattern.test(slug)) return null;

  if (process.env.NODE_ENV === "development") {
    const { demoJobs } = await import("./demo-jobs");
    return demoJobs.find((job) => job.slug === slug) ?? null;
  }

  if (process.env.RECRUTEMENT_OFFRES_ENABLED !== "true") return null;

  const { default: pool } = await import("@/lib/db");
  const [rows] = await pool.execute<JobRow[]>(
    `SELECT ${columns} FROM recruitment_jobs WHERE slug = ? AND ${published}`,
    [slug],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function getJobPage(job: Job) {
  if (job.demo) {
    const { demoJobs } = await import("./demo-jobs");
    return Math.floor(demoJobs.findIndex(({ slug }) => slug === job.slug) / pageSize) + 1;
  }

  const { default: pool } = await import("@/lib/db");
  const publication = job.publishedAt.slice(0, 19).replace("T", " ");
  const [[{ total }]] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM recruitment_jobs WHERE ${published}
     AND (published_at > ? OR (published_at = ? AND slug < ?))`,
    [publication, publication, job.slug],
  );
  return Math.floor(total / pageSize) + 1;
}
