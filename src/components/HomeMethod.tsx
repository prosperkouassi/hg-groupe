"use client";

import { motion } from "motion/react";

const methodSteps = [
  {
    number: "01",
    title: "Observer",
    text: "Comprendre votre environnement, vos usages, vos contraintes et ce que vous souhaitez réellement faire évoluer.",
    color: "#FF7A58",
  },
  {
    number: "02",
    title: "Structurer",
    text: "Donner une forme claire au projet, organiser les priorités et construire les bases nécessaires pour avancer.",
    color: "#F2295B",
  },
  {
    number: "03",
    title: "Faire évoluer",
    text: "Déployer, ajuster et accompagner les transformations pour qu’elles restent utiles, cohérentes et durables.",
    color: "#74E8A0",
  },
];

export default function HomeMethod() {
  return (
    <section
      aria-labelledby="home-method-title"
      className="relative overflow-hidden bg-[#081426] text-white"
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
            left-[-18%]
            top-[10%]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,99,4,0.13)_0%,rgba(242,41,91,0.07)_42%,transparent_72%)]
            blur-3xl
            sm:h-[420px]
            sm:w-[420px]
            md:h-[480px]
            md:w-[480px]
            lg:h-[540px]
            lg:w-[540px]
          "
        />

        <div
          className="
            absolute
            bottom-[-20%]
            right-[-18%]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.12)_0%,rgba(42,120,83,0.07)_42%,transparent_72%)]
            blur-3xl
            sm:h-[420px]
            sm:w-[420px]
            md:h-[480px]
            md:w-[480px]
            lg:h-[540px]
            lg:w-[540px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]
            bg-[size:72px_72px]
            [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]
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
            lg:grid-cols-[1.1fr_0.9fr]
            lg:items-end
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
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
                text-white/35
              "
            >
              Notre méthode
            </p>

            <h2
              id="home-method-title"
              className="
                max-w-3xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Nous ne commençons pas

              <span className="block text-white/35">
                par une solution.
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
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
              text-white/55
              lg:justify-self-end
            "
          >
            Nous commençons par comprendre. Parce qu&apos;une solution
            pertinente dépend d&apos;abord de la réalité dans laquelle elle
            doit fonctionner.
          </motion.p>
        </div>

        {/* =====================================================
            ÉTAPES
        ====================================================== */}
        <div
          className="
            mt-16
            border-t
            border-white/10
            md:mt-20
            lg:mt-24
          "
        >
          {methodSteps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
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
                border-white/10
                py-8
                sm:py-9
                md:py-10
                lg:py-12
              "
            >
              {/* HOVER BACKGROUND */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-white/[0.018]
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              {/* ACCENT */}
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
                  backgroundColor: step.color,
                }}
              />

              <div
                className="
                  relative
                  z-10
                  grid
                  gap-7
                  md:grid-cols-[80px_minmax(0,0.8fr)_minmax(0,1.2fr)]
                  md:items-center
                  md:gap-8
                  lg:grid-cols-[100px_minmax(0,0.75fr)_minmax(0,1.25fr)]
                  lg:gap-10
                "
              >
                {/* =================================================
                    NUMÉRO
                ================================================== */}
                <div>
                  <p
                    aria-hidden="true"
                    className="
                      text-[clamp(2.5rem,4vw,4rem)]
                      font-semibold
                      leading-none
                      tracking-[-0.06em]
                      text-white/[0.07]
                      transition-all
                      duration-500
                      group-hover:text-white/[0.14]
                    "
                  >
                    {step.number}
                  </p>
                </div>

                {/* =================================================
                    TITRE
                ================================================== */}
                <div>
                  <h3
                    className="
                      text-[clamp(1.65rem,2.3vw,2.5rem)]
                      font-semibold
                      leading-[1]
                      tracking-[-0.04em]
                      transition-transform
                      duration-500
                      group-hover:translate-x-1
                    "
                  >
                    {step.title}
                  </h3>

                  <div
                    aria-hidden="true"
                    className="
                      mt-5
                      h-px
                      w-8
                      origin-left
                      opacity-70
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

                {/* =================================================
                    TEXTE
                ================================================== */}
                <p
                  className="
                    max-w-2xl
                    text-sm
                    leading-7
                    text-white/45
                    sm:text-base
                    md:pl-2
                  "
                >
                  {step.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}