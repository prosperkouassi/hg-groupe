import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { mediaDirectory } from '@/lib/blog/media';
import { blogAdmin } from '@/lib/blog/access';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(name)) return new Response(null, { status: 404 });
  try {
    const src = `/api/blog/media/${name}`;
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id FROM blog_articles WHERE published IS NOT NULL AND JSON_SEARCH(published, \'one\', ?) IS NOT NULL LIMIT 1', [src]);
    const isPublic = rows.length > 0;
    if (!isPublic && !await blogAdmin()) return new Response(null, { status: 404 });
    const buffer = await readFile(path.join(mediaDirectory(), name));
    return new Response(new Uint8Array(buffer), { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response(null, { status: 404 }); }
}
