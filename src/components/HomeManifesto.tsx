"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function HomeManifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundX = useTransform(
    scrollYProgress,
    [0, 1],
    ["6%", "-6%"]
  );

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "6%"]
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="manifesto-title"
      className="
        relative
        overflow-hidden
        bg-[#F6F3EE]
        text-[#081426]
      "
    >
      {/* =====================================================
          TRANSITION DEPUIS LE HERO
      ====================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#081426]/10
          to-transparent
        "
      />

      {/* =====================================================
          MOT GÉANT EN ARRIÈRE-PLAN
      ====================================================== */}
      <motion.p
        aria-hidden="true"
        style={{
          x: backgroundX,
          y: backgroundY,
        }}
        className="
          pointer-events-none
          absolute
          left-[-5%]
          top-[5%]
          whitespace-nowrap
          text-[clamp(5rem,15vw,14rem)]
          font-semibold
          leading-none
          tracking-[-0.07em]
          text-[#081426]/[0.025]
          sm:left-[-3%]
          md:top-[7%]
        "
      >
        ÉVOLUER
      </motion.p>

      {/* =====================================================
          CONTENU
      ====================================================== */}
      <div
        className="
          container-hopla
          relative
          z-10
          grid
          items-center
          gap-12
          py-20
          sm:py-24
          md:gap-14
          md:py-28
          lg:grid-cols-2
          lg:gap-24
          lg:py-32
        "
      >
        {/* =====================================================
            PARTIE GAUCHE
        ====================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            y: 34,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.28,
          }}
          transition={{
            duration: 0.9,
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
              md:mb-8
            "
          >
            Notre raison d&apos;être
          </p>

          <h2
            id="manifesto-title"
            className="
              max-w-xl
              text-[clamp(2.35rem,4vw,4.15rem)]
              font-semibold
              leading-[1.03]
              tracking-[-0.045em]
            "
          >
            Les entreprises changent.

            <span className="block text-[#081426]/35">
              Leurs besoins aussi.
            </span>
          </h2>
        </motion.div>

        {/* =====================================================
            PARTIE DROITE
        ====================================================== */}
        <motion.div
          initial={{
            opacity: 0,
            y: 42,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.28,
          }}
          transition={{
            duration: 0.95,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            max-w-xl
            lg:translate-y-8
          "
        >
          <div
            aria-hidden="true"
            className="
              mb-7
              h-px
              w-20
              bg-gradient-to-r
              from-[#FF7A58]
              via-[#F2295B]
              to-[#74E8A0]
              md:mb-9
            "
          />

          <p
            className="
              text-[clamp(1.15rem,1.7vw,1.7rem)]
              font-medium
              leading-[1.5]
              tracking-[-0.02em]
              text-[#081426]/70
            "
          >
            Nous créons les conditions pour que leurs outils digitaux,
            leur organisation et leurs projets avancent avec elles.
          </p>
        </motion.div>
      </div>
    </section>
  );
}