import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { blogWriteGuard } from '@/lib/blog/access';
import { BlogMediaConfigurationError, mediaDirectory } from '@/lib/blog/media';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const denied = await blogWriteGuard(request); if (denied) return denied;
    if (Number(request.headers.get('content-length') || 0) > 9 * 1024 * 1024) return NextResponse.json({ message: 'Image trop volumineuse (8 Mo maximum).' }, { status: 413 });
    let file;
    try { file = (await request.formData()).get('file'); }
    catch { return NextResponse.json({ message: 'Le fichier reçu est incomplet. Sélectionnez à nouveau l’image.' }, { status: 400 }); }
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) return NextResponse.json({ message: 'Choisissez une image de moins de 8 Mo.' }, { status: 400 });
    let buffer: Buffer;
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const image = sharp(input, { limitInputPixels: 40000000 }); const info = await image.metadata();
      if (!['jpeg', 'png', 'webp', 'avif'].includes(info.format || '') || (info.pages || 1) > 1) return NextResponse.json({ message: 'Formats autorisés : JPG, PNG, WebP et AVIF fixes.' }, { status: 400 });
      buffer = await image.rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    } catch { return NextResponse.json({ message: 'Cette image ne peut pas être décodée. Essayez un JPG, PNG ou WebP valide.' }, { status: 400 }); }
    const name = `${randomUUID()}.webp`; const directory = mediaDirectory();
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), buffer, { flag: 'wx' });
    return NextResponse.json({ src: `/api/blog/media/${name}` }, { status: 201 });
  } catch (error) {
    if (error instanceof BlogMediaConfigurationError) return NextResponse.json({ message: error.message }, { status: 503 });
    const code = (error as { code?: string }).code;
    console.error('Blog : échec de téléversement', { code: code || 'unknown' });
    return NextResponse.json({ message: ['EACCES','EPERM','EROFS'].includes(code || '') ? 'L’application ne peut pas écrire dans BLOG_MEDIA_DIR. Vérifiez le chemin et les droits du dossier Hostinger.' : 'Téléversement indisponible. Vérifiez les journaux de l’application Hostinger.' }, { status: 503 });
  }
}
