import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { isBlogImage } from './content';
import { mediaDirectory } from './media';

export async function buildShareImage(cover?: string) {
  let input: Buffer | undefined;
  if (isBlogImage(cover)) {
    try {
      const buffer = await readFile(path.join(mediaDirectory(),path.basename(cover)));
      // Decode the selected public cover before falling back, so a corrupt file cannot break sharing.
      await sharp(buffer,{ limitInputPixels: 40000000 }).metadata(); input = buffer;
    } catch { /* A missing persistent upload falls back to the bundled brand image. */ }
  }
  const fallback = () => readFile(path.join(process.cwd(),'public','images','og-hopla-groupe.jpg'));
  const encode = (buffer: Buffer) => sharp(buffer,{ limitInputPixels: 40000000 }).rotate().resize(1200,630,{ fit: 'cover',position: 'centre' }).flatten({ background: '#ffffff' }).jpeg({ quality: 84,mozjpeg: true }).toBuffer();
  if (input) { try { return await encode(input); } catch { /* Fallback on full decoding failure. */ } }
  return encode(await fallback());
}
export function shareImageResponse(buffer: Buffer) {
  return new Response(new Uint8Array(buffer),{ headers: { 'Content-Type': 'image/jpeg','Content-Length': String(buffer.length),'Cache-Control': 'public, max-age=0, must-revalidate','X-Content-Type-Options': 'nosniff' } });
}
