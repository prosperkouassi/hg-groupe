import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { authorizeWrite } from '@/lib/blog/access';
import { slugify, validateDraft } from '@/lib/blog/content';
export async function POST(request: Request) {
  try {
  if (!await authorizeWrite(request)) return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
    const body = await request.text(); if (body.length > 1000000) return NextResponse.json({ message: 'Article trop volumineux.' }, { status: 413 });
    const value = JSON.parse(body); const draft = validateDraft(value.draft); const slug = slugify(value.slug || draft.title);
    if (!slug || slug !== value.slug) throw new Error('Adresse invalide : lettres minuscules, chiffres et tirets uniquement.');
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO blog_articles (slug, draft) VALUES (?, ?)', [slug, JSON.stringify(draft)]);
    return NextResponse.json({ id: result.insertId, version: 1 }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === 'ER_DUP_ENTRY') return NextResponse.json({ message: 'Cette adresse est déjà utilisée.' }, { status: 409 });
    const code = (e as { code?: string }).code;
    const isDB = !!code;
    if (isDB) console.error('Blog : échec d’accès à la base ou d’enregistrement', { code });
    return NextResponse.json({ message: isDB ? 'Connexion à la base ou enregistrement indisponible. Consultez le terminal du serveur.' : e instanceof Error ? e.message : 'Données invalides.' }, { status: isDB ? 500 : 400 });
  }
}
