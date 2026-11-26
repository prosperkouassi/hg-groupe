import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Confirmation from "@/modules/recrutement/application/Confirmation";
import { publicApplicationsEnabled } from "@/modules/recrutement/public-visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmer ma candidature",
  description: "Confirmation de votre adresse e-mail pour une candidature à Hopla Groupe.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  if (!publicApplicationsEnabled()) notFound();
  return (
    <main>
      <PageHero title="Confirmation de candidature" compact />
      <PageBreadcrumb items={[{ label: "Recrutement", href: "/recrutement" }, { label: "Confirmation" }]} />
      <Confirmation />
    </main>
  );
}
