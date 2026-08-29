"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function AboutManifesto() {
  return (
    <section
      aria-labelledby="about-manifesto-title"
      className="relative overflow-hidden bg-[#F6F3EE] text-[#081426]"
    >
      {/* =====================================================
          DÉCOR
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <p
          className="
            absolute
            right-[-8%]
            top-[8%]
            whitespace-nowrap
            text-[clamp(5rem,14vw,13rem)]
            font-semibold
            leading-none
            tracking-[-0.07em]
            text-[#081426]/[0.025]
            sm:right-[-5%]
            md:right-[-3%]
          "
        >
          ENSEMBLE
        </p>

        <div
          className="
            absolute
            left-[-16%]
            top-[12%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.07)_0%,rgba(242,41,91,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-18%]
            right-[-14%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.07)_0%,rgba(42,120,83,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />
      </div>

      <div
        className="
          container-hopla
          relative
          z-10
          py-20
          sm:py-24
          md:py-28
          lg:py-32
        "
      >
        <div
          className="
            grid
            gap-12
            lg:grid-cols-[0.95fr_1.05fr]
            lg:items-start
            lg:gap-20
          "
        >
          {/* =================================================
              TITRE + IMAGE
          ================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p
              className="
                mb-6
                text-xs
                font-semibold
                uppercase
                tracking-[0.28em]
                text-[#081426]/40
              "
            >
              Notre vision
            </p>

            <h2
              id="about-manifesto-title"
              className="
                max-w-xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Deux expertises.

              <span className="block text-[#081426]/35">
                Une même vision.
              </span>
            </h2>

            {/* ===============================================
                IMAGE
            ================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.9,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                mt-10
                aspect-[4/3]
                overflow-hidden
                rounded-[22px]
                sm:mt-12
                lg:aspect-[1.25/1]
              "
            >
              <Image
                src="/images/about-vision.png"
                alt="Équipe en échange autour du développement et de la transformation d’une organisation"
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  hover:scale-[1.02]
                "
              />

              <div
                aria-hidden="true"
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#081426]/10
                  via-transparent
                  to-transparent
                "
              />
            </motion.div>
          </motion.div>

          {/* =================================================
              CONTENU
          ================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              max-w-2xl
              lg:pt-16
            "
          >
            <p
              className="
                text-[clamp(1.15rem,1.7vw,1.5rem)]
                font-medium
                leading-[1.55]
                tracking-[-0.02em]
                text-[#081426]
              "
            >
              Hopla Groupe est né d&apos;une conviction simple : les outils,
              les organisations et les projets ne peuvent pas évoluer
              durablement les uns sans les autres.
            </p>

            <div
              className="
                mt-10
                space-y-6
                text-base
                leading-7
                text-[#081426]/55
                md:text-lg
                md:leading-8
              "
            >
              <p>
                Nous réunissons deux expertises complémentaires pour
                accompagner les entreprises dans leur développement.
                AlteractWeb intervient sur le digital et la technologie,
                tandis que Stratège Action accompagne l&apos;organisation, les
                ressources humaines et les projets.
              </p>

              <p>
                Deux regards différents, réunis autour d&apos;une même
                ambition : rendre les transformations plus concrètes, plus
                cohérentes et plus durables.
              </p>
            </div>

            {/* =================================================
                CITATION / CONVICTION
            ================================================== */}
            <div
              className="
                mt-12
                border-l-2
                border-[#FF7A58]
                pl-6
                sm:pl-8
              "
            >
              <p
                className="
                  max-w-xl
                  text-[clamp(1.1rem,1.5vw,1.3rem)]
                  font-medium
                  leading-[1.6]
                  tracking-[-0.015em]
                  text-[#081426]/75
                "
              >
                Penser l&apos;entreprise dans son ensemble permet de construire
                des réponses plus justes, plus utiles et réellement adaptées
                à son évolution.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}