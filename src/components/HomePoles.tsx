"use client";

import { motion } from "motion/react";

export default function HomePoles() {
  return (
    <section
      aria-labelledby="home-poles-title"
      className="relative overflow-hidden bg-[#081426] text-white"
    >
      {/* DÉCOR GLOBAL */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="
            absolute
            left-[-18%]
            top-[5%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,99,4,0.09)_0%,rgba(242,41,91,0.045)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-[-12%]
            right-[-16%]
            h-[560px]
            w-[560px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.08)_0%,rgba(42,120,83,0.04)_45%,transparent_72%)]
            blur-3xl
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)]
            bg-[size:72px_72px]
            [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]
          "
        />
      </div>

      <div className="container-hopla relative z-10 py-20 sm:py-24 md:py-28 lg:py-32">
        {/* =====================================================
            EN-TÊTE
        ====================================================== */}
        <div className="mb-14 md:mb-18 lg:mb-20">
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
              text-white/35
            "
          >
            Nos expertises
          </motion.p>

          <motion.h2
            id="home-poles-title"
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
              leading-[1.02]
              tracking-[-0.045em]
            "
          >
            Deux pôles.

            <span className="block text-white/35">
              Une même ambition.
            </span>
          </motion.h2>
        </div>

        {/* =====================================================
            PÔLES
        ====================================================== */}
        <div className="border-y border-white/10">
          {/* ===================================================
              ALTERACT WEB
          ==================================================== */}
          <motion.a
            href="https://alteractweb.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group
              relative
              block
              overflow-hidden
              border-b
              border-white/10
              py-10
              sm:py-12
              md:py-14
              lg:py-16
            "
          >
            {/* HOVER BACKGROUND */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-[#FF6304]/[0.07]
                via-[#F2295B]/[0.025]
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            {/* HALO */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[-10%]
                top-1/2
                h-[360px]
                w-[360px]
                -translate-y-1/2
                rounded-full
                bg-[radial-gradient(circle,rgba(255,99,4,0.17)_0%,rgba(242,41,91,0.07)_44%,transparent_72%)]
                blur-3xl
                opacity-70
                transition-all
                duration-700
                group-hover:scale-110
                group-hover:opacity-100
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-8
                md:grid-cols-[100px_minmax(0,1fr)]
                md:gap-10
                lg:grid-cols-[120px_minmax(0,1.1fr)_minmax(280px,0.75fr)]
                lg:items-center
                lg:gap-12
              "
            >
              {/* NUMÉRO */}
              <div>
                <p
                  aria-hidden="true"
                  className="
                    text-[clamp(4.2rem,8vw,7rem)]
                    font-semibold
                    leading-[0.85]
                    tracking-[-0.07em]
                    text-white/[0.07]
                    transition-colors
                    duration-500
                    group-hover:text-[#FF7A58]/20
                  "
                >
                  01
                </p>
              </div>

              {/* IDENTITÉ */}
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[#FF7A58]
                  "
                >
                  Pôle 01
                </p>

                <div className="mt-4 flex flex-col gap-[24px]">
                  <h3
                    className="
                      text-[clamp(2rem,3.2vw,3.5rem)]
                      font-semibold
                      leading-[0.95]
                      tracking-[-0.045em]
                    "
                  >
                    Alteract Web
                  </h3>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-white/35
                      sm:text-sm
                    "
                  >
                    Digital & Technologie
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-start-2 lg:col-start-auto">
                <p
                  className="
                    max-w-lg
                    text-sm
                    leading-7
                    text-white/55
                    sm:text-base
                    md:text-[1.03rem]
                  "
                >
                  Imaginer, concevoir et déployer des sites web,
                  des applications et des outils métiers pensés pour
                  les usages et l&apos;évolution des entreprises.
                </p>

                <div
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  <span>Découvrir Alteract Web</span>

                  <span
                    aria-hidden="true"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.03]
                      text-base
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:border-[#FF7A58]/35
                      group-hover:bg-[#FF7A58]/10
                    "
                  >
                    ↗
                  </span>
                </div>
              </div>
            </div>
          </motion.a>

          {/* ===================================================
              STRATÈGE ACTION
          ==================================================== */}
          <motion.a
            href="https://strategaction.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{
              duration: 0.85,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group
              relative
              block
              overflow-hidden
              py-10
              sm:py-12
              md:py-14
              lg:py-16
            "
          >
            {/* HOVER BACKGROUND */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-r
                from-transparent
                via-[#2A7853]/[0.025]
                to-[#74E8A0]/[0.06]
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            {/* HALO */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                right-[-10%]
                top-1/2
                h-[380px]
                w-[380px]
                -translate-y-1/2
                rounded-full
                bg-[radial-gradient(circle,rgba(116,232,160,0.15)_0%,rgba(42,120,83,0.07)_44%,transparent_72%)]
                blur-3xl
                opacity-70
                transition-all
                duration-700
                group-hover:scale-110
                group-hover:opacity-100
              "
            />

            <div
              className="
                relative
                z-10
                grid
                gap-8
                md:grid-cols-[100px_minmax(0,1fr)]
                md:gap-10
                lg:grid-cols-[120px_minmax(0,1.1fr)_minmax(280px,0.75fr)]
                lg:items-center
                lg:gap-12
              "
            >
              {/* NUMÉRO */}
              <div>
                <p
                  aria-hidden="true"
                  className="
                    text-[clamp(4.2rem,8vw,7rem)]
                    font-semibold
                    leading-[0.85]
                    tracking-[-0.07em]
                    text-white/[0.07]
                    transition-colors
                    duration-500
                    group-hover:text-[#74E8A0]/20
                  "
                >
                  02
                </p>
              </div>

              {/* IDENTITÉ */}
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[#74E8A0]
                  "
                >
                  Pôle 02
                </p>

                <div className="mt-4 flex flex-col gap-[24px]">
                  <h3
                    className="
                      text-[clamp(2rem,3.2vw,3.5rem)]
                      font-semibold
                      leading-[0.95]
                      tracking-[-0.045em]
                    "
                  >
                    Stratège Action
                  </h3>

                  <p
                    className="
                      text-xs
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-white/35
                      sm:text-sm
                    "
                  >
                    Organisation & Développement
                  </p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="md:col-start-2 lg:col-start-auto">
                <p
                  className="
                    max-w-lg
                    text-sm
                    leading-7
                    text-white/55
                    sm:text-base
                    md:text-[1.03rem]
                  "
                >
                  Structurer les organisations, développer les pratiques
                  en ressources humaines et accompagner la gestion de projet
                  pour transformer les ambitions en réalités opérationnelles.
                </p>

                <div
                  className="
                    mt-7
                    inline-flex
                    items-center
                    gap-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  <span>Découvrir Stratège Action</span>

                  <span
                    aria-hidden="true"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.03]
                      text-base
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:border-[#74E8A0]/35
                      group-hover:bg-[#74E8A0]/10
                    "
                  >
                    ↗
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}