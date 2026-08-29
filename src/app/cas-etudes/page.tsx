import type { Metadata } from "next";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";
import UnderConstruction from "@/components/UnderConstruction";

export const metadata: Metadata = {
  title: "Cas d’études | Hopla Groupe",

  description:
    "Découvrez prochainement les projets et cas d’études accompagnés par Hopla Groupe en digital, technologie, organisation, ressources humaines et gestion de projet.",

  alternates: {
    canonical: "/cas-etudes",
  },

  openGraph: {
    title: "Cas d’études | Hopla Groupe",
    description:
      "Découvrez prochainement les projets et réalisations accompagnés par Hopla Groupe.",
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
      "Découvrez prochainement les projets et réalisations accompagnés par Hopla Groupe.",
    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export default function CasEtudesPage() {
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

      <UnderConstruction
        title="Nos cas d’études arrivent."
        text="Nous préparons actuellement une sélection de projets, de collaborations et de transformations accompagnés par Hopla Groupe."
      />
    </main>
  );
}