"use client";

import { useId, useRef, useState, type ComponentProps, type InvalidEvent, type ReactNode } from "react";
import { Field } from "./common";
import styles from "./recruitment-admin.module.css";
import offerStyles from "./recruitment-offers.module.css";

export function RecruiterDialog({ label, title, children, primary = false, danger = false }: {
  label: string; title: string; children: ReactNode; primary?: boolean; danger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  return <>
    <button ref={trigger} type="button" className={danger ? styles.danger : primary ? styles.primary : styles.button}
      onClick={() => dialog.current?.showModal()}>{label}</button>
    <dialog ref={dialog} className={offerStyles.dialog} aria-labelledby={titleId}
      onClose={() => trigger.current?.focus()}>
      <header className={offerStyles.dialogHeader}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={styles.button} onClick={() => dialog.current?.close()}>Fermer</button>
      </header>
      {children}
    </dialog>
  </>;
}

export function OfferField({ label, multiline, ...props }: {
  label: string; multiline?: boolean;
} & Pick<ComponentProps<"input">, "name" | "type" | "maxLength" | "min" | "max" | "required" | "defaultValue" | "placeholder" | "value" | "onChange">) {
  const errorId = useId();
  const [error, setError] = useState("");
  const { type, min, max, onChange, ...shared } = props;
  const attributes = {
    ...shared,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onInvalid: (event: InvalidEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setError(event.currentTarget.validationMessage);
    },
    onInput: () => setError(""),
  };
  return <Field label={label}>
    {multiline ? <textarea {...attributes} rows={7}/> : <input {...attributes} type={type} min={min} max={max} onChange={onChange}/>}
    {error && <span id={errorId} className={offerStyles.fieldError}>{error}</span>}
  </Field>;
}

export function OfferIdentity({ title, slug }: {title?: string; slug?: string}) {
  const [value, setValue] = useState(title ?? "");
  const [customSlug, setCustomSlug] = useState<string>();
  const generated = value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140).replace(/-$/, "");
  return <>
    <OfferField label="Titre du poste" name="title" required maxLength={180} value={value}
      onChange={event => setValue(event.target.value)}/>
    {slug ? <p className={styles.note}>Adresse de l’offre : <strong>{slug}</strong></p> :
      <details className={offerStyles.advanced}>
        <summary>Adresse de l’offre</summary>
        <Field label="Identifiant dans l’URL"><input name="slug" maxLength={140}
          onInvalid={event => { const details = event.currentTarget.closest("details"); if (details) details.open = true; }}
          pattern="[a-z0-9]+(-[a-z0-9]+)*" value={customSlug ?? generated}
          onChange={event => setCustomSlug(event.target.value || undefined)}/></Field>
        <p className={styles.note}>L’adresse est générée depuis le titre. Elle reste fixe après la création.</p>
      </details>}
  </>;
}

export function OfferCountry({ options, code, label }: {
  options: {code:string; label:string}[]; code?: string; label?: string;
}) {
  const [value, setValue] = useState(code ?? "CI");
  const selected = value === code && label ? label : options.find(option => option.code === value)?.label;
  return <>
    <Field label="Pays"><select value={value} onChange={event => setValue(event.target.value)}>
      {!options.some(option => option.code === value) && <option value={value}>{label}</option>}
      {options.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
    </select></Field>
    <input type="hidden" name="countryCode" value={value}/>
    <input type="hidden" name="country" value={selected ?? ""}/>
  </>;
}

export function OfferRecruiter({ profiles, initial }: {
  profiles: {id:string; firstName:string; lastName:string; role:string; initials:string}[];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const profile = profiles.find(person => person.id === value);
  return <>
    <Field label="Recruteur"><select name="recruiterId" value={value} onChange={event => setValue(event.target.value)}>
      <option value="">Aucun</option>
      {profiles.map(person => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
    </select></Field>
    {profile && <div className={offerStyles.profile}>
      <span className={styles.avatar} aria-hidden="true">{profile.initials}</span>
      <div><strong>{profile.firstName} {profile.lastName}</strong><p>{profile.role}</p><p className={styles.note}>Hopla Groupe</p></div>
    </div>}
  </>;
}

export function OfferListEditor({ name, label, initial = [], limit = 30 }: {
  name: string; label: string; initial?: string[]; limit?: number;
}) {
  const nextId = useRef(initial.length);
  const [items, setItems] = useState(() => initial.map((value, id) => ({id, value})));
  function reorder(index: number, offset: number) {
    const reordered = [...items];
    const destination = index + offset;
    [reordered[index], reordered[destination]] = [reordered[destination], reordered[index]];
    setItems(reordered);
  }
  return <fieldset className={offerStyles.listEditor}>
    <legend>{label} <span>(facultatif)</span></legend>
    {items.map((item, index) => <div key={item.id} className={offerStyles.listRow}>
      <input value={item.value} maxLength={500} aria-label={`${label}, élément ${index + 1}`}
        onChange={event => setItems(items.map(candidate => candidate.id === item.id ? {...candidate, value:event.target.value} : candidate))}/>
      <div className={styles.actions}>
        <button type="button" className={styles.button} disabled={!index} aria-label={`Monter l’élément ${index + 1}`} onClick={() => reorder(index, -1)}>↑</button>
        <button type="button" className={styles.button} disabled={index === items.length - 1} aria-label={`Descendre l’élément ${index + 1}`} onClick={() => reorder(index, 1)}>↓</button>
        <button type="button" className={styles.button} aria-label={`Retirer l’élément ${index + 1}`} onClick={() => setItems(items.filter(candidate => candidate.id !== item.id))}>Retirer</button>
      </div>
    </div>)}
    <input type="hidden" name={name} value={items.map(item => item.value).join("\n")}/>
    <button type="button" className={styles.button} disabled={items.length >= limit}
      onClick={() => { const id = nextId.current++; setItems([...items, {id, value:""}]); }}>Ajouter</button>
  </fieldset>;
}
