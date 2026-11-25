import RecruitmentFrame from "@/modules/recrutement/ui/RecruitmentFrame";
import styles from "@/modules/recrutement/ui/recruitment.module.css";

export default function RecruitmentLoading() {
  return (
    <RecruitmentFrame>
      <section className={styles.notice} role="status">
        <h2>Chargement des offres…</h2>
      </section>
    </RecruitmentFrame>
  );
}
