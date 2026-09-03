import pool from "@/lib/db";

export type CaseDomain = {
  id: number;
  name: string;
  slug: string;
  display_order: number;
};

export type CaseCategory = {
  id: number;
  domain_id: number;
  name: string;
  slug: string;
  display_order: number;
};

export async function getCaseDomains(): Promise<CaseDomain[]> {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        slug,
        display_order
      FROM domains
      ORDER BY display_order ASC, id ASC
    `
  );

  return rows as CaseDomain[];
}

export async function getCaseCategories(): Promise<CaseCategory[]> {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        domain_id,
        name,
        slug,
        display_order
      FROM categories
      ORDER BY domain_id ASC, display_order ASC, id ASC
    `
  );

  return rows as CaseCategory[];
}