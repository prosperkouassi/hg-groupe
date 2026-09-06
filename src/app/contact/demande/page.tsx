import type { Metadata } from "next";

import ContactProjectForm from "@/components/ContactProjectForm";

export const metadata: Metadata = {
  title: "Démarrer une demande | Hopla Groupe",

  description:
    "Présentez votre projet ou votre besoin à Hopla Groupe en quelques étapes.",

  robots: {
    index: false,
    follow: true,
  },
};

export default function ContactRequestPage() {
  return <ContactProjectForm />;
}