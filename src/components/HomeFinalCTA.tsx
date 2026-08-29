"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function HomeFinalCTA() {
  return (
    <section
      aria-labelledby="home-final-cta-title"
      className="relative overflow-hidden bg-[#050B16] text-white"
    >
      {/* =====================================================
          DÉCOR
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* HALO CHAUD */}
        <motion.div
          animate={{
            x: [0, 28, 0],
            y: [0, -16, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-18%]
            top-[8%]
            h-[320px]
            w-[320px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,99,4,0.20)_0%,rgba(242,41,91,0.10)_42%,transparent_72%)]
            blur-3xl
            sm:h-[380px]
            sm:w-[380px]
            md:left-[-12%]
            md:h-[460px]
            md:w-[460px]
            lg:h-[520px]
            lg:w-[520px]
          "
        />

        {/* HALO VERT */}
        <motion.div
          animate={{
            x: [0, -24, 0],
            y: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[-22%]
            right-[-18%]
            h-[320px]
            w-[320px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.18)_0%,rgba(42,120,83,0.10)_42%,transparent_72%)]
            blur-3xl
            sm:h-[380px]
            sm:w-[380px]
            md:right-[-12%]
            md:h-[460px]
            md:w-[460px]
            lg:h-[520px]
            lg:w-[520px]
          "
        />

        {/* GRILLE TRÈS DISCRÈTE */}
        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.014)_1px,transparent_1px)]
            bg-[size:72px_72px]
            [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]
          "
        />

        {/* LIGNE SUPÉRIEURE */}
        <div
          className="
            absolute
            left-0
            right-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          CONTENU
      ====================================================== */}
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-4xl"
        >
          {/* SURTITRE */}
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
            Et maintenant ?
          </p>

          {/* TITRE */}
          <h2
            id="home-final-cta-title"
            className="
              max-w-4xl
              text-[clamp(2.35rem,4vw,4rem)]
              font-semibold
              leading-[1.03]
              tracking-[-0.045em]
            "
          >
            Un projet ?

            <span className="block text-white/35">
              Faisons-le avancer.
            </span>
          </h2>

          {/* PARAGRAPHE — 24 PX APRÈS LE TITRE */}
          <p
            className="
              mt-[24px]
              max-w-2xl
              text-[clamp(1rem,1.45vw,1.3rem)]
              leading-[1.65]
              text-white/50
            "
          >
            Que votre besoin concerne votre organisation, vos outils
            digitaux ou le développement d&apos;un projet, nous construisons
            avec vous la prochaine étape.
          </p>

          {/* =================================================
              CTA
          ================================================== */}
          <div className="mt-10 md:mt-12">
            <Link
              href="/contact"
              className="
                group
                inline-flex
                items-center
                gap-4
                rounded-full
                bg-gradient-to-r
                from-[#FF7A58]
                to-[#F2295B]
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_35px_rgba(242,41,91,0.16)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_50px_rgba(242,41,91,0.24)]
                md:px-7
                md:py-4
              "
            >
              <span>Parler de votre projet</span>

              <span
                aria-hidden="true"
                className="
                  flex
                  h-8
                  w-8
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white/15
                  text-white
                  transition-all
                  duration-300
                  group-hover:translate-x-1
                  group-hover:bg-white/25
                "
              >
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}