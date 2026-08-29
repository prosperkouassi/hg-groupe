"use client";

import { motion } from "motion/react";

const values = [
  {
    number: "01",
    title: "L’exigence",
    text: "Aller au-delà d’une réponse simplement fonctionnelle pour construire quelque chose de pertinent, utile et durable.",
    accent: "#FF7A58",
  },
  {
    number: "02",
    title: "La clarté",
    text: "Expliquer, conseiller et avancer avec transparence, sans complexifier inutilement les décisions.",
    accent: "#F2295B",
  },
  {
    number: "03",
    title: "La proximité",
    text: "Comprendre les personnes, les usages et les réalités concrètes qui se trouvent derrière chaque besoin.",
    accent: "#993578",
  },
  {
    number: "04",
    title: "L’adaptation",
    text: "Construire une réponse ajustée au contexte, au niveau de maturité et aux ambitions de chaque organisation.",
    accent: "#2A7853",
  },
];

export default function AboutValues() {
  return (
    <section
      aria-labelledby="about-values-title"
      className="relative overflow-hidden bg-white text-[#081426]"
    >
      {/* DÉCOR */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{
            x: [0, 24, 0],
            y: [0, -16, 0],
            scale: [1, 1.04, 1],
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
            h-[420px]
            w-[420px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,122,88,0.08)_0%,rgba(242,41,91,0.025)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <motion.div
          animate={{
            x: [0, -18, 0],
            y: [0, 18, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[-16%]
            right-[-10%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.08)_0%,rgba(42,120,83,0.025)_45%,transparent_72%)]
            blur-3xl
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
                text-[#081426]/40
              "
            >
              Nos valeurs & engagements
            </p>

            <h2
              id="about-values-title"
              className="
                max-w-2xl
                text-[clamp(2.35rem,4vw,4rem)]
                font-semibold
                leading-[1.03]
                tracking-[-0.045em]
              "
            >
              Ce que nous voulons préserver

              <span className="block text-[#081426]/35">
                dans chaque collaboration.
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
            <p className="text-base leading-7 text-[#081426]/55 md:text-lg md:leading-8">
              Au-delà des méthodes et des outils, nous accordons de
              l’importance à la manière dont nous travaillons, échangeons et
              construisons chaque accompagnement.
            </p>
          </motion.div>
        </div>

        {/* VALEURS */}
        <div className="mt-16 border-t border-[#081426]/10 md:mt-20">
          {values.map((value, index) => (
            <motion.article
              key={value.number}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.75,
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                group
                relative
                grid
                gap-6
                border-b
                border-[#081426]/10
                py-10
                md:grid-cols-[110px_0.8fr_1.2fr]
                md:items-start
                md:gap-10
                md:py-12
                lg:grid-cols-[140px_0.8fr_1.2fr]
              "
            >
              {/* NUMÉRO */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="
                    text-[clamp(2.8rem,5vw,4.8rem)]
                    font-semibold
                    leading-none
                    tracking-[-0.06em]
                    text-[#081426]/[0.08]
                    transition-transform
                    duration-500
                    group-hover:translate-x-1
                  "
                >
                  {value.number}
                </span>
              </div>

              {/* TITRE */}
              <div>
                <div
                  aria-hidden="true"
                  className="mb-6 h-px w-10"
                  style={{
                    backgroundColor: value.accent,
                  }}
                />

                <h3
                  className="
                    text-[clamp(1.4rem,2vw,1.9rem)]
                    font-semibold
                    leading-tight
                    tracking-[-0.03em]
                  "
                >
                  {value.title}
                </h3>
              </div>

              {/* TEXTE */}
              <p
                className="
                  max-w-2xl
                  text-base
                  leading-7
                  text-[#081426]/55
                  md:text-lg
                  md:leading-8
                "
              >
                {value.text}
              </p>

              {/* HOVER */}
              <div
                aria-hidden="true"
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-px
                  origin-left
                  scale-x-0
                  transition-transform
                  duration-500
                  group-hover:scale-x-100
                "
                style={{
                  backgroundColor: value.accent,
                }}
              />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}