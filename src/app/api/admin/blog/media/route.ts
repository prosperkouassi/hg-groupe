import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { authorizeWrite } from '@/lib/blog/access';
import { mediaDirectory } from '@/lib/blog/media';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!await authorizeWrite(request)) return NextResponse.json({ message: 'Accès refusé.' }, { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 9 * 1024 * 1024) return NextResponse.json({ message: 'Image trop volumineuse (8 Mo maximum).' }, { status: 413 });
  try {
    const file = (await request.formData()).get('file');
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) return NextResponse.json({ message: 'Choisissez une image de moins de 8 Mo.' }, { status: 400 });
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40000000 }); const info = await image.metadata();
    if (!['jpeg', 'png', 'webp', 'avif'].includes(info.format || '') || (info.pages || 1) > 1) return NextResponse.json({ message: 'Formats autorisés : JPG, PNG, WebP et AVIF fixes.' }, { status: 400 });
    const buffer = await image.rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const name = `${randomUUID()}.webp`; const directory = mediaDirectory(); await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, name), buffer, { flag: 'wx' });
    return NextResponse.json({ src: `/api/blog/media/${name}` }, { status: 201 });
  } catch { return NextResponse.json({ message: 'Image illisible ou stockage indisponible.' }, { status: 400 }); }
}
