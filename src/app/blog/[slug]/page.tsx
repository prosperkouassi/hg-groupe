import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Article from '@/components/blog/Article';
import Cards from '@/components/blog/Cards';
import { publishedArticle, listPublished } from '@/lib/blog/data';
import s from '@/components/blog/blog.module.css';
import { articleMetadata, shareImageURL } from '@/lib/blog/seo';
export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await publishedArticle((await params).slug); if (!article?.published) return { title: 'Article introuvable', robots: { index: false, follow: false }, alternates: { canonical: null } };
  return articleMetadata(article);
}
export default async function ArticlePage({ params }: Props) {
  const article = await publishedArticle((await params).slug); if (!article?.published) notFound(); const d = article.published;
  const related = await listPublished({ category: d.category, exclude: article.id, size: 3 });
  const url = `https://hoplagroupe.com/blog/${article.slug}`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: d.title, description: d.excerpt, author: { '@type': d.author === 'Hopla Groupe' ? 'Organization' : 'Person', name: d.author }, publisher: { '@id': 'https://hoplagroupe.com/#organization' }, datePublished: article.firstPublishedAt, dateModified: article.publishedAt, mainEntityOfPage: url, image: [shareImageURL(article.slug,article.publishedAt)] }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://hoplagroupe.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://hoplagroupe.com/blog' }, { '@type': 'ListItem', position: 3, name: d.title, item: url }] }];
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g,'\\u003c') }} /><Article draft={d} slug={article.slug} date={article.firstPublishedAt} updated={article.publishedAt} />{related.total > 0 && <section className={`${s.page} ${s.related}`} style={{ paddingTop: 0 }}><h2>Pour prolonger la réflexion</h2><Cards articles={related.articles} /></section>}</main>;
}
