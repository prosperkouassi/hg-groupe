import type { Metadata } from 'next';
import Link from 'next/link';
import Cards from '@/components/blog/Cards';
import { categories } from '@/lib/blog/content';
import { listPublished } from '@/lib/blog/data';
import s from '@/components/blog/blog.module.css';
export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ q?: string; categorie?: string; page?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams; const query = new URLSearchParams(); if (p.categorie) query.set('categorie', p.categorie); if (Number(p.page) > 1) query.set('page', String(Math.floor(Number(p.page))));
  return { title: 'Le blog — Regards et conseils', description: 'Digital, organisation et ressources humaines : les conseils de Hopla Groupe pour faire avancer votre entreprise.', alternates: { canonical: `/blog${query.size ? `?${query}` : ''}` }, robots: p.q || p.categorie ? { index: false, follow: true } : undefined, openGraph: { title: 'Le blog Hopla Groupe', description: 'Des idées concrètes pour faire avancer votre entreprise', url: '/blog', type: 'website', images: ['/images/og-hopla-groupe.jpg'] } };
}
export default async function BlogPage({ searchParams }: Props) {
  const p = await searchParams; const q = typeof p.q === 'string' ? p.q.slice(0,120) : ''; const category = typeof p.categorie === 'string' && (categories as readonly string[]).includes(p.categorie) ? p.categorie : '';
  const page = /^\d{1,7}$/.test(p.page || '') ? Number(p.page) : 1;
  let data; try { data = await listPublished({ q, category, page }); } catch { throw new Error('Blog temporairement indisponible.'); }
  function href(categoryValue: string, pageValue = 1) { const search = new URLSearchParams(); if (q) search.set('q',q); if (categoryValue) search.set('categorie',categoryValue); if (pageValue > 1) search.set('page',String(pageValue)); return `/blog${search.size ? `?${search}` : ''}`; }
  return <main className={s.page}><nav className={s.breadcrumb} aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span>/</span><span>Blog</span></nav><header className={s.hero}><span className={s.eyebrow}>Le journal Hopla</span><h1>Des regards croisés<br />pour <em>aller plus loin</em></h1><p className={s.lead}>Digital, organisation et ressources humaines : des idées concrètes pour faire avancer votre entreprise</p></header><form className={s.search} action="/blog"><label className="sr-only" htmlFor="blog-search">Rechercher un article</label><input id="blog-search" name="q" defaultValue={q} maxLength={120} placeholder="Un sujet, une question…" />{category && <input type="hidden" name="categorie" value={category} />}<button className={s.button}>Rechercher</button></form><nav className={s.filters} aria-label="Catégories"><Link href={href('')} aria-current={!category}>Tous les articles</Link>{categories.map(c => <Link key={c} href={href(c)} aria-current={category === c}>{c}</Link>)}</nav><p className={s.results}>{data.total} article{data.total > 1 ? 's' : ''}{q ? ` pour « ${q} »` : ''}</p>{data.articles.length ? <Cards articles={data.articles} /> : <section className={s.empty}><h2>{q || category ? 'Aucun article pour cette recherche' : 'Nos premiers articles arrivent bientôt'}</h2><p>{q || category ? 'Essayez un autre mot-clé ou une autre catégorie' : 'Retrouvez prochainement les conseils et les regards de notre équipe'}</p></section>}{data.pages > 1 && <nav className={s.pagination} aria-label="Pagination">{data.page > 1 && <Link href={href(category, data.page - 1)}>← Précédent</Link>}<span>Page {data.page} sur {data.pages}</span>{data.page < data.pages && <Link href={href(category, data.page + 1)}>Suivant →</Link>}</nav>}</main>;
}
