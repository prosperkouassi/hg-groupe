import type { Metadata } from "next";

import CasesArchive from "@/components/cases/CasesArchive";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";

import {
  getCaseCategories,
  getCaseDomains,
} from "@/lib/cases";

import {
  getPublishedProjects,
} from "@/lib/projects";

export const metadata: Metadata = {
  title: "Cas d’études | Hopla Groupe",

  description:
    "Découvrez les réalisations de Hopla Groupe en solutions digitales, sites web, e-commerce, SaaS, digitalisation, organisation, ressources humaines et gestion de projet.",

  alternates: {
    canonical: "/cas-etudes",
  },

  openGraph: {
    title: "Cas d’études | Hopla Groupe",

    description:
      "Découvrez une sélection de projets accompagnés par Hopla Groupe en digital, technologie, organisation et développement.",

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

    title: "Cas d’études | Hopla Groupe",

    description:
      "Découvrez une sélection de projets accompagnés par Hopla Groupe.",

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
      <PageHero title="Cas d’études" />

      <PageBreadcrumb
        items={[
          {
            label: "Cas d’études",
          },
        ]}
      />

      <CasesArchive
        domains={domains}
        categories={categories}
        projects={projects}
      />
    </main>
  );
}