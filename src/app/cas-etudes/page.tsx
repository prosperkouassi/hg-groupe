import type { Metadata } from "next";

import CasesArchive from "@/components/cases/CasesArchive";
import PageBreadcrumb from "@/components/PageBreadcrumb";

import {
  getCaseCategories,
  getCaseDomains,
} from "@/lib/cases";

import {
  getPublishedProjects,
} from "@/lib/projects";

export const metadata: Metadata = {
  title: { absolute: "Réalisations & projets d'entreprises en Côte d'Ivoire | Hopla Groupe" },

  description:
    "Découvrez les projets accompagnés par Hopla Groupe : création de sites web, solutions digitales et projets de structuration d'entreprises à Abidjan et en Côte d'Ivoire.",

  alternates: {
    canonical: "/cas-etudes",
  },

  openGraph: {
    title: "Réalisations & projets d'entreprises en Côte d'Ivoire | Hopla Groupe",

    description:
      "Découvrez les projets accompagnés par Hopla Groupe : création de sites web, solutions digitales et projets de structuration d'entreprises à Abidjan et en Côte d'Ivoire.",

    url: "/cas-etudes",

    type: "website",

    images: [
      {
        url: "/images/og-hopla-groupe.jpg",
        width: 1200,
        height: 630,
        alt: "Cas d’études Hopla Groupe",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Réalisations & projets d'entreprises en Côte d'Ivoire | Hopla Groupe",

    description:
      "Découvrez les projets accompagnés par Hopla Groupe : création de sites web, solutions digitales et projets de structuration d'entreprises à Abidjan et en Côte d'Ivoire.",

    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export const dynamic = "force-dynamic";

export default async function CasEtudesPage() {
  const [domains, categories, projects] = await Promise.all([
    getCaseDomains(),
    getCaseCategories(),
    getPublishedProjects(),
  ]);

  return (
    <main className="cas-etudes-page">
      <PageBreadcrumb
        atPageStart
        items={[
          {
            label: "Cas d’études",
          },
        ]}
      />

      <h1 className="sr-only">Cas d’études</h1>

      <CasesArchive
        domains={domains}
        categories={categories}
        projects={projects}
      />
    </main>
  );
}