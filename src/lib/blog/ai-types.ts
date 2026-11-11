import { emptyDraft, validateDraft, type BlogDraft, type BlogNode } from './content';
export const aiTones = ['Professionnel', 'Pédagogique', 'Expert', 'Accessible et humain', 'Storytelling'] as const;
export type AIProposal = { title: string; excerpt: string; seoTitle: string; seoDescription: string; content: BlogNode; checkpoints: string[]; reference?: { url: string; title: string; outline: string[] } };
export function validateAIBrief(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Brief invalide.');
  const v = value as Record<string, unknown>;
  function str(key: string, max: number) { const text = v[key]; if (typeof text !== 'string' || text.length > max) throw new Error(`Champ ${key} invalide ou trop long.`); return text.trim(); }
  const subject = str('subject', 300); if (subject.length < 8) throw new Error('Précisez le sujet de votre article (8 caractères minimum).');
  const tone = str('tone', 50); if (!(aiTones as readonly string[]).includes(tone)) throw new Error('Ton invalide.');
  const length = Number(v.length); if (![600,900,1200].includes(length)) throw new Error('Longueur invalide.');
  return { subject, tone, length, audience: str('audience',300), facts: str('facts',6000), structure: str('structure',4000), referenceUrl: str('referenceUrl',2000), category: str('category',100) };
}
export function proposalFromAI(value: unknown, category: string): AIProposal {
  if (!value || typeof value !== 'object') throw new Error('Proposition IA invalide.');
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.sections) || !v.sections.length || v.sections.length > 70) throw new Error('Structure générée invalide.');
  const nodes: BlogNode[] = v.sections.map((section: unknown) => {
    if (!section || typeof section !== 'object') throw new Error('Section invalide.');
    const x = section as Record<string, unknown>;
    if (typeof x.text !== 'string' || x.text.length > 12000 || !Array.isArray(x.items)) throw new Error('Texte généré invalide.');
    const inline = (text: string): BlogNode[] => [{ type: 'text', text }];
    if (x.kind === 'heading2' || x.kind === 'heading3') return { type: 'heading', attrs: { level: x.kind === 'heading2' ? 2 : 3 }, content: inline(x.text) };
    if (x.kind === 'paragraph') return { type: 'paragraph', content: inline(x.text) };
    if (x.kind === 'bullets') {
      if (x.items.length > 20 || x.items.some(item => typeof item !== 'string' || !item.trim() || item.length > 2000)) throw new Error('Liste générée invalide.');
      return { type: 'bulletList', content: x.items.map(text => ({ type: 'listItem', content: [{ type: 'paragraph', content: inline(text as string) }] })) };
    }
    throw new Error('Type de section inconnu.');
  });
  const draft: BlogDraft = validateDraft({ ...emptyDraft, category, title: v.title, excerpt: v.excerpt, seoTitle: v.seoTitle, seoDescription: v.seoDescription, content: { type: 'doc', content: nodes } }, true);
  if (!Array.isArray(v.checkpoints) || v.checkpoints.length > 20 || v.checkpoints.some(p => typeof p !== 'string' || p.length > 500)) throw new Error('Points à vérifier invalides.');
  return { title: draft.title, excerpt: draft.excerpt, seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, content: draft.content, checkpoints: v.checkpoints };
}
export const articleSchema = {
  type: 'object', additionalProperties: false,
  required: ['title','excerpt','seoTitle','seoDescription','sections','checkpoints'],
  properties: {
    title: { type: 'string' }, excerpt: { type: 'string' }, seoTitle: { type: 'string' }, seoDescription: { type: 'string' },
    sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['kind','text','items'], properties: { kind: { type: 'string', enum: ['heading2','heading3','paragraph','bullets'] }, text: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } } },
    checkpoints: { type: 'array', items: { type: 'string' } },
  },
};
