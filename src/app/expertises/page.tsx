import type { Metadata } from "next";

import ExpertisesShowcase from "@/components/ExpertisesShowcase";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: { absolute: "Digitalisation & conseil en organisation à Abidjan | Hopla Groupe" },

  description:
    "Découvrez les expertises de Hopla Groupe à Abidjan : solutions digitales avec AlteractWeb et conseil en organisation, RH et développement avec Stratég’Action.",

  alternates: {
    canonical: "/expertises",
  },

  openGraph: {
    title: "Digitalisation & conseil en organisation à Abidjan | Hopla Groupe",

    description:
      "Découvrez les expertises de Hopla Groupe à Abidjan : solutions digitales avec AlteractWeb et conseil en organisation, RH et développement avec Stratég’Action.",

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

    title: "Digitalisation & conseil en organisation à Abidjan | Hopla Groupe",

    description:
      "Découvrez les expertises de Hopla Groupe à Abidjan : solutions digitales avec AlteractWeb et conseil en organisation, RH et développement avec Stratég’Action.",

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

      <ExpertisesShowcase />
    </main>
  );
}