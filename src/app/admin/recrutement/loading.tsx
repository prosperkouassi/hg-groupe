import styles from "@/modules/recrutement/admin/ui/recruitment-admin.module.css";

export default function RecruitmentLoading() {
  return <div className={styles.fallback}><main className={styles.workspace} aria-busy="true">
    <div className={styles.heading}><h1>Recrutement</h1></div>
    <p className={styles.panel} role="status">Chargement de l’espace de recrutement…</p>
  </main></div>;
}
