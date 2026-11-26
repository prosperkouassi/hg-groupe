"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./recruitment-admin.module.css";

type FormValue = string | boolean | number | string[];
type Transform = "offer" | "settings" | "bulk";

type BrowserNavigation = EventTarget & {
  currentEntry: { key: string } | null;
  traverseTo(key: string): { finished: Promise<unknown> };
};

const protectedForms = new Set<() => boolean>();
const discardChanges = () => window.confirm("Quitter cette page et perdre les modifications non enregistrées ?");
let stopWatching: (() => void) | undefined;

function protectForm(isDirty: () => boolean) {
  protectedForms.add(isDirty);
  stopWatching ??= watchUnsavedChanges();
  return () => {
    protectedForms.delete(isDirty);
    if (!protectedForms.size) {
      stopWatching?.();
      stopWatching = undefined;
    }
  };
}

function watchUnsavedChanges() {
  const hasChanges = () => Array.from(protectedForms).some(isDirty => isDirty());
  const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
  let restoreEntry: string | undefined;
  let restoring = false;

  function beforeUnload(event: BeforeUnloadEvent) {
    if (hasChanges()) event.preventDefault();
  }

  function followLink(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || link.target && link.target !== "_self" || link.hasAttribute("download") || link.getAttribute("href")?.startsWith("#")) return;
    if (hasChanges() && !discardChanges()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function onNavigate(event: Event) {
    const { navigationType, destination } = event as Event & {
      navigationType: string;
      destination: { sameDocument: boolean; url: string };
    };
    const entry = navigation?.currentEntry;
    if (restoring || navigationType !== "traverse" || !destination.sameDocument ||
        destination.url === window.location.href || !entry || !hasChanges() || discardChanges()) return;
    if (event.cancelable) event.preventDefault();
    else restoreEntry = entry.key;
  }

  function onPopState(event: PopStateEvent) {
    if (!navigation || (!restoreEntry && !restoring)) return;
    // A committed traversal cannot be cancelled. Keep Next on the current form
    // while the browser returns to the original history entry.
    event.stopImmediatePropagation();
    if (restoring || !restoreEntry) return;
    const key = restoreEntry;
    restoreEntry = undefined;
    restoring = true;
    void navigation.traverseTo(key).finished.catch(() => window.location.reload()).finally(() => {
      restoring = false;
    });
  }

  window.addEventListener("beforeunload", beforeUnload);
  document.addEventListener("click", followLink, true);
  navigation?.addEventListener("navigate", onNavigate);
  window.addEventListener("popstate", onPopState, true);
  return () => {
    window.removeEventListener("beforeunload", beforeUnload);
    document.removeEventListener("click", followLink, true);
    navigation?.removeEventListener("navigate", onNavigate);
    window.removeEventListener("popstate", onPopState, true);
  };
}

function payload(form: FormData, transform?: Transform) {
  const fields: Record<string, FormValue> = {};
  const arrays = new Set(["missions","profile","skills","benefits","process","attachments"]);
  const numeric = new Set(["positions","confirmationHours","maxFileMiB","retentionDays","ipLimit","emailLimit"]);
  for (const [key, value] of form) {
    if (typeof value !== "string") continue;
    if (transform === "offer" && arrays.has(key)) {
      fields[key] = value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    } else if (numeric.has(key)) {
      fields[key] = Number(value);
    } else {
      fields[key] = value;
    }
  }
  if (transform === "offer") {
    for (const flag of ["featured","coverLetterRequired"]) fields[flag] = form.has(flag);
  }
  if (transform === "settings") {
    if (fields.category === "candidatures") fields.allowedFormats = form.getAll("allowedFormats").map(String);
    if (fields.category === "conservation") {
      fields.anonymize = fields.retentionPolicy === "anonymize";
      fields.automaticDeletion = fields.retentionPolicy === "delete";
      delete fields.retentionPolicy;
    }
  }
  if (transform === "bulk") fields.ids = form.getAll("ids").map(String);
  return fields;
}

export function Mutation({ resource, action, children, formId, data, button, confirm, transform, returnTo, protectChanges, disableWhenUnchanged }: {
  resource: string; action: string; children?: ReactNode; formId?: string; data?: Record<string, FormValue>;
  button?: string; confirm?: string; transform?: Transform; returnTo?: string; protectChanges?: boolean; disableWhenUnchanged?: boolean;
}) {
  const router = useRouter();
  const req = useRef(false);
  const alert = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saved = useRef("");
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const [result, setResult] = useState<{ok:boolean; message:string}>();

  useEffect(() => {
    const form = formRef.current;
    if (!form || (!protectChanges && !disableWhenUnchanged)) return;
    saved.current = formSnapshot(form);
    if (protectChanges) return protectForm(() => formSnapshot(form) !== saved.current);
  }, [protectChanges, disableWhenUnchanged]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (req.current || (disableWhenUnchanged && !changed) || (confirm && !window.confirm(confirm))) return;
    const formElement = event.currentTarget;
    const submitted = formSnapshot(formElement);
    const form = new FormData(formElement, (event.nativeEvent as SubmitEvent).submitter);
    const operation = String(form.get("_action") ?? action);
    if (operation === "delete" && !confirm && !window.confirm("Supprimer définitivement les dossiers sélectionnés et leurs documents ?")) return;
    const fields = payload(form, transform);
    delete fields._action;
    if (transform === "bulk" && (!Array.isArray(fields.ids) || !fields.ids.length)) {
      setResult({ok:false,message:"Sélectionnez au moins un dossier."});
      return;
    }
    if (transform === "bulk" && operation === "status" && Array.isArray(fields.ids) && fields.ids.length > 1 &&
      !window.confirm(`Modifier le statut des ${fields.ids.length} dossiers sélectionnés ?`)) return;
    req.current = true;
    setBusy(true);
    setResult(undefined);
    try {
      const response = await fetch(`/api/admin/recrutement/${resource}`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ...fields, ...data, action: operation, ...(operation === "delete" ? {confirm:true} : {}) }),
      });
      const result: {message?:string; slug?:string} = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message ?? "L’opération a échoué. Réessayez.");
      saved.current = submitted;
      if (disableWhenUnchanged) setChanged(formSnapshot(formElement) !== submitted);
      formElement.dispatchEvent(new Event("recruitment:mutation-success"));
      if (returnTo) {
        const target = returnTo.includes("{slug}") && !result.slug ? returnTo.split("?")[0] : returnTo;
        router.push(target.replace("{slug}", encodeURIComponent(result.slug ?? "")));
      } else {
        if (operation === "note" || operation === "create" || transform === "bulk") formElement.reset();
        setResult({ok:true,message:result.message ?? "Modification enregistrée."});
      }
      router.refresh();
    } catch (error) {
      setResult({ok:false,message:error instanceof Error ? error.message : "Connexion indisponible. Réessayez."});
      requestAnimationFrame(() => alert.current?.focus());
    } finally {
      req.current = false;
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} id={formId} method="post" onSubmit={submit} className={styles.stack} aria-busy={busy}
      onChange={disableWhenUnchanged ? event => setChanged(formSnapshot(event.currentTarget) !== saved.current) : undefined}>
      {children}
      {button && <div><button type="submit" disabled={busy || (disableWhenUnchanged && !changed)} className={action === "delete" ? styles.danger : styles.primary}>
        {busy ? "Enregistrement…" : button}
      </button></div>}
      <div aria-live="polite">
        {result && <p ref={alert} tabIndex={-1} className={result.ok ? styles.success : styles.error}>{result.message}</p>}
        {busy && !button && <p className={styles.note}>Enregistrement…</p>}
      </div>
    </form>
  );
}

