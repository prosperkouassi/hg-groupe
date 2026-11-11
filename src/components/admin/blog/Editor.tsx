'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import FileHandler from '@tiptap/extension-file-handler';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { categories, emptyDraft, readingTime, slugify, type BlogDraft, type BlogNode } from '@/lib/blog/content';
import type { BlogArticle } from '@/lib/blog/data';
import s from './admin-blog.module.css';
import { readBlogResponse } from '@/lib/blog/http';
import ConfirmDialog from './ConfirmDialog';
import AIAssistant from './AIAssistant';
import SchedulePanel from './SchedulePanel';
import { type AIProposal } from '@/lib/blog/ai-types';
export default function BlogEditor({ article }: { article?: BlogArticle }) {
  const router = useRouter(); const [draft, setDraft] = useState<BlogDraft>(article?.draft || emptyDraft); const [slug, setSlug] = useState(article?.slug || ''); const [id, setId] = useState(article?.id); const [version, setVersion] = useState(article?.version || 1); const [published, setPublished] = useState(!!article?.published); const [slugLocked, setSlugLocked] = useState(!!article?.firstPublishedAt);
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [scheduledAt,setScheduledAt] = useState<string | null>(null);
  const [scheduledTitle,setScheduledTitle] = useState('');
  const [scheduleError,setScheduleError] = useState('');
  const [confirmation, setConfirmation] = useState<'publish' | 'unpublish' | null>(null);
  const input = useRef<HTMLInputElement>(null); const coverInput = useRef<HTMLInputElement>(null); const editorRef = useRef<TiptapEditor | null>(null); const uploadBusy = useRef(false); const uploadingRef = useRef(false); const savingRef = useRef(false);
  const upload = useCallback(async (file: File) => { const form = new FormData(); form.set('file', file); const r = await fetch('/api/admin/blog/media', { method: 'POST', body: form }); const data = await readBlogResponse(r, 'upload'); return data.src; }, []);
  const insertImages = useCallback(async (files: File[], position?: number) => {
    if (uploadBusy.current) return; uploadBusy.current = true; uploadingRef.current = true; setUploading(true); setError('');
    try {
      let at = position;
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const alt = window.prompt('Décrivez cette image pour les lecteurs qui ne la voient pas', file.name.replace(/\.[^.]+$/, ''));
        if (alt === null) continue;
        const src = await upload(file); const editor = editorRef.current; if (!editor) continue;
        if (at !== undefined) editor.chain().focus().insertContentAt(at, { type: 'image', attrs: { src, alt, title: '' } }).run();
        else editor.chain().focus().setImage({ src, alt, title: '' }).run();
        at = editor.state.selection.to;
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Envoi impossible.'); }
    finally { uploadBusy.current = false; uploadingRef.current = false; setUploading(false); }
  }, [upload]);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2,3] }, codeBlock: false, link: { openOnClick: false } }), Image.configure({ allowBase64: false }), FileHandler.configure({ allowedMimeTypes: ['image/jpeg','image/png','image/webp','image/avif'], onDrop: (_editor, files, pos) => { void insertImages(files, pos); }, onPaste: (_editor, files) => { void insertImages(files); } })],
    content: draft.content, immediatelyRender: false,
    onUpdate: ({ editor }) => { setDraft(d => ({ ...d, content: editor.getJSON() as BlogNode })); setDirty(true); },
    editorProps: { attributes: { 'aria-label': 'Contenu de l’article', class: s.editorCanvas } },
  });
  useEffect(() => { editorRef.current = editor; }, [editor]);
  useEffect(() => { editor?.setEditable(!busy && !uploading, false); }, [editor, busy, uploading]);
  useEffect(() => { if (!dirty) return; const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener('beforeunload',handler); return () => window.removeEventListener('beforeunload',handler); }, [dirty]);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/admin/blog/${id}`, { cache: 'no-store', signal: controller.signal });
        const data = JSON.parse(await response.text());
        if (!response.ok) throw new Error(data.message || 'Programmation indisponible.');
        if (!controller.signal.aborted) { setScheduledAt(data.schedule?.scheduledAt || null); setScheduledTitle(data.schedule?.title || ''); setScheduleError(''); }
      } catch (e) { if (!controller.signal.aborted) setScheduleError(e instanceof Error ? e.message : 'Programmation indisponible.'); }
    })();
    return () => controller.abort();
  }, [id, version]);
  function applyAI(proposal: AIProposal) {
    if (busy || uploadingRef.current) return;
    editor?.commands.setContent(proposal.content);
    setDraft(current => ({ ...current, title: proposal.title, excerpt: proposal.excerpt, seoTitle: proposal.seoTitle, seoDescription: proposal.seoDescription, content: proposal.content }));
    if (!id) setSlug(slugify(proposal.title));
    setDirty(true); setMessage('Proposition insérée. Relisez puis enregistrez votre brouillon.');
  }
  function change<K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) { setDraft(d => ({ ...d, [key]: value })); setDirty(true); }
  async function save(action: 'save' | 'publish' | 'unpublish' | 'schedule' | 'cancelSchedule', forPreview = false, datetime?: string): Promise<number | undefined> {
    if (savingRef.current || uploadingRef.current) return;
    savingRef.current = true; setBusy(true); setError(''); setMessage('');
    try {
      let articleId = id; let articleVersion = version;
      const content = editor?.getJSON() as BlogNode | undefined; const current = { ...draft, content: content || draft.content }; const address = slug || slugify(draft.title);
      if (!articleId) {
        const r = await fetch('/api/admin/blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft: current, slug: address }) }); const data = await readBlogResponse(r, 'create');
        articleId = data.id; articleVersion = data.version; setId(articleId); setVersion(articleVersion); setSlug(address);
        window.history.replaceState(null,'',`/admin/blog/${articleId}`);
      }
      if (id || action !== 'save') {
        const r = await fetch(`/api/admin/blog/${articleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft: current, slug: address, version: articleVersion, action, scheduledAt: datetime }) }); const data = await readBlogResponse(r, 'update'); setVersion(data.version);
      }
      if (action === 'publish') { setPublished(true); setSlugLocked(true); }
      if (action === 'unpublish') setPublished(false);
      if (action === 'schedule' && datetime) { setScheduledAt(`${datetime}:00.000Z`); setScheduledTitle(current.title); }
      else if (action !== 'save') { setScheduledAt(null); setScheduledTitle(''); }
      setDirty(false); setMessage(action === 'schedule' ? 'Publication programmée. La version actuelle est conservée pour cette échéance.' : action === 'cancelSchedule' ? 'Programmation annulée. Le brouillon est conservé.' : action === 'publish' ? 'La version est publiée.' : action === 'unpublish' ? 'Article retiré du site. Le brouillon est conservé.' : 'Brouillon enregistré.');
      if (!forPreview) router.refresh();
      return articleId;
    } catch (e) { setError(e instanceof Error ? e.message : 'Enregistrement impossible.'); } finally { savingRef.current = false; setBusy(false); }
  }
  async function preview() {
    const articleId = await save('save', true);
    if (articleId) router.push(`/admin/blog/${articleId}/apercu`);
  }
  async function confirmPublication() {
    if (!confirmation || savingRef.current) return;
    const savedId = await save(confirmation);
    if (savedId) setConfirmation(null);
  }
  function tool(label: string, action: () => void, active = false) { return <button type="button" key={label} onClick={action} aria-pressed={active} disabled={!editor || busy || uploading}>{label}</button>; }
  return <main className={s.main}><ConfirmDialog
    open={confirmation !== null}
    title={confirmation === 'unpublish' ? 'Retirer cet article du site ?' : published ? 'Publier les modifications ?' : 'Publier cet article ?'}
    description={confirmation === 'unpublish' ? 'L’article ne sera plus visible sur le site. Votre brouillon sera conservé.' : 'Cette version sera visible par les visiteurs du blog.'}
    confirmLabel={confirmation === 'unpublish' ? 'Dépublier' : 'Publier'}
    busy={busy}
    error={error}
    onCancel={() => { if (!savingRef.current) setConfirmation(null); }}
    onConfirm={() => void confirmPublication()}
  /><div className={s.top}><div><Link href="/admin/blog" onClick={e => { if (dirty && !window.confirm('Quitter sans enregistrer vos modifications ?')) e.preventDefault(); }}>← Tous les articles</Link><h1>{id ? 'Modifier l’article' : 'Nouvel article'}</h1><p>{published ? 'Une version est en ligne. Les modifications restent en brouillon jusqu’à publication.' : 'Brouillon privé'} · {readingTime(draft.content)} min de lecture</p></div></div>
    <div className={s.actions}><button disabled={busy || uploading} onClick={() => void save('save')}>{busy ? 'Enregistrement…' : 'Enregistrer le brouillon'}</button><button type="button" disabled={busy || uploading} onClick={() => void preview()}>Prévisualiser ↗</button><button className={s.primary} disabled={busy || uploading} onClick={() => { setError(''); setConfirmation('publish'); }}>{published ? 'Publier les modifications' : 'Publier l’article'}</button>{published && <button disabled={busy || uploading} onClick={() => { setError(''); setConfirmation('unpublish'); }}>Dépublier</button>}</div>
    <p role="status" className={s.status}>{uploading ? 'Téléversement de l’image…' : message || (dirty ? 'Modifications non enregistrées' : '')}</p>{error && <p role="alert" className={s.error}>{error}</p>}
    <AIAssistant category={draft.category} disabled={busy || uploading || confirmation !== null} onApply={applyAI} />
    <SchedulePanel scheduledAt={scheduledAt} scheduledTitle={scheduledTitle} busy={busy || uploading} error={error} onSchedule={async datetime => !!await save('schedule', false, datetime)} onCancelSchedule={async () => !!await save('cancelSchedule')} />
    {scheduleError && <p role="alert" className={s.error}>{scheduleError}</p>}
    <fieldset className={s.form} disabled={busy || uploading}><div className={s.fields}><label>Titre<input value={draft.title} maxLength={180} onChange={e => { change('title',e.target.value); if (!id) setSlug(slugify(e.target.value)); }} /></label><label>Adresse de l’article<input value={slug} disabled={slugLocked || !!scheduledAt} maxLength={150} onChange={e => { setSlug(e.target.value); setDirty(true); }} /><small>/blog/{slug || 'adresse-de-l-article'}{slugLocked ? ' · Adresse conservée après publication' : ''}</small></label><label>Résumé<textarea value={draft.excerpt} maxLength={500} rows={3} onChange={e => change('excerpt',e.target.value)} /></label><div className={s.columns}><label>Catégorie<select value={draft.category} onChange={e => change('category',e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Auteur<input value={draft.author} maxLength={100} onChange={e => change('author',e.target.value)} /></label></div></div>
    <section className={s.panel}><h2>Image de couverture</h2>{draft.cover && <img className={s.cover} src={draft.cover} alt={draft.coverAlt} />}<input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file || uploadBusy.current) return; uploadBusy.current = true; uploadingRef.current = true; setUploading(true); setError(''); try { change('cover', await upload(file)); } catch (e) { setError(e instanceof Error ? e.message : 'Envoi impossible.'); } finally { uploadBusy.current = false; uploadingRef.current = false; setUploading(false); } }} /><button type="button" onClick={() => coverInput.current?.click()}>Choisir une image</button>{draft.cover && <button type="button" onClick={() => { change('cover',''); change('coverAlt',''); }}>Retirer</button>}<label>Description de la couverture<input value={draft.coverAlt} maxLength={300} onChange={e => change('coverAlt',e.target.value)} /></label><small>JPG, PNG, WebP ou AVIF · 8 Mo maximum · Image optimisée automatiquement</small></section>
    <section className={s.panel}><h2>Contenu de l’article</h2><p className={s.help}>Écrivez, collez votre texte ou glissez vos images dans l’éditeur. Cliquez sur une image puis sur « Propriétés image » pour modifier son alternative et sa légende.</p><div className={s.toolbar} role="toolbar" aria-label="Mise en forme">{tool('Gras',() => { editor?.chain().focus().toggleBold().run(); },editor?.isActive('bold'))}{tool('Italique',() => { editor?.chain().focus().toggleItalic().run(); },editor?.isActive('italic'))}{tool('Souligné',() => { editor?.chain().focus().toggleUnderline().run(); })}{tool('H2',() => { editor?.chain().focus().toggleHeading({ level: 2 }).run(); })}{tool('H3',() => { editor?.chain().focus().toggleHeading({ level: 3 }).run(); })}{tool('Liste',() => { editor?.chain().focus().toggleBulletList().run(); })}{tool('Liste numérotée',() => { editor?.chain().focus().toggleOrderedList().run(); })}{tool('Citation',() => { editor?.chain().focus().toggleBlockquote().run(); })}{tool('Lien',() => { const href = window.prompt('Adresse du lien (https://…)', editor?.getAttributes('link').href || 'https://'); if (href === null) return; if (!href) editor?.chain().focus().unsetLink().run(); else editor?.chain().focus().extendMarkRange('link').setLink({ href }).run(); })}{tool('Image',() => input.current?.click())}{tool('Propriétés image',() => { if (!editor?.isActive('image')) { setError('Cliquez d’abord sur une image dans le texte.'); return; } const attrs = editor.getAttributes('image'); const alt = window.prompt('Description de l’image',attrs.alt || ''); if (alt === null) return; const title = window.prompt('Légende', attrs.title || ''); if (title === null) return; editor.chain().focus().updateAttributes('image',{ alt,title }).run(); })}{tool('Annuler',() => { editor?.chain().focus().undo().run(); })}{tool('Rétablir',() => { editor?.chain().focus().redo().run(); })}</div><input type="file" ref={input} hidden accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={e => { void insertImages(Array.from(e.target.files || [])); e.target.value = ''; }} /><EditorContent editor={editor} /></section>
    <section className={s.panel}><h2>Référencement</h2><label>Titre SEO (facultatif)<input value={draft.seoTitle} maxLength={180} placeholder={draft.title} onChange={e => change('seoTitle',e.target.value)} /></label><label>Description SEO (facultative)<textarea rows={2} maxLength={320} value={draft.seoDescription} placeholder={draft.excerpt} onChange={e => change('seoDescription',e.target.value)} /></label></section></fieldset></main>;
}
