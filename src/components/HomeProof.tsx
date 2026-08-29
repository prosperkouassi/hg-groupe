"use client";

import { motion } from "motion/react";

const proofItems = [
  {
    number: "01",
    title: "Deux expertises complémentaires",
    text: "Digital, technologie, organisation et développement réunis autour d’une même vision de l’entreprise.",
    color: "#FF7A58",
  },
  {
    number: "02",
    title: "Une approche ancrée dans le réel",
    text: "Nous partons des usages, des contraintes et du fonctionnement concret avant de construire une réponse.",
    color: "#F2295B",
  },
  {
    number: "03",
    title: "France · Côte d’Ivoire",
    text: "Une culture professionnelle nourrie par deux environnements économiques et des réalités d’entreprise différentes.",
    color: "#993578",
  },
  {
    number: "04",
    title: "Des solutions sur mesure",
    text: "Nous adaptons les méthodes, les outils et l’accompagnement à la maturité, aux besoins et aux ambitions de chaque organisation.",
    color: "#74E8A0",
  },
];

export default function HomeProof() {
  return (
    <section
      aria-labelledby="home-proof-title"
      className="relative overflow-hidden bg-[#F6F3EE] text-[#081426]"
    >
      {/* =====================================================
          DÉCOR DE FOND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* MOT GÉANT */}
        <p
          className="
            absolute
            right-[-8%]
            top-[5%]
            whitespace-nowrap
            text-[clamp(5rem,15vw,14rem)]
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

        {/* HALO CHAUD */}
        <div
          className="
            absolute
            left-[-18%]
            top-[20%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.06)_0%,rgba(242,41,91,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />

        {/* HALO VERT */}
        <div
          className="
            absolute
            bottom-[-20%]
            right-[-15%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.065)_0%,rgba(42,120,83,0.025)_45%,transparent_72%)]
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
            INTRODUCTION
        ====================================================== */}
        <div
          className="
            grid
            gap-10
            md:gap-12
            lg:grid-cols-[0.9fr_1.1fr]
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
              Ce qui nous rassemble
            </p>

            <h2
              id="home-proof-title"
              className="
                max-w-xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Deux regards.

              <span className="block text-[#081426]/35">
                Une même exigence.
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
              max-w-2xl
              text-[clamp(1rem,1.45vw,1.3rem)]
              leading-[1.65]
              text-[#081426]/55
            "
          >
            Hopla Groupe réunit des expertises différentes sans les
            cloisonner. Notre point commun : comprendre ce qui doit évoluer,
            structurer la réponse et construire des solutions capables de
            fonctionner dans la réalité.
          </motion.p>
        </div>

        {/* =====================================================
            REPÈRES
        ====================================================== */}
        <div
          className="
            mt-16
            grid
            border-t
            border-[#081426]/10
            md:mt-20
            md:grid-cols-2
            lg:mt-24
          "
        >
          {proofItems.map((item, index) => (
            <motion.article
              key={item.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.75,
                delay: index * 0.07,
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
                md:min-h-[260px]
                md:p-9
                md:even:border-l
                lg:min-h-[280px]
                lg:p-11
              "
            >
              {/* =================================================
                  FOND AU SURVOL
              ================================================== */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-white/25
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              {/* =================================================
                  NUMÉRO
              ================================================== */}
              <div className="relative z-10 flex items-center gap-4">
                <p
                  aria-hidden="true"
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[#081426]/30
                    transition-colors
                    duration-500
                    group-hover:text-[#081426]/55
                  "
                >
                  {item.number}
                </p>

                <div
                  aria-hidden="true"
                  className="
                    h-px
                    w-7
                    origin-left
                    opacity-60
                    transition-all
                    duration-500
                    group-hover:w-12
                    group-hover:opacity-100
                  "
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* =================================================
                  CONTENU
              ================================================== */}
              <div className="relative z-10 mt-10 lg:mt-12">
                <h3
                  className="
                    max-w-md
                    text-[clamp(1.35rem,1.8vw,1.9rem)]
                    font-semibold
                    leading-[1.12]
                    tracking-[-0.035em]
                    transition-transform
                    duration-500
                    group-hover:translate-x-1
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-[24px]
                    max-w-md
                    text-sm
                    leading-7
                    text-[#081426]/50
                    sm:text-base
                  "
                >
                  {item.text}
                </p>
              </div>

              {/* =================================================
                  TRAIT COLORÉ
              ================================================== */}
              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[2px]
                  w-0
                  transition-all
                  duration-500
                  group-hover:w-full
                "
                style={{
                  backgroundColor: item.color,
                }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}