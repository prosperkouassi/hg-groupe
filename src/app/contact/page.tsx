import type { Metadata } from "next";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";
import UnderConstruction from "@/components/UnderConstruction";

export const metadata: Metadata = {
  title: "Contact | Hopla Groupe",

  description:
    "Contactez Hopla Groupe pour échanger sur vos besoins en digital, technologie, organisation, ressources humaines ou gestion de projet.",

  alternates: {
    canonical: "/contact",
  },

  openGraph: {
    title: "Contact | Hopla Groupe",
    description:
      "Échangez avec Hopla Groupe autour de vos projets et besoins en transformation.",
    url: "/contact",
    type: "website",
    images: [
      {
        url: "/images/og-hopla-groupe.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Hopla Groupe",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Contact | Hopla Groupe",
    description:
      "Échangez avec Hopla Groupe autour de vos projets et besoins en transformation.",
    images: ["/images/og-hopla-groupe.jpg"],
  },
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <PageHero title="Contact" />

      <PageBreadcrumb
        items={[
          {
            label: "Contact",
          },
        ]}
      />

      <UnderConstruction
        title="Cette page se construit."
        text="Notre espace de contact sera bientôt disponible. En attendant, nous préparons une expérience plus simple pour démarrer vos prochaines collaborations avec Hopla Groupe."
      />
    </main>
  );
}