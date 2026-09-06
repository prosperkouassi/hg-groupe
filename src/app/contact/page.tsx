import type { Metadata } from "next";
import Link from "next/link";

import PageBreadcrumb from "@/components/PageBreadcrumb";
import PageHero from "@/components/PageHero";

import styles from "./contact.module.css";

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

      <section className={styles.contactIntro}>
        <div className="container-hopla">
          <div className={styles.introGrid}>
            <div className={styles.introContent}>
              <span className={styles.eyebrow}>
                Nous contacter
              </span>

              <h2 className={styles.introTitle}>
                Parlons de vos projets.
              </h2>

              <p className={styles.introText}>
                Un projet, une problématique ou simplement une idée à
                explorer ? Échangeons sur votre besoin et voyons ensemble
                comment Hopla Groupe peut vous accompagner.
              </p>

              <div className={styles.introActions}>
                <Link
                  href="/contact/demande"
                  className={styles.primaryButton}
                >
                  <span>Démarrer ma demande</span>

                  <span
                    aria-hidden="true"
                    className={styles.buttonArrow}
                  >
                    ↗
                  </span>
                </Link>

                <a
                  href="mailto:contact@hoplagroupe.com"
                  className={styles.secondaryButton}
                >
                  Nous écrire directement
                </a>
              </div>
            </div>

            <aside className={styles.contactAside}>
              <span className={styles.asideLabel}>
                Contact direct
              </span>

              <a
                href="mailto:contact@hoplagroupe.com"
                className={styles.emailLink}
              >
                contact@hoplagroupe.com
              </a>

              <p className={styles.asideText}>
                Vous préférez un premier échange simple ? Écrivez-nous
                directement et nous reviendrons vers vous dans les meilleurs
                délais.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.contactPoles}>
        <div className="container-hopla">
          <div className={styles.polesHeader}>
            <span className={styles.eyebrow}>
              Nos expertises
            </span>

            <h2 className={styles.polesTitle}>
              Deux expertises, une même ambition.
            </h2>

            <p className={styles.polesIntro}>
              Nous intervenons aussi bien sur vos enjeux d’organisation et de
              développement que sur vos projets digitaux et technologiques.
            </p>
          </div>

          <div className={styles.polesGrid}>
            <Link
              href="/expertises"
              className={`${styles.poleCard} ${styles.poleCardStrategy}`}
            >
              <span className={styles.poleNumber}>
                01
              </span>

              <div>
                <h3 className={styles.poleTitle}>
                  Organisation & Développement
                </h3>

                <p className={styles.poleText}>
                  Organisation, ressources humaines, gestion de projet et
                  accompagnement des dirigeants.
                </p>
              </div>

              <span
                aria-hidden="true"
                className={styles.poleArrow}
              >
                ↗
              </span>
            </Link>

            <Link
              href="/expertises"
              className={`${styles.poleCard} ${styles.poleCardDigital}`}
            >
              <span className={styles.poleNumber}>
                02
              </span>

              <div>
                <h3 className={styles.poleTitle}>
                  Digital & Technologie
                </h3>

                <p className={styles.poleText}>
                  Sites web, e-commerce, plateformes digitales et solutions
                  technologiques adaptées à vos usages.
                </p>
              </div>

              <span
                aria-hidden="true"
                className={styles.poleArrow}
              >
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.contactFinal}>
        <div className="container-hopla">
          <div className={styles.finalInner}>
            <span className={styles.finalEyebrow}>
              Un besoin à nous partager ?
            </span>

            <h2 className={styles.finalTitle}>
              Quelques étapes suffisent pour commencer.
            </h2>

            <p className={styles.finalText}>
              Présentez-nous votre demande afin que nous puissions comprendre
              rapidement votre contexte et vous orienter vers le bon
              interlocuteur.
            </p>

            <Link
              href="/contact/demande"
              className={styles.finalButton}
            >
              <span>Démarrer ma demande</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}