'use client';
import { useRef, useState } from 'react';
import { aiTones, type AIProposal } from '@/lib/blog/ai-types';
import { textContent } from '@/lib/blog/content';
import ConfirmDialog from './ConfirmDialog';
import s from './ai-editorial.module.css';

type Props = { category: string; disabled: boolean; onApply: (proposal: AIProposal) => void };
export default function AIAssistant({ category, disabled, onApply }: Props) {
  const [subject,setSubject] = useState(''); const [audience,setAudience] = useState('Dirigeants et responsables de PME en Côte d’Ivoire');
  const [tone,setTone] = useState<string>(aiTones[0]); const [length,setLength] = useState('900'); const [referenceUrl,setReferenceUrl] = useState('');
  const [structure,setStructure] = useState(''); const [facts,setFacts] = useState(''); const [busy,setBusy] = useState(false); const inFlight = useRef(false);
  const [proposal,setProposal] = useState<AIProposal | null>(null); const [error,setError] = useState(''); const [confirm,setConfirm] = useState(false);
  async function generate() {
    if (disabled || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/blog/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(175000), body: JSON.stringify({ subject,audience,tone,length: Number(length),referenceUrl,structure,facts,category }) });
      let data; try { data = JSON.parse(await response.text()); } catch { throw new Error(`Réponse du serveur illisible (HTTP ${response.status}). Consultez le terminal du serveur.`); }
      if (!response.ok) throw new Error(data.message || 'Génération indisponible.');
      if (!data.proposal?.content || !data.proposal?.title) throw new Error('Proposition incomplète. Réessayez.');
      setProposal(data.proposal);
    } catch (e) { setError(e instanceof Error ? e.message : 'Génération indisponible.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <section className={s.panel} aria-labelledby="ai-title"><h2 id="ai-title">Rédiger avec ChatGPT</h2><p>Préparez un article original à partir d’un sujet et, si vous le souhaitez, de la structure d’un article de référence. Relisez la proposition avant de l’insérer.</p>
    <fieldset className={s.fields} disabled={disabled || busy}>
      <label>Sujet de l’article<input maxLength={300} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex. Comment structurer les recrutements d’une PME" /></label>
      <div className={s.grid}><label>Ton<select value={tone} onChange={e => setTone(e.target.value)}>{aiTones.map(t => <option key={t}>{t}</option>)}</select></label><label>Longueur souhaitée<select value={length} onChange={e => setLength(e.target.value)}><option value="600">Environ 600 mots</option><option value="900">Environ 900 mots</option><option value="1200">Environ 1 200 mots</option></select></label></div>
      <label>À qui s’adresse l’article ?<input maxLength={300} value={audience} onChange={e => setAudience(e.target.value)} /></label>
      <label>Lien d’un article de référence (facultatif)<input type="url" maxLength={2000} value={referenceUrl} onChange={e => setReferenceUrl(e.target.value)} placeholder="https://exemple.com/article" /><small>Seuls le titre et le plan sont analysés pour inspirer l’organisation. Le contenu de l’article n’est pas copié.</small></label>
      <label>Plan ou structure souhaitée (facultatif)<textarea rows={3} maxLength={4000} value={structure} onChange={e => setStructure(e.target.value)} placeholder="Introduction, problème, 5 conseils pratiques, exemple, conclusion…" /><small>Vous pouvez coller un plan ici si le site de référence n’est pas accessible.</small></label>
      <label>Informations à utiliser et consignes<textarea rows={4} maxLength={6000} value={facts} onChange={e => setFacts(e.target.value)} placeholder="Votre expertise, exemples réels autorisés, mots-clés, éléments à éviter…" /></label>
      <small>Le brief et le plan de référence sont envoyés à l’API OpenAI. Fournissez uniquement des informations que vous pouvez partager. La génération utilise votre configuration API côté serveur.</small>
      <div className={s.actions}><button type="button" className={s.primary} disabled={subject.trim().length < 8} onClick={() => void generate()}>{busy ? 'Rédaction en cours…' : 'Générer une proposition'}</button></div>
    </fieldset>
    <p role="status" className={s.status}>{busy ? 'Analyse du brief et rédaction. Cette opération peut prendre une à deux minutes.' : ''}</p>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {proposal && <div className={s.preview}><h3>{proposal.title}</h3><p>{proposal.excerpt}</p>{proposal.reference && <p className={s.info}>Structure de référence : {proposal.reference.title || proposal.reference.url}</p>}<div className={s.body}>{proposal.content.content?.map((n,i) => n.type === 'heading' ? Number(n.attrs?.level) === 3 ? <h5 key={i}>{textContent(n)}</h5> : <h4 key={i}>{textContent(n)}</h4> : n.type === 'bulletList' ? <ul key={i}>{n.content?.map((li,j) => <li key={j}>{textContent(li)}</li>)}</ul> : <p key={i}>{textContent(n)}</p>)}</div>{proposal.checkpoints.length > 0 && <div className={s.info}><p>Points à vérifier avant publication</p><ul>{proposal.checkpoints.map((p,i) => <li key={i}>{p}</li>)}</ul></div>}<div className={s.actions}><button type="button" className={s.primary} disabled={disabled || busy} onClick={() => setConfirm(true)}>Insérer dans le brouillon</button><button type="button" className={s.secondary} disabled={busy} onClick={() => setProposal(null)}>Écarter la proposition</button></div><small>Le titre, le résumé, le corps et les métadonnées SEO seront remplacés. Auteur, catégorie et images de couverture seront conservés. Aucune publication automatique.</small></div>}
    <ConfirmDialog open={confirm} title="Insérer cette proposition ?" description="Le titre, le résumé et le contenu actuels de l’éditeur seront remplacés. La version déjà publiée restera inchangée." confirmLabel="Insérer le brouillon" busy={false} error="" onCancel={() => setConfirm(false)} onConfirm={() => { if (proposal && !disabled) { onApply(proposal); setProposal(null); setConfirm(false); } }} />
  </section>;
}
