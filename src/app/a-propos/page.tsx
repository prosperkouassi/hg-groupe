import type { Metadata } from "next";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";
import AboutManifesto from "@/components/AboutManifesto";
import AboutValues from "@/components/AboutValues";
import AboutProcess from "@/components/AboutProcess";
import AboutFinalCTA from "@/components/AboutFinalCTA";

export const metadata: Metadata = {
  title: "À propos | Notre vision & nos expertises",

  description:
    "Découvrez Hopla Groupe, un groupe implanté en Côte d’Ivoire qui réunit deux expertises complémentaires : digital et technologie, organisation, ressources humaines et gestion de projet.",

  alternates: {
    canonical: "/a-propos",
  },

  openGraph: {
    title: "À propos | Notre vision & nos expertises",
    description:
      "Découvrez Hopla Groupe et la vision qui réunit nos expertises en digital, technologie, organisation, ressources humaines et gestion de projet.",
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
    title: "À propos | Notre vision & nos expertises",
    description:
      "Découvrez Hopla Groupe et deux pôles complémentaires au service du développement et de la transformation des organisations.",
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