"use client";

import Link from "next/link";

import RecruitmentFrame from "@/modules/recrutement/ui/RecruitmentFrame";
import styles from "@/modules/recrutement/ui/recruitment.module.css";

export default function RecruitmentError({ retry }: { retry: () => void }) {
  return (
    <RecruitmentFrame>
      <section className={styles.notice}>
        <h2>Une erreur est survenue</h2>
        <p>Vous pouvez réessayer le chargement ou revenir aux offres.</p>
        <button type="button" className={styles.primary} onClick={retry}>Réessayer</button>
        <Link className={styles.secondary} href="/recrutement">Retour aux offres</Link>
      </section>
    </RecruitmentFrame>
  );
}
