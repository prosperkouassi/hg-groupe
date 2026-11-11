'use client';

import { useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Partner } from '@/lib/partner-types';

const empty = { name: '', logo_path: '', website_url: '', display_order: 0, status: 'draft' as Partner['status'] };
export default function PartnerManager({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  function reset() { setEditing(null); setForm(empty); if (file.current) file.current.value = ''; }
  async function upload(image: File) {
    setBusy(true); setMessage('');
    try {
      const data = new FormData(); data.set('file', image);
      const response = await fetch('/api/admin/uploads/partner-logo', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setForm(value => ({ ...value, logo_path: result.path }));
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Envoi impossible.'); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/partners${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      reset(); setMessage('Partenaire enregistré.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  }
  async function action(partner: Partner, remove = false) {
    if (remove && !window.confirm(`Supprimer ${partner.name} ?`)) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, { method: remove ? 'DELETE' : 'PUT', headers: { 'Content-Type': 'application/json' }, ...(!remove ? { body: JSON.stringify({ ...partner, status: partner.status === 'published' ? 'draft' : 'published' }) } : {}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (editing === partner.id) reset();
      setMessage(remove ? 'Partenaire supprimé.' : 'Publication mise à jour.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Action impossible.'); }
    finally { setBusy(false); }
  }
  const input = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2';
  const button = 'rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50';
  return <div>
    <p role="status" aria-live="polite" className="mb-4 text-sm">{message}</p>
    <form onSubmit={save} className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-semibold">{editing ? 'Modifier le partenaire' : 'Ajouter un partenaire'}</h2>
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm">Nom du partenaire<input className={input} value={form.name} maxLength={150} required onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label className="text-sm">Site internet (facultatif)<input className={input} type="url" placeholder="https://" maxLength={500} value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} /></label>
        <label className="text-sm">Logo — PNG, JPG ou WebP, 4 Mo maximum<input ref={file} className={input} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const image = e.target.files?.[0]; if (image) void upload(image); }} /></label>
        <label className="text-sm">Ordre d’affichage<input className={input} type="number" min={0} max={2147483647} step={1} required value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} /><span className="mt-1 block text-xs text-slate-500">Les nombres les plus petits apparaissent en premier.</span></label>
        {form.logo_path && <Image src={form.logo_path} alt="Aperçu du logo" width={180} height={100} unoptimized className="h-24 w-44 object-contain" />}
        <label className="text-sm">Statut<select className={input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Partner['status'] })}><option value="draft">Brouillon</option><option value="published">Publié</option></select></label>
        <div className="flex gap-3 sm:col-span-2"><button className="rounded-lg bg-[#081426] px-5 py-3 text-sm text-white disabled:opacity-50" disabled={busy || !form.logo_path}>{busy ? 'Veuillez patienter…' : 'Enregistrer'}</button>{editing && <button type="button" className={button} onClick={reset}>Annuler</button>}</div>
      </fieldset>
    </form>
    <div className="space-y-3">
      {!partners.length && <p>Aucun partenaire enregistré. Ajoutez votre premier logo ci-dessus.</p>}
      {partners.map(partner => <article key={partner.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <Image src={partner.logo_path} alt={partner.name} width={90} height={60} unoptimized className="h-16 w-24 object-contain" />
        <div className="min-w-0 flex-1"><h2 className="font-semibold break-words">{partner.name}</h2><p className="text-xs text-slate-500">{partner.status === 'published' ? 'Publié' : 'Brouillon'} · Ordre {partner.display_order}</p></div>
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} className={button} onClick={() => { setEditing(partner.id); setForm({ ...partner, website_url: partner.website_url || '' }); setMessage(''); if (file.current) file.current.value = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Modifier</button>
          <button disabled={busy} className={button} onClick={() => void action(partner)}>{partner.status === 'published' ? 'Dépublier' : 'Publier'}</button>
          <button disabled={busy} className={`${button} text-red-700`} onClick={() => void action(partner, true)}>Supprimer</button>
        </div>
      </article>)}
    </div>
  </div>;
}
