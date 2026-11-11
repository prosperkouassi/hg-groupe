import type { Metadata } from "next";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";
import AboutManifesto from "@/components/AboutManifesto";
import AboutValues from "@/components/AboutValues";
import AboutProcess from "@/components/AboutProcess";
import AboutFinalCTA from "@/components/AboutFinalCTA";

export const metadata: Metadata = {
  title: { absolute: "Hopla Groupe | Conseil & digitalisation en Côte d'Ivoire" },

  description:
    "Découvrez Hopla Groupe, ses valeurs et ses deux expertises complémentaires : digitalisation et organisation des entreprises à Abidjan et en Côte d'Ivoire.",

  alternates: {
    canonical: "/a-propos",
  },

  openGraph: {
    title: "Hopla Groupe | Conseil & digitalisation en Côte d'Ivoire",
    description:
      "Découvrez Hopla Groupe, ses valeurs et ses deux expertises complémentaires : digitalisation et organisation des entreprises à Abidjan et en Côte d'Ivoire.",
    url: "/a-propos",
    type: "website",
    images: [
      {
        url: "/images/og-hopla-groupe.jpg",
        width: 1200,
        height: 630,
        alt: "À propos de Hopla Groupe",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Hopla Groupe | Conseil & digitalisation en Côte d'Ivoire",
    description:
      "Découvrez Hopla Groupe, ses valeurs et ses deux expertises complémentaires : digitalisation et organisation des entreprises à Abidjan et en Côte d'Ivoire.",
    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export default function AProposPage() {
  return (
    <main className="a-propos-page">
      <PageHero title="À propos" />

      <PageBreadcrumb
        items={[
          {
            label: "À propos",
          },
        ]}
      />

      <AboutManifesto />

      <AboutValues />
      <AboutProcess />
      <AboutFinalCTA />
    </main>
  );
}