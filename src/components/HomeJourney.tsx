"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Une ambition",
    text: "Comprendre ce que vous souhaitez construire, faire évoluer ou transformer.",
    color: "#FF7A58",
  },
  {
    number: "02",
    title: "Une stratégie",
    text: "Donner une direction claire et traduire l’intention en priorités concrètes.",
    color: "#F2295B",
  },
  {
    number: "03",
    title: "Une organisation",
    text: "Structurer les rôles, les pratiques et les ressources nécessaires pour avancer.",
    color: "#993578",
  },
  {
    number: "04",
    title: "Des outils",
    text: "Mettre en place les solutions digitales et opérationnelles adaptées aux usages.",
    color: "#2A7853",
  },
  {
    number: "05",
    title: "Une évolution",
    text: "Faire progresser l’ensemble dans le temps, au rythme des besoins et de l’évolution de l’entreprise.",
    color: "#74E8A0",
  },
];

export default function HomeJourney() {
  return (
    <section
      aria-labelledby="home-journey-title"
      className="relative overflow-hidden bg-[#F6F3EE] text-[#081426]"
    >
      {/* =====================================================
          DÉCOR
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute
            right-[-15%]
            top-[-20%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.07)_0%,rgba(242,41,91,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-25%]
            left-[-12%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.07)_0%,rgba(42,120,83,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />
      </div>

      <div className="container-hopla relative z-10 py-20 sm:py-24 md:py-28 lg:py-32">
        {/* =====================================================
            INTRODUCTION
        ====================================================== */}
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mb-6
              text-xs
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#081426]/40
            "
          >
            Une vision globale
          </motion.p>

          <motion.h2
            id="home-journey-title"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              max-w-3xl
              text-[clamp(2.35rem,4vw,4rem)]
              font-semibold
              leading-[1.03]
              tracking-[-0.045em]
            "
          >
            De l&apos;idée à l&apos;organisation

            <span className="block text-[#081426]/35">
              qui la fait vivre.
            </span>
          </motion.h2>
        </div>

        {/* =====================================================
            PARCOURS
        ====================================================== */}
        <div className="relative mt-16 md:mt-20 lg:mt-24">
          {/* LIGNE DESKTOP */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-0
              right-0
              top-[23px]
              hidden
              h-px
              bg-[#081426]/10
              lg:block
            "
          />

          {/* PROGRESSION COLORÉE DESKTOP */}
          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              absolute
              left-0
              right-0
              top-[23px]
              hidden
              h-px
              origin-left
              bg-gradient-to-r
              from-[#FF7A58]/40
              via-[#F2295B]/30
              to-[#74E8A0]/40
              lg:block
            "
          />

          {/* LIGNE MOBILE / TABLETTE */}
          <div
            aria-hidden="true"
            className="
              absolute
              bottom-0
              left-[21px]
              top-0
              w-px
              bg-[#081426]/10
              lg:hidden
            "
          />

          <div
            className="
              grid
              gap-12
              sm:gap-14
              lg:grid-cols-5
              lg:gap-6
            "
          >
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  group
                  relative
                  grid
                  grid-cols-[44px_1fr]
                  gap-6
                  lg:block
                  lg:pr-5
                "
              >
                {/* =================================================
                    NUMÉRO
                ================================================== */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#081426]/10
                    bg-[#F6F3EE]
                    text-[10px]
                    font-semibold
                    tracking-[0.14em]
                    text-[#081426]/50
                    shadow-[0_0_0_6px_#F6F3EE]
                    transition-all
                    duration-500
                    group-hover:-translate-y-1
                  "
                  style={{
                    borderColor: `${step.color}45`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      right-[-2px]
                      top-[-2px]
                      h-[7px]
                      w-[7px]
                      rounded-full
                    "
                    style={{
                      backgroundColor: step.color,
                    }}
                  />

                  {step.number}
                </div>

                {/* =================================================
                    TEXTE
                ================================================== */}
                <div className="lg:mt-9">
                  <h3
                    className="
                      text-[clamp(1.25rem,1.5vw,1.55rem)]
                      font-semibold
                      leading-[1.1]
                      tracking-[-0.03em]
                      text-[#081426]
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                      mt-[24px]
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#081426]/55
                      md:text-base
                      md:leading-7
                    "
                  >
                    {step.text}
                  </p>

                  {/* TRAIT D'ACCENT */}
                  <div
                    aria-hidden="true"
                    className="
                      mt-7
                      h-px
                      w-8
                      origin-left
                      opacity-50
                      transition-all
                      duration-500
                      group-hover:w-14
                      group-hover:opacity-100
                    "
                    style={{
                      backgroundColor: step.color,
                    }}
                  />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}