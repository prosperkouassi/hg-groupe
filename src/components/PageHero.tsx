"use client";

import { useEffect, useRef } from "react";

type PageHeroProps = {
  title: string;
  compact?: boolean;
};

export default function PageHero({
  title,
  compact = false,
}: PageHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) {
      return;
    }

    const handlePointerMove = (
      event: PointerEvent
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
        `${x}px`
      );

      hero.style.setProperty(
        "--page-mouse-y",
        `${y}px`
      );

      const normalizedX =
        x / rect.width -
        0.5;

      const normalizedY =
        y / rect.height -
        0.5;

      hero.style.setProperty(
        "--page-move-x",
        `${normalizedX * 18}px`
      );

      hero.style.setProperty(
        "--page-move-y",
        `${normalizedY * 12}px`
      );
    };

    const handlePointerLeave =
      () => {
        hero.style.setProperty(
          "--page-move-x",
          "0px"
        );

        hero.style.setProperty(
          "--page-move-y",
          "0px"
        );
      };

    hero.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );

    hero.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    return () => {
      hero.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      hero.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="page-hero"
    >
      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-[#050b16]" />

      {/* GRID */}

      <div className="page-hero-grid pointer-events-none absolute inset-0" />

      {/* HALOS */}

      <div className="page-hero-halo page-hero-halo-digital pointer-events-none absolute" />

      <div className="page-hero-halo page-hero-halo-strategy pointer-events-none absolute" />

      <div className="page-hero-halo page-hero-halo-hopla pointer-events-none absolute" />

      {/* ORBITS */}

      <div className="page-hero-orbit page-hero-orbit-one pointer-events-none absolute" />

      <div className="page-hero-orbit page-hero-orbit-two pointer-events-none absolute" />

      {/* MOUSE GLOW */}

      <div className="page-hero-mouse pointer-events-none absolute inset-0" />

      {/* TITLE */}

      <div className="container-hopla page-hero-content">
        <h1
          className={
            compact
              ? "page-hero-title !text-[clamp(2.8rem,6vw,5.6rem)]"
              : "page-hero-title"
          }
        >
          {title}
        </h1>
      </div>
    </section>
  );
}