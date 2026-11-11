import 'server-only';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import type { Partner } from '@/lib/partner-types';

export async function getPartners(publishedOnly = false): Promise<Partner[]> {
  const [rows] = await pool.execute<(RowDataPacket & Partner)[]>(
    `SELECT id, name, logo_path, website_url, status, display_order FROM partners ${publishedOnly ? "WHERE status = 'published'" : ''} ORDER BY display_order ASC, id ASC`
  );
  return rows.map(row => ({ id: row.id, name: row.name, logo_path: row.logo_path, website_url: row.website_url, status: row.status, display_order: row.display_order }));
}
