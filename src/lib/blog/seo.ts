import type { Metadata } from 'next';
import type { BlogArticle } from './data';
export const BLOG_SITE_URL = 'https://hoplagroupe.com';
export function shareImageURL(slug?: string, version?: string | null) {
  const url = new URL(`/api/blog/share-image${slug ? `/${encodeURIComponent(slug)}` : ''}`,BLOG_SITE_URL);
  if (version) url.searchParams.set('v',version);
  return url.href;
}
export function blogMetadata(query: { q?: string; categorie?: string; page?: string }): Metadata {
  const params = new URLSearchParams();
  if (query.categorie) params.set('categorie',query.categorie);
  if (/^\d{1,7}$/.test(query.page || '') && Number(query.page) > 1) params.set('page',String(Number(query.page)));
  const url = `${BLOG_SITE_URL}/blog${params.size ? `?${params}` : ''}`;
  const title = 'Le blog — Regards et conseils';
  const description = 'Digital, organisation et ressources humaines : les conseils de Hopla Groupe pour faire avancer votre entreprise.';
  const image = { url: shareImageURL(), secureUrl: shareImageURL(), width: 1200, height: 630, type: 'image/jpeg', alt: 'Hopla Groupe — Digital, organisation et développement' };
  return { title,description,alternates: { canonical: url },robots: { index: !query.q && !query.categorie,follow: true,googleBot: { index: !query.q && !query.categorie,follow: true,'max-image-preview': 'large' } },openGraph: { type: 'website',title: 'Le blog Hopla Groupe',description,url,siteName: 'Hopla Groupe',locale: 'fr_CI',images: [image] },twitter: { card: 'summary_large_image',title: 'Le blog Hopla Groupe',description,images: [{ url: image.url,alt: image.alt }] } };
}
export function articleMetadata(article: BlogArticle): Metadata {
  const d = article.published;
  if (!d) return { title: 'Article introuvable',robots: { index: false,follow: false },alternates: { canonical: null } };
  const title = d.seoTitle || d.title; const description = d.seoDescription || d.excerpt;
  const url = `${BLOG_SITE_URL}/blog/${article.slug}`;
  const imageUrl = shareImageURL(article.slug,article.publishedAt);
  const image = { url: imageUrl,secureUrl: imageUrl,width: 1200,height: 630,type: 'image/jpeg',alt: d.coverAlt || d.title };
  return { title,description,authors: [{ name: d.author }],alternates: { canonical: url },robots: { index: true,follow: true,googleBot: { index: true,follow: true,'max-image-preview': 'large','max-snippet': -1,'max-video-preview': -1 } },openGraph: { type: 'article',title,description,url,siteName: 'Hopla Groupe',locale: 'fr_CI',publishedTime: article.firstPublishedAt || undefined,modifiedTime: article.publishedAt || undefined,authors: [d.author],images: [image] },twitter: { card: 'summary_large_image',title,description,images: [{ url: imageUrl,alt: image.alt }] } };
}
