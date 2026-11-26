import Image from "next/image";
import Link from "next/link";

import ApplicationButton, { type ApplicationPolicy } from "@/modules/recrutement/application/ApplicationButton";
import { formatDate, formatPublication } from "@/modules/recrutement/dates";
import { canApply, isOpen } from "@/modules/recrutement/server/jobs";
import type { Job } from "@/modules/recrutement/types";

import styles from "./recruitment.module.css";

function recruiterLinkedIn(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && /^(?:[a-z0-9-]+\.)?linkedin\.com$/i.test(url.hostname)
      && !url.username && !url.password) return url.href;
  } catch {
    return null;
  }
  return null;
}

export function Recruiter({ recruiter }: { recruiter: NonNullable<Job["recruiter"]> }) {
  const initials = recruiter.initials ?? recruiter.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const linkedIn = recruiterLinkedIn(recruiter.linkedin);
  // Serve only explicitly public local portraits, with initials as the default.
  const avatar = recruiter.avatar && /^\/images\/(?:[\w-]+\/)*[\w-]+\.(?:avif|jpe?g|png|webp)$/i.test(recruiter.avatar)
    ? recruiter.avatar
    : null;

  return (
    <div className={styles.recruiter}>
      {avatar ? (
        <Image src={avatar} width={56} height={56} alt="" className={styles.avatar} />
      ) : (
        <span className={styles.avatar} aria-hidden="true">{initials || "HG"}</span>
      )}
      <div>
        <p><strong>{recruiter.name}</strong></p>
        <p>{recruiter.role}</p>
        {recruiter.company && <p>{recruiter.company}</p>}
        {(recruiter.email || recruiter.phone || linkedIn) && (
          <ul className={styles.contacts}>
            {recruiter.email && <li><a href={`mailto:${encodeURIComponent(recruiter.email).replace("%40", "@")}`}>{recruiter.email}</a></li>}
            {recruiter.phone && <li><a href={`tel:${recruiter.phone.replace(/[^+0-9]/g, "")}`}>{recruiter.phone}</a></li>}
            {linkedIn && <li><a href={linkedIn}>Profil LinkedIn</a></li>}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function JobDetail({ job, backHref, isPageTitle, policy }: {
  job: Job;
  backHref: string;
  isPageTitle: boolean;
  policy?: ApplicationPolicy;
}) {
  const Title = isPageTitle ? "h1" : "h2";
  const action = canApply(job) ? (
    <ApplicationButton slug={job.slug} title={job.title} coverLetterRequired={job.coverLetterRequired}
      demo={job.demo} unavailable={!job.demo && !policy} policy={policy} className={styles.primary} />
  ) : (
    <span className={styles.closed}>
      {isOpen(job) ? "Candidatures temporairement indisponibles" : "Candidatures closes"}
    </span>
  );
  const facts = [
    { label: "Postes à pourvoir", value: job.positions },
    { label: "Expérience", value: job.experience },
    { label: "Niveau d’études", value: job.education },
    { label: "Rémunération", value: job.salary },
    { label: "Horaires", value: job.hours },
    { label: "Début souhaité", value: job.startDate && <time dateTime={job.startDate}>{formatDate(job.startDate)}</time> },
  ];
  const sections = [
    { title: "Missions principales", items: job.missions },
    { title: "Profil recherché", items: job.profile },
    { title: "Compétences requises", items: job.skills },
    { title: "Avantages", items: job.benefits },
    { title: "Documents à fournir", items: ["CV obligatoire", job.coverLetterRequired ? "Lettre de motivation obligatoire" : "Lettre de motivation facultative"] },
    { title: "Processus de recrutement", items: job.process },
  ];

  return (
    <article className={styles.detail} aria-labelledby="titre-offre">
      <div className={styles.toolbar}>
        <div className={styles.actions}>
          <Link href={backHref} className={`${styles.back} ${styles.secondary}`}>
            <span aria-hidden="true">←</span> Retour aux offres
          </Link>
          {action}
        </div>
        <div className={styles.detailIntro}>
          <Title id="titre-offre" className="font-display">{job.title}</Title>
          <p>{[job.company, job.city, job.country].filter(Boolean).join(" · ")}</p>
          <ul className={styles.tags} aria-label="Conditions de travail">
            {job.featured && <li>À la une</li>}
            <li>{job.contract}</li>
            <li>{job.workMode}</li>
          </ul>
          <div className={styles.dates}>
            <time dateTime={job.publishedAt}>{formatPublication(job.publishedAt)}</time>
            {job.deadline && <p>Clôture le <time dateTime={job.deadline}>{formatDate(job.deadline)}</time></p>}
          </div>
        </div>
      </div>
      <div className={styles.reading} tabIndex={0} role="region" aria-label="Détail de l’offre">
        {job.imageUrl && (
          <Image
            src={job.imageUrl}
            alt=""
            width={1200}
            height={600}
            sizes="(max-width: 760px) 100vw, (max-width: 1440px) 62vw, 850px"
            style={{ width: "100%", height: "auto", maxHeight: "21rem", objectFit: "cover", borderRadius: "12px" }}
          />
        )}
        <dl className={styles.facts}>
          {facts.filter(({ value }) => value).map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <section className={styles.detailSection}>
          <h3>Description du poste</h3>
          <p>{job.description}</p>
        </section>
        {sections.filter(({ items }) => items.length > 0).map(({ title, items }) => (
          <section key={title} className={styles.detailSection}>
            <h3>{title}</h3>
            <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </section>
        ))}
        {Boolean(job.attachments?.length) && (
          <section className={styles.detailSection}>
            <h3>Pièces jointes de l’offre</h3>
            <ul>
              {job.attachments?.map(path => (
                <li key={path}>
                  <a href={path} download className="underline underline-offset-4">{path.split("/").pop()}</a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className={styles.recruiterCard}>
          <h3>Recruteur</h3>
          {job.recruiter ? <Recruiter recruiter={job.recruiter} /> : <p>{job.company ?? "Hopla Groupe"}</p>}
          {action}
        </section>
      </div>
    </article>
  );
}
