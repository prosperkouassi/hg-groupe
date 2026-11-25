import { useId, useRef, useState } from "react";

import type { NationalityOption } from "./fields";
import styles from "./application.module.css";

function searchKey(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/[’'\p{Pd}\s]+/gu, " ").trim().toLocaleLowerCase("fr");
}

export default function NationalityField({ nationalities }: { nationalities: NationalityOption[] }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const search = searchKey(query);
  const matches = nationalities.filter(({ label, code }) =>
    !search || selection || searchKey(`${label} ${code}`).includes(search),
  );

  function choose(option: NationalityOption) {
    setSelection(option.code);
    setQuery(option.label);
    setOpen(false);
    setActive(-1);
    input.current?.setCustomValidity("");
  }

  return (
    <div className={styles.nationality}>
      <label htmlFor={id}>Nationalité <span aria-hidden="true">*</span></label>
      <input
        ref={input}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-activedescendant={open && matches[active] ? `${id}-${matches[active].code}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Rechercher un pays…"
        maxLength={80}
        required
        value={query}
        onClick={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          setActive(-1);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelection("");
          setActive(-1);
          setOpen(true);
          event.target.setCustomValidity(event.target.value ? "Sélectionnez une nationalité dans la liste." : "");
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
            setActive(-1);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (!matches.length) return;
            const next = event.key === "ArrowDown"
              ? (active + 1) % matches.length
              : active <= 0 ? matches.length - 1 : active - 1;
            setActive(next);
            requestAnimationFrame(() => {
              document.getElementById(`${id}-${matches[next].code}`)?.scrollIntoView({ block: "nearest" });
            });
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            const option = matches[active] ?? (matches.length === 1 ? matches[0] : undefined);
            if (option) choose(option);
          }
        }}
      />
      <input type="hidden" name="nationality" value={selection} />
      <div className={styles.options} hidden={!open}>
        <ul id={`${id}-options`} role="listbox" aria-label="Nationalités">
          {open && matches.map((option, index) => (
            <li
              key={option.code}
              id={`${id}-${option.code}`}
              role="option"
              aria-selected={option.code === selection}
              data-active={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
        {open && !matches.length && <p role="status">Aucun pays ne correspond à cette recherche.</p>}
      </div>
    </div>
  );
}
