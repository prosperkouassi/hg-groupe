import { notFound } from "next/navigation";
import { cache } from "react";

import { getJob, getJobPage, getJobs, isOpen } from "@/modules/recrutement/server/jobs";
import JobPosting from "@/modules/recrutement/ui/JobPosting";
import Recruitment from "@/modules/recrutement/ui/Recruitment";
import { recruitmentMetadata } from "@/modules/recrutement/ui/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const loadJob = cache(getJob);

export async function generateMetadata({ params }: Props) {
  const job = await loadJob((await params).slug);
  if (!job) return { robots: { index: false, follow: false } };
  return recruitmentMetadata({
    title: `${job.title} à ${job.city} | Recrutement Hopla Groupe`,
    description: job.description.replace(/\s+/g, " ").trim().slice(0, 160),
    path: `/recrutement/${encodeURIComponent(job.slug)}`,
    noindex: job.demo || !isOpen(job),
  });
}

export default async function JobPage({ params }: Props) {
  const job = await loadJob((await params).slug);
  if (!job) notFound();
  const list = await getJobs(await getJobPage(job));

  return (
    <>
      <JobPosting job={job} />
      <Recruitment list={list} selected={job} />
    </>
  );
}
