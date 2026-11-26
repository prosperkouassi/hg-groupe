"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mutation } from "./actions";
import { Field } from "./common";
import styles from "./recruitment-admin.module.css";
import applications from "./recruitment-applications.module.css";

export function ApplicationSelection({ resource, count, canDelete, choices, children }: {
  resource: "candidatures" | "spontanees";
  count: number;
  canDelete: boolean;
  choices: ReactNode;
  children: ReactNode;
}) {
  const rows = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);
  const checkboxes = () => Array.from(rows.current?.querySelectorAll<HTMLInputElement>('input[name="ids"]') ?? []);

  useEffect(() => {
    const form = rows.current?.closest("form");
    const reset = () => setSelected(0);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, []);

  useEffect(() => {
    if (toggle.current) toggle.current.indeterminate = selected > 0 && selected < count;
  }, [selected, count]);

  function selectPage(checked: boolean) {
    const inputs = checkboxes();
    for (const input of inputs) input.checked = checked;
    setSelected(checked ? inputs.length : 0);
  }

  return <Mutation resource={resource} action="status" transform="bulk">
    <div className={applications.toolbar}>
      <label className={applications.check}>
        <input ref={toggle} type="checkbox" checked={selected === count}
          onChange={event => selectPage(event.target.checked)} />
        Sélectionner la page
      </label>
      <p className={styles.note} aria-live="polite">{selected} dossier{selected === 1 ? " sélectionné" : "s sélectionnés"}</p>
    </div>
    <div ref={rows} onChange={() => setSelected(checkboxes().filter(input => input.checked).length)}>{children}</div>
    {selected > 0 && <div className={styles.filters}>
      <Field label="Nouveau statut"><select name="status" required>
        <option value="">Choisir un statut</option>{choices}
      </select></Field>
      <button type="submit" className={styles.button}>Appliquer à la sélection</button>
      {canDelete && <button type="submit" className={styles.danger} name="_action" value="delete" formNoValidate>Supprimer la sélection</button>}
    </div>}
  </Mutation>;
}
