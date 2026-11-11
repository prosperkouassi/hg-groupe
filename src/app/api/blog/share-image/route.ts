import { buildShareImage, shareImageResponse } from '@/lib/blog/share-image';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return shareImageResponse(await buildShareImage()); }
  catch { return new Response(null,{ status: 503,headers: { 'Retry-After': '60' } }); }
}
