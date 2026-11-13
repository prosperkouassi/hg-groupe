import type { ReactNode } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";
import styles from "./legal-content.module.css";

export default function LegalContent({ title, intro, children }: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.page}>
      <PageHero title={title} compact />
      <PageBreadcrumb items={[{ label: title }]} />
      <article className={styles.content} aria-label={title}>
        <p className={styles.eyebrow}>Hopla Groupe · Informations juridiques</p>
        <p className={styles.intro}>{intro}</p>
        {children}
      </article>
    </main>
  );
}
