import { cache } from 'react';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import type { BlogDraft } from './content';
export type BlogArticle = { id: number; slug: string; draft: BlogDraft; published: BlogDraft | null; version: number; firstPublishedAt: string | null; publishedAt: string | null; updatedAt: string };
type ArticleRow = RowDataPacket & { id: number; slug: string; draft: BlogDraft | string; published: BlogDraft | string | null; version: number; first_published_at: Date | string | null; published_at: Date | string | null; updated_at: Date | string };
function date(value: Date | string | null) { return value ? (value instanceof Date ? value.toISOString() : new Date(value.replace(' ', 'T') + (value.endsWith('Z') ? '' : 'Z')).toISOString()) : null; }
function decode(value: BlogDraft | string): BlogDraft { return typeof value === 'string' ? JSON.parse(value) : value; }
function article(r: ArticleRow): BlogArticle { return { id: r.id, slug: r.slug, draft: decode(r.draft), published: r.published ? decode(r.published) : null, version: r.version, firstPublishedAt: date(r.first_published_at), publishedAt: date(r.published_at), updatedAt: date(r.updated_at)! }; }
export async function adminArticles() { const [rows] = await pool.execute<ArticleRow[]>('SELECT * FROM blog_articles ORDER BY updated_at DESC, id DESC'); return rows.map(article); }
export async function adminArticle(id: number) { const [rows] = await pool.execute<ArticleRow[]>('SELECT * FROM blog_articles WHERE id = ?', [id]); return rows[0] ? article(rows[0]) : null; }
export const publishedArticle = cache(async (slug: string) => {
  const [rows] = await pool.execute<ArticleRow[]>('SELECT id, slug, published AS draft, published, version, first_published_at, published_at, updated_at FROM blog_articles WHERE slug = ? AND published IS NOT NULL LIMIT 1', [slug]);
  return rows[0] ? article(rows[0]) : null;
});
export async function listPublished({ q = '', category = '', page = 1, size = 9, exclude = 0 } = {}) {
  const where = ['published IS NOT NULL', 'id <> ?']; const values: (string | number)[] = [exclude];
  if (category) { where.push("JSON_UNQUOTE(JSON_EXTRACT(published, '$.category')) = ?"); values.push(category); }
  if (q) { where.push("(JSON_UNQUOTE(JSON_EXTRACT(published, '$.title')) LIKE ? ESCAPE '=' OR JSON_UNQUOTE(JSON_EXTRACT(published, '$.excerpt')) LIKE ? ESCAPE '=' OR published_text LIKE ? ESCAPE '=')"); const term = `%${q.slice(0, 120).replace(/[=%_]/g, '=$&')}%`; values.push(term, term, term); }
  const filter = where.join(' AND ');
  const [count] = await pool.execute<(RowDataPacket & { total: number })[]>(`SELECT COUNT(*) AS total FROM blog_articles WHERE ${filter}`, values);
  const total = Number(count[0].total); const pages = Math.max(1, Math.ceil(total / size)); const current = Math.min(Math.max(1, page), pages);
  // Bounded numeric pagination only; all user strings remain query parameters.
  const [rows] = await pool.execute<ArticleRow[]>(`SELECT id, slug, published AS draft, published, version, first_published_at, published_at, updated_at FROM blog_articles WHERE ${filter} ORDER BY published_at DESC, id DESC LIMIT ${size} OFFSET ${(current - 1) * size}`, values);
  return { articles: rows.map(article), total, pages, page: current };
}
export async function publishedSitemap() { const [rows] = await pool.execute<(RowDataPacket & { slug: string; modified: string })[]>('SELECT slug, published_at AS modified FROM blog_articles WHERE published IS NOT NULL'); return rows; }
