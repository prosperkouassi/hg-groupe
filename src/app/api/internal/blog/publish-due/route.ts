import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { publishDue } from '@/lib/blog/publish-due';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.BLOG_CRON_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ message: 'Ordonnanceur non configuré.' }, { status: 503 });
  const supplied = Buffer.from(request.headers.get('authorization') || ''); const expected = Buffer.from(`Bearer ${secret}`);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied,expected)) return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
  try { return NextResponse.json(await publishDue()); }
  catch (error) { console.error('Programmation blog : échec', { code: (error as { code?: string }).code || 'unknown' }); return NextResponse.json({ message: 'Publication différée indisponible. Réessayez au prochain passage.' }, { status: 503 }); }
}
