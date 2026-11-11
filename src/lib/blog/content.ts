export const categories = ['Sites web et e-commerce', 'Digitalisation et outils métiers', 'Organisation et structuration', 'Ressources humaines', 'Pilotage de projets', 'Développement des entreprises'] as const;
export type BlogNode = { type: string; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[]; content?: BlogNode[] };
export type BlogDraft = { schemaVersion: 1; title: string; excerpt: string; category: string; author: string; cover: string; coverAlt: string; seoTitle: string; seoDescription: string; content: BlogNode };
export const emptyDraft: BlogDraft = { schemaVersion: 1, title: '', excerpt: '', category: categories[0], author: 'Hopla Groupe', cover: '', coverAlt: '', seoTitle: '', seoDescription: '', content: { type: 'doc', content: [{ type: 'paragraph' }] } };
export function slugify(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150).replace(/-$/, ''); }
export function textContent(node: BlogNode): string { return node.text ?? (node.content ?? []).map(textContent).join(' '); }
export function readingTime(node: BlogNode) { return Math.max(1, Math.ceil(textContent(node).trim().split(/\s+/).filter(Boolean).length / 220)); }
export function safeLink(value: unknown): string | null {
  if (typeof value !== 'string' || /[\x00-\x20\\]/.test(value)) return null;
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return value;
  try { const u = new URL(value); return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? value : null; } catch { return null; }
}
export function isBlogImage(value: unknown): value is string { return typeof value === 'string' && /^\/api\/blog\/media\/[a-f0-9-]{36}\.webp$/.test(value); }
function field(value: unknown, max: number) { if (typeof value !== 'string' || value.length > max) throw new Error('Champ absent ou trop long.'); return value.trim(); }
export function validateDraft(value: unknown, publishing = false): BlogDraft {
  if (!value || typeof value !== 'object') throw new Error('Article invalide.');
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== 1) throw new Error('Version de contenu non prise en charge.');
  let count = 0;
  function node(value: unknown, depth = 0): BlogNode {
    if (++count > 12000 || depth > 20 || !value || typeof value !== 'object') throw new Error('Document trop volumineux ou invalide.');
    const n = value as BlogNode;
    if (!['doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'hardBreak', 'horizontalRule', 'image'].includes(n.type)) throw new Error('Bloc non pris en charge.');
    const out: BlogNode = { type: n.type };
    if (n.type === 'text') { if (typeof n.text !== 'string' || n.text.length > 50000) throw new Error('Texte invalide.'); out.text = n.text; }
    if (n.type === 'heading') { if (![2, 3].includes(Number(n.attrs?.level))) throw new Error('Utilisez des titres H2 ou H3.'); out.attrs = { level: Number(n.attrs?.level) }; }
    if (n.type === 'orderedList') out.attrs = { start: Math.min(10000, Math.max(1, Number(n.attrs?.start) || 1)) };
    if (n.type === 'image') {
      if (!isBlogImage(n.attrs?.src)) throw new Error('Image non autorisée : utilisez le téléversement.');
      const alt = field(n.attrs?.alt ?? '', 300);
      if (publishing && !alt) throw new Error('Renseignez une alternative pour chaque image.');
      out.attrs = { src: n.attrs.src, alt, title: field(n.attrs?.title ?? '', 300) };
    }
    if (n.marks) {
      if (!Array.isArray(n.marks) || n.marks.length > 8) throw new Error('Format de texte invalide.');
      out.marks = n.marks.map(m => {
        if (!['bold', 'italic', 'underline', 'strike', 'code', 'link'].includes(m.type)) throw new Error('Format non pris en charge.');
        if (m.type === 'link') { const href = safeLink(m.attrs?.href); if (!href) throw new Error('Lien invalide.'); return { type: 'link', attrs: { href } }; }
        return { type: m.type };
      });
    }
    if (n.content) { if (!Array.isArray(n.content)) throw new Error('Contenu invalide.'); out.content = n.content.map(c => node(c, depth + 1)); }
    return out;
  }
  const content = node(v.content);
  if (content.type !== 'doc') throw new Error('Document attendu.');
  const draft: BlogDraft = { schemaVersion: 1, title: field(v.title, 180), excerpt: field(v.excerpt, 500), category: field(v.category, 100), author: field(v.author, 100), cover: field(v.cover, 200), coverAlt: field(v.coverAlt, 300), seoTitle: field(v.seoTitle, 180), seoDescription: field(v.seoDescription, 320), content };
  if (!(categories as readonly string[]).includes(draft.category)) throw new Error('Catégorie invalide.');
  if (draft.cover && !isBlogImage(draft.cover)) throw new Error('Couverture invalide.');
  if (publishing) {
    const missing = [!draft.title && 'le titre', !draft.excerpt && 'le résumé', !draft.author && 'l’auteur', !textContent(content).trim() && 'le contenu', draft.cover && !draft.coverAlt && 'la description de la couverture'].filter(Boolean);
    if (missing.length) throw new Error(`À compléter avant publication : ${missing.join(', ')}.`);
  }
  return draft;
}
export function headings(content: BlogNode) {
  let index = 0;
  const result: { id: string; text: string; level: number }[] = [];
  function visit(n: BlogNode) { if (n.type === 'heading') result.push({ id: `section-${++index}`, text: textContent(n), level: Number(n.attrs?.level) }); n.content?.forEach(visit); }
  visit(content); return result;
}
