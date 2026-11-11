import { Fragment, type ReactNode } from 'react';
import { headings, safeLink, isBlogImage, type BlogNode } from '@/lib/blog/content';
import s from './blog.module.css';
export default function Content({ content }: { content: BlogNode }) {
  let headingIndex = 0;
  function render(node: BlogNode, key: number): ReactNode {
    const children = node.content?.map(render);
    if (node.type === 'text') {
      let text: ReactNode = node.text;
      for (const mark of node.marks || []) {
        if (mark.type === 'bold') text = <strong>{text}</strong>;
        if (mark.type === 'italic') text = <em>{text}</em>;
        if (mark.type === 'underline') text = <u>{text}</u>;
        if (mark.type === 'strike') text = <s>{text}</s>;
        if (mark.type === 'code') text = <code>{text}</code>;
        if (mark.type === 'link') { const href = safeLink(mark.attrs?.href); if (href) text = <a href={href} rel="noopener noreferrer">{text}</a>; }
      }
      return <Fragment key={key}>{text}</Fragment>;
    }
    switch (node.type) {
      case 'doc': return <Fragment key={key}>{children}</Fragment>;
      case 'paragraph': return <p key={key}>{children}</p>;
      case 'heading': { const id = `section-${++headingIndex}`; return Number(node.attrs?.level) === 3 ? <h3 id={id} key={key}>{children}</h3> : <h2 id={id} key={key}>{children}</h2>; }
      case 'bulletList': return <ul key={key}>{children}</ul>;
      case 'orderedList': return <ol key={key} start={Number(node.attrs?.start) || 1}>{children}</ol>;
      case 'listItem': return <li key={key}>{children}</li>;
      case 'blockquote': return <blockquote key={key}>{children}</blockquote>;
      case 'horizontalRule': return <hr key={key} />;
      case 'hardBreak': return <br key={key} />;
      case 'image': return isBlogImage(node.attrs?.src) ? <figure key={key}><img loading="lazy" src={node.attrs.src} alt={String(node.attrs.alt || '')} />{node.attrs.title ? <figcaption>{String(node.attrs.title)}</figcaption> : null}</figure> : null;
      default: return null;
    }
  }
  return <div className={s.prose}>{render(content, 0)}</div>;
}
export function TableOfContents({ content }: { content: BlogNode }) {
  const items = headings(content); if (!items.length) return null;
  return <nav className={s.toc} aria-label="Sommaire"><p>Dans cet article</p><ol>{items.map(h => <li key={h.id} className={h.level === 3 ? s.subheading : undefined}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol></nav>;
}
