import type { Metadata } from "next";
import { Suspense } from "react";
import HomePartners from "@/components/HomePartners";
import HomeHero from "@/components/HomeHero";
import HomeManifesto from "@/components/HomeManifesto";
import HomePoles from "@/components/HomePoles";
import HomeJourney from "@/components/HomeJourney";
import HomeMethod from "@/components/HomeMethod";
import HomeProof from "@/components/HomeProof";
import HomeCases from "@/components/HomeCases";
import HomeFinalCTA from "@/components/HomeFinalCTA";


export const metadata: Metadata = {
  title: { absolute: "Conseil & accompagnement des entreprises à Abidjan | Hopla Groupe" },
  description: "Hopla Groupe accompagne les entreprises à Abidjan et en Côte d'Ivoire dans leur organisation, leur développement et leur digitalisation. Découvrez nos expertises.",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: "/",
    siteName: "Hopla Groupe",
    title: "Conseil & accompagnement des entreprises à Abidjan | Hopla Groupe",
    description: "Hopla Groupe accompagne les entreprises à Abidjan et en Côte d'Ivoire dans leur organisation, leur développement et leur digitalisation. Découvrez nos expertises.",
    images: [{
      url: "/images/og-hopla-groupe.jpg",
      width: 1200,
      height: 630,
      alt: "Hopla Groupe — Digital, Organisation & Développement",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conseil & accompagnement des entreprises à Abidjan | Hopla Groupe",
    description: "Hopla Groupe accompagne les entreprises à Abidjan et en Côte d'Ivoire dans leur organisation, leur développement et leur digitalisation. Découvrez nos expertises.",
    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export default function Home() {
  return (
    <main>
      {/* =====================================================
          PAGE D'ACCUEIL
      ====================================================== */}

      <HomeHero />
      <HomeManifesto />
      <Suspense fallback={null}><HomePartners /></Suspense>
      <HomePoles />
      <HomeJourney />
      <HomeMethod />
      <HomeProof />
      <HomeCases />
      <HomeFinalCTA />
    </main>
  );
}