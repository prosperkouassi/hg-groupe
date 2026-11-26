import Link from "next/link";

import ApplicationButton, { type ApplicationPolicy } from "@/modules/recrutement/application/ApplicationButton";
import { getNationalities } from "@/modules/recrutement/application/fields";
import { loadRecruitmentSettings } from "@/modules/recrutement/admin/settings";
import { getApplicationConfig } from "@/modules/recrutement/server/security";

import { formatDate, formatPublication } from "@/modules/recrutement/dates";
import type { Job, JobsPage } from "@/modules/recrutement/types";

import JobDetail from "./JobDetail";
import OfferList from "./OfferList";
import RecruitmentFrame, { archiveHref } from "./RecruitmentFrame";
import styles from "./recruitment.module.css";

function JobCard({ job, active, selected }: {
  job: Job;
  active: boolean;
  selected: boolean;
}) {
  const href = `/recrutement/${encodeURIComponent(job.slug)}#offres`;
  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        aria-current={selected ? "page" : undefined}
        data-preview={active && !selected ? "" : undefined}
        className={styles.card}
      >
        <h3>{job.title}</h3>
        <p>{job.city}{job.company && ` · ${job.company}`}</p>
        <ul className={styles.tags} aria-label="Conditions de travail">
          {job.featured && <li>À la une</li>}
          <li>{job.contract}</li>
          <li>{job.workMode}</li>
        </ul>
        <div className={styles.dates}>
          <time dateTime={job.publishedAt}>{formatPublication(job.publishedAt)}</time>
          {job.deadline && <p>Clôture le <time dateTime={job.deadline}>{formatDate(job.deadline)}</time></p>}
        </div>
      </Link>
    </li>
  );
}

export default async function Recruitment({ list, selected }: { list: JobsPage; selected?: Job }) {
  const { jobs, page, totalPages, total, unavailable } = list;
  const detail = selected ?? jobs[0];
  const hasDemo = detail?.demo || jobs.some((job) => job.demo);
  let policy: ApplicationPolicy | undefined;
  if (process.env.NODE_ENV === "production" && process.env.RECRUTEMENT_CANDIDATURES_ENABLED === "true") {
    try {
      getApplicationConfig();
      const { consentText, allowedFormats, maxFileMiB } = await loadRecruitmentSettings();
      policy = { consentText, allowedFormats, maxFileMiB };
    } catch {
      // Keep the public form available for reading while submissions remain disabled.
    }
  }

  return (
    <RecruitmentFrame job={selected} page={page} hasBoard={Boolean(detail)}>
      <div className={styles.pageActions}>
        {hasDemo && <p className={styles.demo}>Aperçu de développement · Offres fictives</p>}
        <ApplicationButton
          applicationType="spontaneous_application"
          className={styles.spontaneous}
          nationalities={getNationalities()}
          unavailable={!policy}
          policy={policy}
        />
      </div>
      {detail ? (
        <div className={styles.board} data-view={selected ? "detail" : "archive"}>
          <section className={styles.list} aria-labelledby="liste-offres">
            <div className={styles.listHeading}>
              <h2 id="liste-offres" className="font-display">Offres d’emploi</h2>
              <p>{total} offre{total === 1 ? "" : "s"}</p>
            </div>
            <OfferList selectedSlug={selected?.slug}>
              {jobs.map((job) => <JobCard
                key={job.slug}
                job={job}
                active={job.slug === detail.slug}
                selected={job.slug === selected?.slug}
              />)}
            </OfferList>
            {totalPages > 1 && (
              <nav className={styles.pagination} aria-label="Pagination des offres">
                {page > 1 ? (
                  <Link href={`${archiveHref(page - 1)}#offres`} rel="prev" className={styles.secondary}>Précédent</Link>
                ) : (
                  <span aria-disabled="true" className={styles.secondary}>Précédent</span>
                )}
                <span>Page {page} sur {totalPages}</span>
                {page < totalPages ? (
                  <Link href={`${archiveHref(page + 1)}#offres`} rel="next" className={styles.secondary}>Suivant</Link>
                ) : (
                  <span aria-disabled="true" className={styles.secondary}>Suivant</span>
                )}
              </nav>
            )}
          </section>
          <JobDetail key={detail.slug} job={detail} isPageTitle={Boolean(selected)} backHref={`${archiveHref(page)}#offres`} policy={policy} />
        </div>
      ) : (
        <section className={styles.notice}>
          <h2>{unavailable ? "Offres temporairement indisponibles" : "Aucune offre publiée pour le moment"}</h2>
          <p>{unavailable ? "Vous pouvez réessayer dans quelques instants." : "Revenez consulter les prochaines offres de Hopla Groupe."}</p>
        </section>
      )}
    </RecruitmentFrame>
  );
}
