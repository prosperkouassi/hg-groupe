import PageBreadcrumb from "@/components/PageBreadcrumb";
import type { Job } from "@/modules/recrutement/types";

import styles from "./recruitment.module.css";

export function archiveHref(page: number) {
  return page > 1 ? `/recrutement?page=${page}` : "/recrutement";
}

export default function RecruitmentFrame({
  children,
  job,
  page = 1,
  hasBoard = false,
}: {
  children: React.ReactNode;
  job?: Job;
  page?: number;
  hasBoard?: boolean;
}) {
  return (
    <main className={styles.main} data-board={hasBoard || undefined}>
      <a className={styles.skip} href="#offres">Aller aux offres</a>
      <PageBreadcrumb
        atPageStart
        items={job ? [
          { label: "Recrutement", href: archiveHref(page) },
          { label: job.title },
        ] : [{ label: "Recrutement" }]}
      />
      <div className={styles.surface}>
        <div id="offres" className={`container-hopla ${styles.content}`} tabIndex={-1}>
          {!job && <h1 className="sr-only">Recrutement</h1>}
          {children}
        </div>
      </div>
    </main>
  );
}
