import Link from 'next/link';
import type { BlogArticle } from '@/lib/blog/data';
import { readingTime, textContent } from '@/lib/blog/content';
import { formatDate } from './Article';
import s from './blog.module.css';
import cardStyles from './cards.module.css';

function cardExcerpt(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length > 24 ? `${words.slice(0, 24).join(' ')} (..)` : words.join(' ');
}

export default function Cards({ articles }: { articles: BlogArticle[] }) {
  return <div className={s.grid}>
    {articles.map(article => {
      const draft = article.published!;
      const href = `/blog/${article.slug}`;
      const excerpt = cardExcerpt(draft.excerpt.trim() || textContent(draft.content));
      return <article key={article.id} className={s.card}>
        <Link className={s.cardImage} href={href} tabIndex={-1} aria-hidden="true">
          {draft.cover
            ? <img loading="lazy" src={draft.cover} alt="" />
            : <span>Les regards Hopla<span>↗</span></span>}
        </Link>
        <div className={s.cardBody}>
          <span className={s.eyebrow}>{draft.category}</span>
          <h2><Link href={href}>{draft.title}</Link></h2>
          <p>{excerpt}</p>
          <div className={s.meta}>
            {article.firstPublishedAt && <time dateTime={article.firstPublishedAt}>{formatDate(article.firstPublishedAt)}</time>}
            <span>{readingTime(draft.content)} min</span>
          </div>
          <Link className={cardStyles.readButton} href={href} aria-label={`Lire l’article : ${draft.title}`}>
            Lire l’article <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </article>;
    })}
  </div>;
}
