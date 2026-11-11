'use client';
import { useState } from 'react';
import { formatSchedule, parseScheduledAt } from '@/lib/blog/schedule';
import ConfirmDialog from './ConfirmDialog';
import s from './ai-editorial.module.css';

type Props = { scheduledAt: string | null; scheduledTitle: string; busy: boolean; error: string; onSchedule: (datetime: string) => Promise<boolean>; onCancelSchedule: () => Promise<boolean> };
export default function SchedulePanel({ scheduledAt,scheduledTitle,busy,error,onSchedule,onCancelSchedule }: Props) {
  const [date,setDate] = useState(''); const [action,setAction] = useState<'schedule' | 'cancel' | null>(null); const [localError,setLocalError] = useState('');
  function confirmSchedule() { try { parseScheduledAt(date); setLocalError(''); setAction('schedule'); } catch (e) { setLocalError(e instanceof Error ? e.message : 'Date invalide.'); } }
  return <section className={s.panel}><h2>Programmer la publication</h2><p>Choisissez une date et une heure en <strong>Africa/Abidjan</strong>. La version validée à cet instant sera publiée, même si vous préparez ensuite un nouveau brouillon.</p>
    {scheduledAt && <p className={s.info}>Publication prévue le <strong>{formatSchedule(scheduledAt)}</strong> (Abidjan)<br />Version programmée : {scheduledTitle}</p>}
    <label>Date et heure de publication — Abidjan<input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} disabled={busy} /></label>
    <div className={s.actions}><button type="button" className={s.primary} disabled={busy || !date} onClick={confirmSchedule}>{scheduledAt ? 'Remplacer la programmation' : 'Programmer cet article'}</button>{scheduledAt && <button type="button" className={s.secondary} disabled={busy} onClick={() => { setLocalError(''); setAction('cancel'); }}>Annuler la programmation</button>}</div>
    <p className={s.info}>L’hébergement doit exécuter la tâche de publication chaque minute. En local, lancez le script prévu pour tester l’échéance.</p>
    {localError && <p className={s.error} role="alert">{localError}</p>}
    <ConfirmDialog open={action !== null} title={action === 'cancel' ? 'Annuler la programmation ?' : 'Confirmer la programmation ?'} description={action === 'cancel' ? 'Cette version ne sera plus publiée automatiquement. Le brouillon est conservé.' : `La version actuelle sera publiée le ${date && !Number.isNaN(new Date(`${date}:00Z`).getTime()) ? formatSchedule(`${date}:00Z`) : ''}, heure d’Abidjan.`} confirmLabel={action === 'cancel' ? 'Annuler la programmation' : 'Programmer'} busy={busy} error={error} onCancel={() => { if (!busy) setAction(null); }} onConfirm={() => { void (async () => { const ok = action === 'cancel' ? await onCancelSchedule() : await onSchedule(date); if (ok) setAction(null); })(); }} />
  </section>;
}