function formSnapshot(form: HTMLFormElement) {
  return JSON.stringify([...new FormData(form)]);
}

export function Download({ id, label }: { id: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    const endpoint = `/api/admin/recrutement/documents?id=${encodeURIComponent(id)}`;
    try {
      const issue = await fetch(endpoint, {method:"POST"});
      if (!issue.ok) throw new Error();
      const {ticket} = await issue.json() as {ticket?:string};
      if (!ticket) throw new Error();
      const response = await fetch(endpoint, { headers:{ Authorization:`Bearer ${ticket}` } });
      if (!response.ok) throw new Error();
      const match = /filename="([\w.-]+)"/.exec(response.headers.get("content-disposition") ?? "");
      const blob = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blob;
      link.download = match?.[1] ?? "document";
      link.click();
      setTimeout(() => URL.revokeObjectURL(blob), 1000);
    } catch {
      setError("Téléchargement indisponible. Vérifiez vos droits ou réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return <div><button type="button" className={styles.button} disabled={busy} onClick={download}>
    {busy ? "Téléchargement…" : label}
  </button><p aria-live="polite" className={error ? styles.error : undefined}>{error}</p></div>;
}

export function RetentionPreview() {
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState<{ok:boolean; message:string}>();

  async function preview() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/recrutement/reglages?preview=retention", {cache:"no-store"});
      if (!response.ok) throw new Error();
      const {eligible,retentionDays} = await response.json() as {eligible:number;retentionDays:number};
      setResult({ok:true,message:`${eligible} dossier${eligible === 1 ? "" : "s"} reçu${eligible === 1 ? "" : "s"} il y a plus de ${retentionDays} jours.`});
    } catch {
      setResult({ok:false,message:"Impossible d’estimer le nombre de dossiers. Réessayez."});
    } finally {
      setBusy(false);
    }
  }

  return <div><button type="button" className={styles.button} disabled={busy} onClick={preview}>
    {busy ? "Calcul…" : "Estimer le nombre de dossiers"}
  </button><div aria-live="polite">{result && <p className={result.ok ? styles.note : styles.error}>{result.message}</p>}</div></div>;
}
