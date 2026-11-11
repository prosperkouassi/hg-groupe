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