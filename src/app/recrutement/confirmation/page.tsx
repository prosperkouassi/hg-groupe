import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Confirmation from "@/modules/recrutement/application/Confirmation";

export const metadata: Metadata = {
  title: "Confirmer ma candidature",
  description: "Confirmation de votre adresse e-mail pour une candidature à Hopla Groupe.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <main>
      <PageHero title="Confirmation de candidature" compact />
      <PageBreadcrumb items={[{ label: "Recrutement", href: "/recrutement" }, { label: "Confirmation" }]} />
      <Confirmation />
    </main>
  );
}
