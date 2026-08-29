"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Comprendre",
    text: "Observer le contexte, les besoins, les contraintes et les objectifs avant de proposer une direction.",
    accent: "#FF7A58",
  },
  {
    number: "02",
    title: "Cadrer",
    text: "Clarifier les priorités, organiser la démarche et poser un cadre suffisamment lisible pour avancer.",
    accent: "#F2295B",
  },
  {
    number: "03",
    title: "Construire",
    text: "Déployer les solutions, les outils ou les actions nécessaires en restant au plus proche des usages réels.",
    accent: "#993578",
  },
  {
    number: "04",
    title: "Faire évoluer",
    text: "Mesurer, ajuster et accompagner la suite pour que la réponse continue de correspondre aux besoins dans le temps.",
    accent: "#74E8A0",
  },
];

export default function AboutProcess() {
  return (
    <section
      aria-labelledby="about-process-title"
      className="relative overflow-hidden bg-[#081426] text-white"
    >
      {/* DÉCOR */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -18, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-12%]
            top-[8%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.12)_0%,rgba(242,41,91,0.045)_42%,transparent_72%)]
            blur-3xl
          "
        />

        <motion.div
          animate={{
            x: [0, -28, 0],
            y: [0, 24, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[-18%]
            right-[-12%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.10)_0%,rgba(42,120,83,0.04)_42%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
            [background-size:72px_72px]
          "
        />
      </div>

      <div className="container-hopla relative z-10 py-20 sm:py-24 md:py-28 lg:py-32">
        {/* HEADER */}
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
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
              Notre process d&apos;action
            </p>

            <h2
              id="about-process-title"
              className="
                max-w-2xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Comprendre. Structurer.

              <span className="block text-white/35">
                Mettre en mouvement.
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.8,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-2xl lg:pt-12"
          >
            <p className="text-base leading-7 text-white/50 md:text-lg md:leading-8">
              Chaque intervention commence par une compréhension du besoin
              réel. Nous avançons ensuite étape par étape pour transformer
              l&apos;intention en démarche structurée, puis en action concrète.
            </p>
          </motion.div>
        </div>

        {/* PROCESS */}
        <div className="relative mt-16 md:mt-20">
          {/* LIGNE DESKTOP */}
          <div
            aria-hidden="true"
            className="
              absolute
              left-0
              right-0
              top-[43px]
              hidden
              h-px
              bg-white/10
              lg:block
            "
          />

          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              absolute
              left-0
              right-0
              top-[43px]
              hidden
              h-px
              origin-left
              bg-gradient-to-r
              from-[#FF7A58]
              via-[#F2295B]
              to-[#74E8A0]
              lg:block
            "
          />

          <div
            className="
              grid
              gap-0
              border-t
              border-white/10
              lg:grid-cols-4
              lg:border-t-0
            "
          >
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="
                  group
                  relative
                  border-b
                  border-white/10
                  py-10
                  lg:border-b-0
                  lg:border-r
                  lg:border-white/10
                  lg:px-8
                  lg:py-0
                  first:lg:pl-0
                  last:lg:border-r-0
                  last:lg:pr-0
                "
              >
                {/* NUMÉRO */}
                <div className="relative mb-10 flex items-center gap-4">
                  <span
                    className="
                      text-sm
                      font-semibold
                      tracking-[0.18em]
                    "
                    style={{
                      color: step.accent,
                    }}
                  >
                    {step.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="
                      relative
                      z-10
                      h-3
                      w-3
                      rounded-full
                      border
                      border-white/30
                      bg-[#081426]
                      transition-transform
                      duration-500
                      group-hover:scale-125
                    "
                  >
                    <span
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        h-1
                        w-1
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                      "
                      style={{
                        backgroundColor: step.accent,
                      }}
                    />
                  </span>
                </div>

                {/* TITRE */}
                <h3
                  className="
                    text-[clamp(1.5rem,2vw,2rem)]
                    font-semibold
                    leading-tight
                    tracking-[-0.03em]
                  "
                >
                  {step.title}
                </h3>

                {/* TEXTE */}
                <p
                  className="
                    mt-[24px]
                    max-w-sm
                    text-base
                    leading-7
                    text-white/45
                    md:text-lg
                    md:leading-8
                  "
                >
                  {step.text}
                </p>

                {/* HOVER */}
                <div
                  aria-hidden="true"
                  className="
                    mt-8
                    h-px
                    w-10
                    origin-left
                    transition-all
                    duration-500
                    group-hover:w-20
                  "
                  style={{
                    backgroundColor: step.accent,
                  }}
                />
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}