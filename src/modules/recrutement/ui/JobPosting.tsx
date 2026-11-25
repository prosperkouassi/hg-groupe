import type { Contract, Job } from "../types";
import { canApply } from "../server/jobs";

const employmentType: Record<Contract, string | undefined> = {
  CDI: undefined,
  CDD: "TEMPORARY",
  Stage: "INTERN",
  Alternance: "OTHER",
  Freelance: "CONTRACTOR",
  Mission: "CONTRACTOR",
  Temporaire: "TEMPORARY",
};

export default function JobPosting({ job }: { job: Job }) {
  if (job.demo || !canApply(job)) return null;

  const posting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [
      job.description,
      ...job.missions,
      ...job.profile,
      ...job.skills,
      ...job.benefits,
      job.hours && `Horaires : ${job.hours}`,
      `Niveau d’études : ${job.education}`,
      `Expérience : ${job.experience}`,
    ].filter(Boolean).join("\n\n"),
    identifier: { "@type": "PropertyValue", name: job.company ?? "Hopla Groupe", value: job.slug },
    datePosted: job.publishedAt,
    validThrough: job.deadline ?? undefined,
    employmentType: employmentType[job.contract],
    hiringOrganization: { "@type": "Organization", name: job.company ?? "Hopla Groupe" },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: job.countryCode,
      },
    },
    jobLocationType: job.workMode === "Télétravail" ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: job.workMode === "Télétravail"
      ? { "@type": "Country", name: job.country }
      : undefined,
    totalJobOpenings: job.positions,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(posting).replace(/</g, "\\u003c") }}
    />
  );
}
