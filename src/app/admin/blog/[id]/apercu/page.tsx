import { notFound } from 'next/navigation';
import Link from 'next/link';
import Article from '@/components/blog/Article';
import { requireBlogAdmin } from '@/lib/blog/access';
import { adminArticle } from '@/lib/blog/data';
import s from '@/components/blog/blog.module.css';
export const dynamic = 'force-dynamic';
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) { await requireBlogAdmin(); const id = Number((await params).id); if (!Number.isSafeInteger(id) || id < 1) notFound(); const article = await adminArticle(id); if (!article) notFound(); return <main><div className={s.previewBanner}>Prévisualisation privée du brouillon enregistré · <Link href={`/admin/blog/${id}`}>Retour à l’éditeur</Link></div><Article draft={article.draft} slug={article.slug} /></main>; }
