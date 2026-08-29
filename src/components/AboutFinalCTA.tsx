"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

export default function AboutFinalCTA() {
  return (
    <section
      aria-labelledby="about-final-cta-title"
      className="
        relative
        isolate
        min-h-[620px]
        overflow-hidden
        bg-[#050b16]
        text-white
        sm:min-h-[680px]
        lg:min-h-[760px]
      "
    >
      {/* =====================================================
          IMAGE DE FOND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        >
          <Image
            src="/images/about-cta.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* =====================================================
          VOILE / DÉGRADÉ
      ====================================================== */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20
          bg-[linear-gradient(90deg,rgba(5,11,22,0.96)_0%,rgba(8,20,38,0.91)_40%,rgba(8,20,38,0.68)_72%,rgba(5,11,22,0.58)_100%)]
        "
      />

      {/* =====================================================
          DÉCOR ANIMÉ
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* HALO CHAUD */}
        <motion.div
          animate={{
            x: [0, 80, 20, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-14%]
            top-[10%]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(255,99,4,0.23)_0%,rgba(242,41,91,0.12)_38%,transparent_72%)]
            blur-3xl
            md:h-[680px]
            md:w-[680px]
          "
        />

        {/* HALO VERT */}
        <motion.div
          animate={{
            x: [0, -65, 15, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.08, 1.03, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[-24%]
            right-[-10%]
            h-[480px]
            w-[480px]
            rounded-full
            bg-[radial-gradient(circle,rgba(116,232,160,0.16)_0%,rgba(42,120,83,0.08)_40%,transparent_72%)]
            blur-3xl
            md:h-[650px]
            md:w-[650px]
          "
        />

        {/* MOT GÉANT */}
        <motion.p
          animate={{
            x: [0, -18, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-[2%]
            left-[3%]
            whitespace-nowrap
            text-[clamp(5rem,15vw,14rem)]
            font-semibold
            leading-none
            tracking-[-0.07em]
            text-white/[0.035]
          "
        >
          IMPULSION
        </motion.p>

        {/* GRILLE */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)]
            [background-size:72px_72px]
          "
        />

        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      </div>

      {/* =====================================================
          CONTENU
      ====================================================== */}
      <div
        className="
          container-hopla
          relative
          z-10
          flex
          min-h-[620px]
          items-center
          py-20
          sm:min-h-[680px]
          sm:py-24
          lg:min-h-[760px]
          lg:py-28
        "
      >
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mb-7
              text-xs
              font-semibold
              uppercase
              tracking-[0.28em]
              text-white/40
            "
          >
            Et maintenant ?
          </motion.p>

          <motion.h2
            id="about-final-cta-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.9,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              max-w-5xl
              text-[clamp(3rem,7vw,6.8rem)]
              font-semibold
              leading-[0.94]
              tracking-[-0.06em]
            "
          >
            Un projet ?

            <span className="block text-white/38">
              Une ambition ?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              mt-8
              max-w-2xl
              text-[clamp(1.05rem,1.6vw,1.35rem)]
              leading-[1.65]
              text-white/60
            "
          >
            Discutons de la prochaine impulsion à donner à votre activité.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.8,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10"
          >
            <Link
              href="/contact"
              className="
                group
                inline-flex
                items-center
                gap-4
                overflow-hidden
                rounded-full
                bg-gradient-to-r
                from-[#FF6304]
                to-[#F2295B]
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_35px_rgba(242,41,91,0.18)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_50px_rgba(242,41,91,0.28)]
                sm:px-7
                sm:py-4
              "
            >
              <span>Échanger avec nous</span>

              <span
                aria-hidden="true"
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}