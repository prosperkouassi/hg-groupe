import type { Metadata } from "next";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Expertises | Digital, Organisation, RH & Projets",

  description:
    "Découvrez les expertises de Hopla Groupe en Côte d’Ivoire : solutions digitales, organisation, ressources humaines et gestion de projet pour accompagner le développement des entreprises.",

  alternates: {
    canonical: "/expertises",
  },

  openGraph: {
    title: "Expertises | Digital, Organisation, RH & Projets",
    description:
      "Découvrez les expertises de Hopla Groupe en Côte d’Ivoire : solutions digitales, organisation, ressources humaines et gestion de projet pour accompagner le développement des entreprises.",
    url: "/expertises",
    type: "website",
    images: [
      {
        url: "/images/og-hopla-groupe.jpg",
        width: 1200,
        height: 630,
        alt: "Les expertises de Hopla Groupe",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Expertises | Digital, Organisation, RH & Projets",
    description:
      "Solutions digitales, organisation, ressources humaines et gestion de projet : découvrez les expertises de Hopla Groupe.",
    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export default function ExpertisesPage() {
  return (
    <main className="expertises-page">
      <PageHero title="Notre expertise" />

      <PageBreadcrumb
        items={[
          {
            label: "Expertises",
          },
        ]}
      />
    </main>
  );
}