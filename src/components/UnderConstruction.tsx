"use client";

import Link from "next/link";
import { motion } from "motion/react";

type UnderConstructionProps = {
  title?: string;
  text?: string;
};

const tapeText = Array.from({ length: 8 }, (_, index) => (
  <span
    key={index}
    className="
      shrink-0
      px-5
      text-[15px]
      font-semibold
      uppercase
      tracking-[-0.02em]
      text-[#081426]
      sm:text-[18px]
      lg:text-[21px]
    "
  >
    Hopla Groupe — Page en construction
  </span>
));

export default function UnderConstruction({
  title = "Page en construction",
  text = "Nous préparons actuellement cette page. Elle sera bientôt disponible.",
}: UnderConstructionProps) {
  return (
    <section
      aria-labelledby="under-construction-title"
      className="
        relative
        min-h-[620px]
        overflow-hidden
        bg-white
        text-[#081426]
        sm:min-h-[680px]
        lg:min-h-[720px]
      "
    >
      {/* CONTENU */}
      <div
        className="
          container-hopla
          relative
          z-20
          pt-16
          sm:pt-20
          lg:pt-24
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-xl"
        >
          <p
            className="
              mb-5
              text-xs
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#081426]/35
            "
          >
            Hopla Groupe
          </p>

          <h2
            id="under-construction-title"
            className="
              text-[clamp(2.7rem,5vw,5.1rem)]
              font-semibold
              leading-[0.92]
              tracking-[-0.06em]
              text-[#081426]
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-6
              max-w-md
              text-base
              leading-7
              text-[#081426]/50
              sm:text-lg
              sm:leading-8
            "
          >
            {text}
          </p>

          <Link
            href="/"
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-3
              text-sm
              font-semibold
              text-[#081426]
            "
          >
            <span>Retour à l&apos;accueil</span>

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

      {/* BANDES DE CONSTRUCTION */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          overflow-hidden
        "
      >
        {/* BANDE 01 */}
        <motion.div
          animate={{
            x: ["-4%", "4%", "-4%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-18%]
            top-[49%]
            flex
            w-[145%]
            rotate-[11deg]
            items-center
            overflow-hidden
            bg-[#FFE500]
            py-4
            shadow-[0_8px_24px_rgba(8,20,38,0.08)]
            sm:top-[48%]
            sm:py-5
            lg:top-[46%]
          "
        >
          <div className="flex w-max items-center">
            {tapeText}
          </div>
        </motion.div>

        {/* BANDE 02 */}
        <motion.div
          animate={{
            x: ["4%", "-4%", "4%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-18%]
            top-[63%]
            flex
            w-[145%]
            -rotate-[7deg]
            items-center
            overflow-hidden
            bg-[#FFE500]
            py-4
            shadow-[0_8px_24px_rgba(8,20,38,0.08)]
            sm:top-[62%]
            sm:py-5
            lg:top-[60%]
          "
        >
          <div className="flex w-max items-center">
            {tapeText}
          </div>
        </motion.div>

        {/* BANDE 03 */}
        <motion.div
          animate={{
            x: ["-3%", "3%", "-3%"],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[-22%]
            top-[76%]
            flex
            w-[150%]
            rotate-[18deg]
            items-center
            overflow-hidden
            bg-[#FFE500]
            py-4
            shadow-[0_8px_24px_rgba(8,20,38,0.08)]
            sm:top-[75%]
            sm:py-5
            lg:top-[72%]
          "
        >
          <div className="flex w-max items-center">
            {tapeText}
          </div>
        </motion.div>

        {/* BANDE VERTICALE / DIAGONALE */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[-18%]
            top-[30%]
            hidden
            w-[78%]
            -rotate-[32deg]
            overflow-hidden
            bg-[#FFE500]
            py-5
            shadow-[0_8px_24px_rgba(8,20,38,0.08)]
            md:flex
          "
        >
          <div className="flex w-max items-center">
            {tapeText}
          </div>
        </motion.div>
      </div>

      {/* PETIT REPÈRE */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-8
          left-1/2
          z-20
          hidden
          -translate-x-1/2
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.3em]
          text-[#081426]/20
          sm:block
        "
      >
        Coming soon
      </div>
    </section>
  );
}