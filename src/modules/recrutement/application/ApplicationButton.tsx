"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";

import { normalizeInternationalPhone, type NationalityOption } from "./fields";
import DocumentField, { maxDocumentSize } from "./DocumentField";
import NationalityField from "./NationalityField";
import PhoneField from "./PhoneField";
import styles from "./application.module.css";

type Props = {
  className?: string;
  demo?: boolean;
} & (
  | { applicationType?: "job_application"; slug: string; title: string; coverLetterRequired: boolean }
  | { applicationType: "spontaneous_application"; nationalities: NationalityOption[]; unavailable?: boolean }
);

const unavailableMessage = "L’envoi de votre candidature est indisponible pour le moment.";

export default function ApplicationButton(props: Props) {
  const { className, demo = false } = props;
  const spontaneous = props.applicationType === "spontaneous_application";
  const unavailable = spontaneous && props.unavailable;
  const coverLetterRequired = !spontaneous && props.coverLetterRequired;
  const title = spontaneous ? "Candidature spontanée" : `Candidature — ${props.title}`;
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submission = useRef(false);
  const submissionId = useRef("");
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [result, setResult] = useState("");

  function open() {
    setStarted(true);
    dialog.current?.showModal();
    heading.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission.current || demo || unavailable) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const number = String(data.get("phone") ?? "").trim();
    const [, code] = String(data.get("dialCode") ?? "").split(":");
    const internationalPhone = number && !number.startsWith("+") ? `+${code} ${number}` : number;
    data.delete("dialCode");

    if (spontaneous) {
      const phone = normalizeInternationalPhone(internationalPhone);
      if (!phone) {
        setPhoneError("Vérifiez l’indicatif et le numéro. Exemple pour la Côte d’Ivoire : 07 00 00 00 00.");
        form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
        return;
      }
      data.set("applicationType", "spontaneous_application");
      data.set("phone", phone);
    } else {
      data.set("slug", props.slug);
      if (internationalPhone && !/^[+\d(). -]{6,35}$/.test(internationalPhone)) {
        setPhoneError("Vérifiez le numéro de téléphone et l’indicatif sélectionné.");
        form.querySelector<HTMLInputElement>('input[name="phone"]')?.focus();
        return;
      }
      data.set("phone", internationalPhone);
    }
    for (const [name, label] of [["cv", "Le CV"], ["coverLetter", "La lettre de motivation"]]) {
      const file = data.get(name);
      if (!(file instanceof File) || !file.size) continue;
      const invalidFormat = !/\.(pdf|docx?)$/i.test(file.name);
      if (invalidFormat || file.size > maxDocumentSize) {
        setError(`${label} doit être au format PDF, DOC ou DOCX et ne pas dépasser 5 Mo.`);
        form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.focus();
        return;
      }
    }

    submission.current = true;
    setBusy(true);
    setError("");

    try {
      submissionId.current ||= crypto.randomUUID();
      data.set("submissionId", submissionId.current);
      const response = await fetch("/api/recrutement/candidatures", {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(45000),
      });
      const payload: { message?: unknown } | null = await response.json().catch(() => null);
      const message = typeof payload?.message === "string" ? payload.message : "";
      if ((response.status === 201 || response.status === 202) && message.trim()) {
        form.reset();
        submissionId.current = "";
        setResult(message);
        if (dialog.current?.open) heading.current?.focus();
        return;
      }

      setError((!response.ok && message) || unavailableMessage);
    } catch {
      setError("La connexion a été interrompue. Vérifiez votre boîte de réception avant de réessayer.");
    } finally {
      submission.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <button ref={trigger} type="button" className={className ?? styles.primary} aria-haspopup="dialog" onClick={open}>
        {spontaneous ? "Candidature spontanée" : "Je postule"}
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        onClose={() => trigger.current?.focus({ preventScroll: true })}
      >
        <header className={styles.header}>
          <h2 ref={heading} id={`${id}-title`} tabIndex={-1} className="font-display">{title}</h2>
          <button type="button" className={styles.close} aria-label="Fermer la candidature" onClick={() => dialog.current?.close()}>
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div role="status">{result && <p className={styles.notice}>{result}</p>}</div>
        {started && !result && (
          <form className={styles.form} onSubmit={submit} onChange={(event) => {
            const field = event.target;
            if (field instanceof HTMLInputElement && field.name === "phone"
              || field instanceof HTMLSelectElement && field.name === "dialCode") setPhoneError("");
          }}>
            {demo && <p className={styles.notice}>{spontaneous
              ? "Vous consultez le formulaire de démonstration. L’envoi est désactivé."
              : "Cette offre de démonstration permet de consulter le formulaire. L’envoi est désactivé."}</p>}
            {!demo && unavailable && <p className={styles.notice}>L’envoi des candidatures spontanées est temporairement indisponible.</p>}
            <p className={styles.hint}>Les champs marqués d’un astérisque sont obligatoires.</p>
            <div className={styles.grid}>
              <label>Nom <span aria-hidden="true">*</span><input name="lastName" autoComplete="family-name" maxLength={100} required /></label>
              <label>Prénom <span aria-hidden="true">*</span><input name="firstName" autoComplete="given-name" maxLength={100} required /></label>
              <label>E-mail <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              <PhoneField required={spontaneous} error={phoneError} />
              {spontaneous && (
                <>
                  <label>Ville <span aria-hidden="true">*</span><input name="city" autoComplete="address-level2" maxLength={120} required /></label>
                  <label>Poste souhaité <span aria-hidden="true">*</span><input name="desiredPosition" maxLength={180} required /></label>
                </>
              )}
            </div>
            {spontaneous && <NationalityField nationalities={props.nationalities} />}
            <div className={styles.grid}>
              <DocumentField name="cv" label="CV" required />
              <DocumentField name="coverLetter" label="Lettre de motivation" required={coverLetterRequired} />
            </div>
            {!spontaneous && <label>Message de motivation<textarea name="motivation" rows={4} maxLength={4000} /></label>}
            <div hidden>
              <label>Site web<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <label className={styles.consent} htmlFor={`${id}-consent`}>
              <input id={`${id}-consent`} name="consent" type="checkbox" required />
              <span>J’accepte le traitement de mes données pour l’étude de ma candidature <span aria-hidden="true">*</span></span>
            </label>
            <Link className={styles.privacy} href="/politique-confidentialite" target="_blank" rel="noopener noreferrer">
              Politique de confidentialité (nouvel onglet)
            </Link>
            <div className={styles.actions}>
              <div role="alert">{error && <p className={styles.error}>{error}</p>}</div>
              <button type="submit" className={`${styles.primary} ${styles.submit}`} disabled={busy || demo || unavailable}>
                {busy && <span className={styles.spinner} aria-hidden="true" />}
                {busy ? "Envoi en cours…" : "Envoyer ma candidature"}
              </button>
            </div>
            <p className={styles.announcement} role="status">{busy ? "Envoi de la candidature en cours." : ""}</p>
          </form>
        )}
      </dialog>
    </>
  );
}
