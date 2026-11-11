import Link from 'next/link';
import type { BlogDraft } from '@/lib/blog/content';
import { readingTime } from '@/lib/blog/content';
import Content, { TableOfContents } from './Content';
import s from './blog.module.css';
export function formatDate(value: string) { return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Abidjan' }).format(new Date(value)); }
export default function Article({ draft, slug, date, updated }: { draft: BlogDraft; slug: string; date?: string | null; updated?: string | null }) {
  const url = encodeURIComponent(`https://hoplagroupe.com/blog/${slug}`);
  const shares = [['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${url}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`], ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(draft.title)}%20${url}`]];
  return <article className={s.article}>
    <nav className={s.breadcrumb} aria-label="Fil d’Ariane"><Link href="/">Accueil</Link><span>/</span><Link href="/blog">Blog</Link><span>/</span><span>Article</span></nav>
    <header className={s.articleHeader}><span className={s.eyebrow}>{draft.category}</span><h1>{draft.title}</h1><p className={s.lead}>{draft.excerpt}</p><div className={s.meta}><span>{draft.author}</span>{date && <time dateTime={date}>{formatDate(date)}</time>}<span>{readingTime(draft.content)} min de lecture</span></div>{updated && date && updated !== date && <p className={s.updated}>Mis à jour le {formatDate(updated)}</p>}</header>
    {draft.cover && <img className={s.cover} src={draft.cover} alt={draft.coverAlt} fetchPriority="high" />}
    <div className={s.reading}><aside><TableOfContents content={draft.content} /></aside><div><Content content={draft.content} /><div className={s.share}><span>Partager cet article</span>{shares.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div></div></div>
    <section className={s.cta}><span className={s.eyebrow}>Passons à votre projet</span><h2>Des idées à l’action</h2><p>Échangeons sur les enjeux et les prochaines étapes de votre entreprise</p><Link className={s.button} href="/contact">Parlons de vos besoins ↗</Link></section>
  </article>;
}
