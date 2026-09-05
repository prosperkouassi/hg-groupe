"use client";

import {
  useEffect,
  useRef,
} from "react";

type PageHeroProps = {
  title: string;
  compact?: boolean;
};

export default function PageHero({
  title,
  compact = false,
}: PageHeroProps) {
  const heroRef =
    useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero =
      heroRef.current;

    if (!hero) {
      return;
    }

    const handlePointerMove = (
      event: PointerEvent,
    ) => {
      const rect =
        hero.getBoundingClientRect();

      const x =
        event.clientX -
        rect.left;

      const y =
        event.clientY -
        rect.top;

      hero.style.setProperty(
        "--page-mouse-x",
        `${x}px`,
      );

      hero.style.setProperty(
        "--page-mouse-y",
        `${y}px`,
      );

      const moveX =
        ((x / rect.width) - 0.5) * 18;

      const moveY =
        ((y / rect.height) - 0.5) * 12;

      hero.style.setProperty(
        "--page-move-x",
        `${moveX}px`,
      );

      hero.style.setProperty(
        "--page-move-y",
        `${moveY}px`,
      );
    };

    const handlePointerLeave = () => {
      hero.style.setProperty(
        "--page-move-x",
        "0px",
      );

      hero.style.setProperty(
        "--page-move-y",
        "0px",
      );
    };

    hero.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      },
    );

    hero.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    return () => {
      hero.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      hero.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`page-hero ${
        compact
          ? "page-hero-compact"
          : ""
      }`}
    >
      {/* FOND */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-[#050B16]
        "
      />

      {/* GRILLE */}

      <div
        aria-hidden="true"
        className="
          page-hero-grid
          pointer-events-none
          absolute
          inset-0
        "
      />

      {/* HALOS */}

      <div
        aria-hidden="true"
        className="
          page-hero-halo
          page-hero-halo-digital
          pointer-events-none
          absolute
        "
      />

      <div
        aria-hidden="true"
        className="
          page-hero-halo
          page-hero-halo-strategy
          pointer-events-none
          absolute
        "
      />

      <div
        aria-hidden="true"
        className="
          page-hero-halo
          page-hero-halo-hopla
          pointer-events-none
          absolute
        "
      />

      {/* ORBITES */}

      <div
        aria-hidden="true"
        className="
          page-hero-orbit
          page-hero-orbit-one
          pointer-events-none
          absolute
        "
      />

      <div
        aria-hidden="true"
        className="
          page-hero-orbit
          page-hero-orbit-two
          pointer-events-none
          absolute
        "
      />

      {/* LUMIÈRE SOURIS */}

      <div
        aria-hidden="true"
        className="
          page-hero-mouse
          pointer-events-none
          absolute
          inset-0
        "
      />

      {/* CONTENU */}

      <div className="container-hopla page-hero-content">
        <h1
          className="
            page-hero-title
            font-display
          "
        >
          {title}
        </h1>
      </div>
    </section>
  );
}