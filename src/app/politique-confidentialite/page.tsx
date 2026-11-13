import type { Metadata } from "next";
import Link from "next/link";
import LegalContent from "@/components/LegalContent";

export const metadata: Metadata = {
  title: { absolute: "Politique de confidentialité | Hopla Groupe" },
  description: "Informations sur les données personnelles transmises à Hopla Groupe et les droits des personnes.",
  alternates: { canonical: "/politique-confidentialite" },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalContent title="Politique de confidentialité" intro="Cette page décrit le traitement annoncé des demandes de contact et les points qui restent à confirmer dans les pratiques de Hopla Groupe.">
      <section>
        <h2>Responsable du traitement</h2>
        <p>Hopla Groupe, immatriculée au RCCM sous le numéro CI-ABJ-03-2026-B12-05997, est responsable du traitement des données reçues pour les demandes de contact.</p>
        <p>Adresse : Abidjan, Cocody Angré, 7e Tranche, Lot 4201 – Îlot 333, 27 BP 012040 Abidjan 27, Côte d’Ivoire.<br />Téléphone : <a href="tel:+2250714074124">+225 07 14 07 41 24</a>.</p>
      </section>
      <section>
        <h2>Catégories de données</h2>
        <p>Les données renseignées dans le formulaire comprennent le nom, le prénom, l’adresse email, le numéro de téléphone et le contenu du message.</p>
        <p>Selon la demande, le formulaire peut également transmettre des renseignements sur votre entreprise, le service souhaité et des pièces jointes que vous choisissez de fournir. Évitez de communiquer des données sensibles ou des informations personnelles inutiles à votre demande.</p>
      </section>
      <section>
        <h2>Finalités</h2>
        <ul>
          <li>Répondre aux demandes reçues.</li>
          <li>Assurer les échanges professionnels nécessaires.</li>
          <li>Effectuer le suivi des demandes.</li>
        </ul>
        <p>Le traitement actuellement annoncé repose sur la réception et la gestion des contacts par boîte email. Aucun CRM ni outil d’analyse marketing n’est déclaré pour ce traitement.</p>
      </section>
      <section>
        <h2>Destinataires</h2>
        <p>Les demandes sont destinées aux personnes de Hopla Groupe chargées de leur réponse et de leur suivi. Les prestataires techniques de messagerie et d’hébergement peuvent intervenir dans l’acheminement ou le stockage des informations, dans la mesure nécessaire à leurs services.</p>
        <p>L’identité de ces prestataires, les lieux de stockage et les éventuels transferts de données restent à confirmer pour compléter cette information.</p>
      </section>
      <section>
        <h2>Sécurité</h2>
        <p>La protection des données nécessite notamment de limiter les accès aux personnes habilitées et de sécuriser les comptes de messagerie et les équipements utilisés. Les mesures effectivement appliquées et les garanties des prestataires restent à valider ; aucune transmission ou conservation ne peut être présentée comme totalement exempte de risque.</p>
      </section>
      <section>
        <h2>Conservation</h2>
        <p>La durée de conservation annoncée pour les demandes de contact est de 30 jours à compter de leur réception. Cette pratique reste à confirmer et à mettre en œuvre réellement dans la boîte email et les supports concernés.</p>
        <p>Aucune suppression automatique à l’issue de ce délai n’est confirmée. Le périmètre de suppression, y compris les copies et sauvegardes, ainsi que le traitement des échanges professionnels se poursuivant au-delà de ce délai doivent être précisés par Hopla Groupe.</p>
      </section>
      <section>
        <h2>Droits des personnes</h2>
        <p>Dans les conditions prévues par la réglementation applicable, vous pouvez demander l’accès à vos données, leur rectification ou leur suppression, et vous opposer à leur traitement. Adressez votre demande à Hopla Groupe en précisant le droit que vous souhaitez exercer et les échanges concernés.</p>
        <p>Si cela est nécessaire pour vérifier votre identité, des informations complémentaires pourront être demandées de manière proportionnée. Vous pouvez également saisir l’autorité compétente en matière de protection des données personnelles en Côte d’Ivoire.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Pour toute question ou demande relative à vos données, contactez Hopla Groupe par téléphone au <a href="tel:+2250714074124">+225 07 14 07 41 24</a>, par courrier à l’adresse indiquée ci-dessus ou via la <Link href="/contact">page de contact</Link>, en précisant « Données personnelles ».</p>
      </section>
      <section>
        <h2>Cookies et traceurs</h2>
        <p>Un cookie de session est utilisé pour l’authentification à l’espace d’administration. Son existence ne signifie pas qu’un cookie publicitaire soit déposé sur les pages publiques.</p>
        <p>Aucun outil d’analyse marketing n’est déclaré à ce jour. L’inventaire des cookies, traceurs, journaux techniques et services tiers doit toutefois être vérifié sur le site en production et auprès des prestataires. L’absence de tout cookie ou traceur ne peut donc pas être garantie. Si des traceurs soumis au consentement sont utilisés, une information et un recueil du consentement adaptés devront être mis en place.</p>
      </section>
      <section>
        <h2>Informations sur l’éditeur</h2>
        <p>Consultez également les <Link href="/mentions-legales">mentions légales</Link> de Hopla Groupe.</p>
      </section>
    </LegalContent>
  );
}
