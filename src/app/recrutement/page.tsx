import { cache } from "react";

import { getJobs, parsePage } from "@/modules/recrutement/server/jobs";
import Recruitment from "@/modules/recrutement/ui/Recruitment";
import { archiveHref } from "@/modules/recrutement/ui/RecruitmentFrame";
import { recruitmentMetadata } from "@/modules/recrutement/ui/metadata";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string | string[] }> };

const loadJobs = cache(getJobs);

export async function generateMetadata({ searchParams }: Props) {
  const { page, unavailable } = await loadJobs(parsePage((await searchParams).page));
  return recruitmentMetadata({
    title: "Recrutement et offres d’emploi | Hopla Groupe",
    description: "Consultez les offres d’emploi de Hopla Groupe et découvrez les postes à pourvoir.",
    path: archiveHref(page),
    noindex: process.env.NODE_ENV === "development" || unavailable,
  });
}

export default async function RecruitmentPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page);
  return <Recruitment list={await loadJobs(page)} />;
}
