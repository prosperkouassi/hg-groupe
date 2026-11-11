import { publishedArticle } from '@/lib/blog/data';
import { buildShareImage, shareImageResponse } from '@/lib/blog/share-image';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request,{ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 150) return new Response(null,{ status: 404 });
  try {
    // Never expose images from a draft or a scheduled-but-unpublished revision.
    const article = await publishedArticle(slug);
    if (!article?.published) return new Response(null,{ status: 404 });
    return shareImageResponse(await buildShareImage(article.published.cover));
  } catch { return new Response(null,{ status: 503,headers: { 'Retry-After': '60' } }); }
}
