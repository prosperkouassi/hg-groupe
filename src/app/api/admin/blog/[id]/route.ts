import { NextResponse } from 'next/server';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import pool from '@/lib/db';
import { authorizeWrite, blogAdmin } from '@/lib/blog/access';
import { slugify, textContent, validateDraft } from '@/lib/blog/content';
import { parseScheduledAt } from '@/lib/blog/schedule';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let connection: PoolConnection | undefined;
  try {
    if (!await authorizeWrite(request)) return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
    const id = Number((await params).id); if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ message: 'Article introuvable.' }, { status: 404 });
    const body = await request.text(); if (body.length > 1000000) return NextResponse.json({ message: 'Article trop volumineux.' }, { status: 413 });
    const v = JSON.parse(body);
    if (!['save','publish','unpublish','schedule','cancelSchedule'].includes(v.action) || !Number.isInteger(v.version)) throw new Error('Action invalide.');
    const draft = validateDraft(v.draft, v.action === 'publish' || v.action === 'schedule'); const slug = slugify(v.slug);
    if (!slug || slug !== v.slug) throw new Error('Adresse invalide.');
    const scheduled = v.action === 'schedule' ? parseScheduledAt(v.scheduledAt) : null;
    if (scheduled && (!process.env.BLOG_CRON_SECRET || process.env.BLOG_CRON_SECRET.length < 32)) throw new Error('Configurez BLOG_CRON_SECRET et la tâche planifiée avant de programmer un article.');
    const admin = await blogAdmin(); if (!admin) return NextResponse.json({ message: 'Session expirée.' }, { status: 401 });
    connection = await pool.getConnection(); await connection.beginTransaction();
    // All writers (including the cron) lock the article first, then its jobs.
    const [rows] = await connection.execute<(RowDataPacket & { version: number; slug: string; first_published_at: unknown })[]>('SELECT version, slug, first_published_at FROM blog_articles WHERE id = ? FOR UPDATE', [id]);
    const row = rows[0];
    if (!row || row.version !== v.version || (row.first_published_at && row.slug !== slug)) {
      await connection.rollback();
      return NextResponse.json({ message: 'La version a changé ou l’adresse publiée a été modifiée. Rechargez la page avant de continuer.' }, { status: 409 });
    }
    const [pending] = await connection.execute<RowDataPacket[]>("SELECT id FROM blog_publication_jobs WHERE article_id = ? AND status = 'pending' LIMIT 1", [id]);
    if (pending.length && row.slug !== slug) throw new Error('Annulez la programmation avant de modifier l’adresse de cet article.');
    const encoded = JSON.stringify(draft);
    const changes = v.action === 'publish' ? ', published = ?, published_text = ?, published_at = UTC_TIMESTAMP(), first_published_at = COALESCE(first_published_at, UTC_TIMESTAMP())' : v.action === 'unpublish' ? ', published = NULL, published_text = NULL' : '';
    const values = [encoded, slug, ...(v.action === 'publish' ? [encoded,textContent(draft.content)] : []), id];
    await connection.execute<ResultSetHeader>(`UPDATE blog_articles SET draft = ?, slug = ?, version = version + 1, updated_at = UTC_TIMESTAMP() ${changes} WHERE id = ?`, values);
    if (v.action !== 'save') await connection.execute("UPDATE blog_publication_jobs SET status = 'cancelled', completed_at = UTC_TIMESTAMP() WHERE article_id = ? AND status = 'pending'", [id]);
    if (scheduled) await connection.execute('INSERT INTO blog_publication_jobs (article_id, revision, scheduled_at, created_by, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())', [id,encoded,scheduled.sql,admin.id]);
    await connection.commit();
    return NextResponse.json({ version: v.version + 1, scheduledAt: scheduled?.iso, published: v.action === 'publish' ? true : v.action === 'unpublish' ? false : undefined });
  } catch (error) {
    if (connection) await connection.rollback();
    const code = (error as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY') return NextResponse.json({ message: 'Cette adresse est déjà utilisée.' }, { status: 409 });
    if (code) console.error('Blog : échec de sauvegarde/programmation', { code });
    return NextResponse.json({ message: code ? 'Enregistrement indisponible. Vérifiez la migration IA/programmation et la connexion BDD.' : error instanceof Error ? error.message : 'Données invalides.' }, { status: code ? 500 : 400 });
  } finally { connection?.release(); }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await blogAdmin()) return NextResponse.json({ message: 'Session expirée.' }, { status: 401 });
    const id = Number((await params).id); if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ message: 'Article introuvable.' }, { status: 404 });
    const [jobs] = await pool.execute<(RowDataPacket & { scheduledAt: string; title: string })[]>("SELECT DATE_FORMAT(scheduled_at, '%Y-%m-%dT%H:%i:%s.000Z') AS scheduledAt, JSON_UNQUOTE(JSON_EXTRACT(revision, '$.title')) AS title FROM blog_publication_jobs WHERE article_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1", [id]);
    return NextResponse.json({ schedule: jobs[0] || null, cronConfigured: !!process.env.BLOG_CRON_SECRET && process.env.BLOG_CRON_SECRET.length >= 32 }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ message: 'Programmation indisponible. Vérifiez que la migration a été exécutée.' }, { status: 503 }); }
}
