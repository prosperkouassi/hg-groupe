import type { Metadata } from "next";
import Link from "next/link";
import LegalContent from "@/components/LegalContent";

export const metadata: Metadata = {
  title: { absolute: "Mentions légales | Hopla Groupe" },
  description: "Identification de Hopla Groupe et conditions d’utilisation de son site.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function MentionsLegalesPage() {
  return (
    <LegalContent title="Mentions légales" intro="Les informations relatives à l’éditeur du site Hopla Groupe et aux conditions de consultation de ses contenus.">
      <section>
        <h2>Identification de l’entreprise</h2>
        <p><strong>Société :</strong> Hopla Groupe.<br />
          <strong>RCCM :</strong> CI-ABJ-03-2026-B12-05997.<br />
          <strong>Adresse :</strong> Abidjan, Cocody Angré, 7e Tranche, Lot 4201 – Îlot 333, 27 BP 012040 Abidjan 27, Côte d’Ivoire.<br />
          <strong>Téléphone :</strong> <a href="tel:+2250714074124">+225 07 14 07 41 24</a>.</p>
        <p><strong>Informations à valider :</strong> la forme juridique, le capital social ainsi que l’identité et les coordonnées de l’hébergeur restent à confirmer et à compléter.</p>
      </section>
      <section>
        <h2>Responsable de publication</h2>
        <p>Monsieur KOUASSI Koffi Prosper, gérant de Hopla Groupe, et Madame GOERIG Manon, co-gérante de Hopla Groupe.</p>
      </section>
      <section>
        <h2>Objet du site</h2>
        <p>Le site présente les activités de Hopla Groupe : prestations de services, accompagnement des entreprises, organisation et digitalisation à travers AlteractWeb et Stratég’Action. Il permet de découvrir ces expertises et de prendre contact avec l’entreprise.</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, visuels, logos et autres éléments du site sont protégés par les règles applicables à la propriété intellectuelle. Les droits appartiennent à Hopla Groupe ou à leurs titulaires respectifs. Toute reproduction, adaptation ou exploitation nécessite l’autorisation du titulaire des droits, sous réserve des exceptions prévues par la loi.</p>
      </section>
      <section>
        <h2>Responsabilité</h2>
        <p>Hopla Groupe veille à la qualité des informations publiées, sans garantir leur exhaustivité ni leur actualisation permanente. Ces informations ont une portée générale. Vous pouvez signaler une erreur ou demander une précision via la <Link href="/contact">page de contact</Link>.</p>
        <p>L’accès au site peut être interrompu, notamment pour maintenance ou en cas de difficulté technique. Ces indications ne limitent pas les responsabilités imposées par le droit applicable.</p>
      </section>
      <section>
        <h2>Liens externes</h2>
        <p>Le site peut renvoyer vers des sites tiers. Leurs contenus et leurs conditions d’utilisation relèvent de leurs éditeurs respectifs ; Hopla Groupe ne maîtrise pas leurs évolutions.</p>
      </section>
      <section>
        <h2>Données personnelles</h2>
        <p>Pour connaître les données traitées lors de vos échanges avec Hopla Groupe, leurs finalités et les modalités d’exercice de vos droits, consultez notre <Link href="/politique-confidentialite">politique de confidentialité</Link>.</p>
      </section>
      <section>
        <h2>Droit applicable</h2>
        <p>Le site et son utilisation relèvent du droit applicable en Côte d’Ivoire. En cas de difficulté, vous pouvez contacter Hopla Groupe afin de rechercher une solution amiable, sans préjudice des recours prévus par la loi.</p>
      </section>
    </LegalContent>
  );
}
