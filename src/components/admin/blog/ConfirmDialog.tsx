'use client';

import { useEffect, useId, useRef } from 'react';
import s from './confirm-dialog.module.css';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, description, confirmLabel, busy, error, onConfirm, onCancel }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return <dialog ref={dialog} className={s.dialog} aria-labelledby={titleId} aria-describedby={descriptionId} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <div className={s.content}>
      <span className={s.icon} aria-hidden="true">✓</span>
      <h2 id={titleId} className={s.title}>{title}</h2>
      <p id={descriptionId} className={s.description}>{description}</p>
      {error && <p role="alert" className={s.error}>{error}</p>}
      <div className={s.actions}>
        <button type="button" autoFocus className={s.cancelButton} disabled={busy} onClick={onCancel}>Annuler</button>
        <button type="button" className={s.confirmButton} disabled={busy} onClick={onConfirm}>{busy ? 'Enregistrement…' : confirmLabel}</button>
      </div>
    </div>
  </dialog>;
}
