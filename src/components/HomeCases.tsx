"use client";

import Link from "next/link";
import { motion } from "motion/react";

const cases = [
  {
    number: "01",
    category: "Organisation & Développement",
    title: "Faire évoluer une organisation",
    text: "Clarifier le fonctionnement, structurer les responsabilités et faire évoluer les pratiques, notamment en ressources humaines, pour accompagner le développement de l’entreprise.",
    color: "#74E8A0",
  },
  {
    number: "02",
    category: "Digital & Technologie",
    title: "Transformer un besoin en solution",
    text: "Concevoir des outils digitaux et des solutions métiers adaptés aux usages, aux contraintes et aux ambitions de l’organisation.",
    color: "#FF7A58",
  },
  {
    number: "03",
    category: "Projet & Transformation",
    title: "Donner une forme concrète à une ambition",
    text: "Cadrer, structurer et piloter un projet pour passer de l’idée à une démarche organisée, lisible et réellement opérationnelle.",
    color: "#F2295B",
  },
];

export default function HomeCases() {
  return (
    <section
      aria-labelledby="home-cases-title"
      className="relative overflow-hidden bg-white text-[#081426]"
    >
      {/* =====================================================
          DÉCOR DE FOND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute
            left-[-16%]
            top-[8%]
            h-[480px]
            w-[480px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.055)_0%,rgba(242,41,91,0.02)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-18%]
            right-[-14%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.06)_0%,rgba(42,120,83,0.02)_45%,transparent_72%)]
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
        {/* =====================================================
            EN-TÊTE
        ====================================================== */}
        <div
          className="
            grid
            gap-10
            md:gap-12
            lg:grid-cols-[1fr_0.8fr]
            lg:items-end
            lg:gap-20
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
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
              Nos terrains d&apos;intervention
            </p>

            <h2
              id="home-cases-title"
              className="
                max-w-3xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Des ambitions différentes.

              <span className="block text-[#081426]/35">
                Une même volonté de les faire avancer.
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              max-w-xl
              text-[clamp(1rem,1.45vw,1.3rem)]
              leading-[1.65]
              text-[#081426]/50
              lg:justify-self-end
            "
          >
            Nous intervenons lorsque quelque chose doit être créé,
            structuré, transformé ou simplement mieux organisé.
          </motion.p>
        </div>

        {/* =====================================================
            CAS / DOMAINES
        ====================================================== */}
        <div
          className="
            mt-16
            border-t
            border-[#081426]/10
            md:mt-20
            lg:mt-24
          "
        >
          {cases.map((item, index) => (
            <motion.article
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                group
                relative
                overflow-hidden
                border-b
                border-[#081426]/10
                py-9
                sm:py-10
                md:py-11
                lg:py-12
              "
            >
              {/* FOND AU SURVOL */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[#081426]/[0.018]
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              {/* ACCENT LATÉRAL */}
              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-0
                  left-0
                  top-0
                  w-px
                  origin-center
                  scale-y-0
                  opacity-80
                  transition-transform
                  duration-500
                  group-hover:scale-y-100
                "
                style={{
                  backgroundColor: item.color,
                }}
              />

              <div
                className="
                  relative
                  z-10
                  grid
                  gap-8
                  md:grid-cols-[80px_minmax(0,1fr)]
                  md:gap-10
                  lg:grid-cols-[100px_minmax(0,0.95fr)_minmax(0,1.05fr)]
                  lg:items-center
                  lg:gap-12
                "
              >
                {/* =================================================
                    NUMÉRO
                ================================================== */}
                <div>
                  <p
                    aria-hidden="true"
                    className="
                      text-[clamp(2.6rem,4vw,4rem)]
                      font-semibold
                      leading-none
                      tracking-[-0.06em]
                      text-[#081426]/[0.08]
                      transition-all
                      duration-500
                      group-hover:text-[#081426]/[0.16]
                    "
                  >
                    {item.number}
                  </p>
                </div>

                {/* =================================================
                    IDENTITÉ
                ================================================== */}
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      leading-5
                      tracking-[0.22em]
                      sm:text-xs
                    "
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.category}
                  </p>

                  <h3
                    className="
                      mt-[24px]
                      max-w-lg
                      text-[clamp(1.6rem,2.3vw,2.55rem)]
                      font-semibold
                      leading-[1.05]
                      tracking-[-0.04em]
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                    "
                  >
                    {item.title}
                  </h3>

                  <div
                    aria-hidden="true"
                    className="
                      mt-6
                      h-px
                      w-8
                      origin-left
                      opacity-60
                      transition-all
                      duration-500
                      group-hover:w-14
                      group-hover:opacity-100
                    "
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                {/* =================================================
                    DESCRIPTION
                ================================================== */}
                <div className="md:col-start-2 lg:col-start-auto">
                  <p
                    className="
                      max-w-xl
                      text-sm
                      leading-7
                      text-[#081426]/50
                      sm:text-base
                    "
                  >
                    {item.text}
                  </p>
                </div>
              </div>

              {/* LIGNE BASSE ANIMÉE */}
              <span
                aria-hidden="true"
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[2px]
                  w-0
                  transition-all
                  duration-700
                  ease-out
                  group-hover:w-full
                "
                style={{
                  background: `linear-gradient(90deg, ${item.color}, transparent)`,
                }}
              />
            </motion.article>
          ))}
        </div>

        {/* =====================================================
            CTA
        ====================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            mt-10
            flex
            justify-start
            sm:mt-12
            md:justify-end
            lg:mt-14
          "
        >
          <Link
            href="/cas-etudes"
            className="
              group
              inline-flex
              items-center
              gap-4
              text-sm
              font-semibold
              text-[#081426]
            "
          >
            <span>Découvrir nos projets</span>

            <span
              aria-hidden="true"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-[#081426]/15
                bg-transparent
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:border-[#081426]
                group-hover:bg-[#081426]
                group-hover:text-white
              "
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}