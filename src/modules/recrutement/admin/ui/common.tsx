import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./recruitment-admin.module.css";

export const base = "/admin/recrutement";
export const sections = {
  dashboard: "Tableau de bord",
  offres: "Offres d’emploi",
  candidatures: "Candidatures",
  spontanees: "Candidatures spontanées",
  recruteurs: "Recruteurs",
  reglages: "Réglages",
} as const;
export type Section = keyof typeof sections;
export type Query = Record<string, string>;
export type Role = "admin" | "manager" | "recruiter";

export function Menu({ section, role }: { section: Section; role: Role }) {
  return (
    <nav aria-label="Recrutement" className={styles.navigation}>
      {(Object.keys(sections) as Section[]).filter(item =>
        (item !== "reglages" && item !== "recruteurs" || role === "admin")
        && (item !== "spontanees" || role !== "recruiter")
        && (item !== "offres" || role !== "manager")
      ).map(item => (
        <Link key={item} href={item === "dashboard" ? base : `${base}/${item}`}
          aria-current={section === item ? "page" : undefined}>{sections[item]}</Link>
      ))}
    </nav>
  );
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className={styles.panel}>{children}</section>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className={styles.field}>{label}{children}</label>;
}

export function Check({ name, children, checked }: { name: string; children: ReactNode; checked?: boolean }) {
  return <label className={styles.check}><input name={name} type="checkbox" defaultChecked={checked} />{children}</label>;
}

export function OptionList({ options }: { options: Record<string, string> }) {
  return Object.entries(options).map(([value,label]) => <option key={value} value={value}>{label}</option>);
}

export function Table({ columns, label, children, responsive }: {
  columns: string[]; label: string; children: ReactNode; responsive?: boolean;
}) {
  return (
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={label}>
      <table className={styles.table} role={responsive ? "table" : undefined}>
        <thead role={responsive ? "rowgroup" : undefined}><tr role={responsive ? "row" : undefined}>
          {columns.map(column => <th key={column} scope="col" role={responsive ? "columnheader" : undefined}>{column}</th>)}
        </tr></thead>
        <tbody role={responsive ? "rowgroup" : undefined}>{children}</tbody>
      </table>
    </div>
  );
}

export function PageLinks({ href, query, page, total, size }: { href: string; query: Query; page: number; total: number; size: number }) {
  const max = Math.max(1, Math.ceil(total / size));
  const link = (value: number) => `${href}?${new URLSearchParams({...query, page: String(value)})}`;
  return (
    <nav aria-label="Pagination" className={`${styles.actions} ${styles.pager}`}>
      {page > 1 && <Link className={styles.button} href={link(page - 1)}>Précédent</Link>}
      <span>{total} résultat{total === 1 ? "" : "s"} · Page {page} sur {max}</span>
      {page < max && <Link className={styles.button} href={link(page + 1)}>Suivant</Link>}
    </nav>
  );
}

const dateFormat = new Intl.DateTimeFormat("fr-CI", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Abidjan" });
export function dateLabel(value: string | Date | null | undefined) {
  if (!value) return "—";
  const normalized = typeof value === "string" && /^\d{4}-\d\d-\d\d \d\d:/.test(value)
    ? value.replace(" ", "T") + "Z"
    : value;
  const date = new Date(normalized);
  return Number.isFinite(date.getTime()) ? dateFormat.format(date) : "—";
}

export function Details({ values }: { values: [string, ReactNode][] }) {
  return <dl className={styles.details}>{values.map(([label,value]) => (
    <div key={label} className="contents"><dt>{label}</dt><dd>{value ?? "—"}</dd></div>
  ))}</dl>;
}
