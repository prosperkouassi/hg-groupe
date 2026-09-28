"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

type HeroVisual = "hopla" | "digital" | "strategy" | "approach";

type HeroPanel = {
  id: string;
  number: string;
  label: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  accent: string;
  accentSecondary: string;
  accentSoft: string;
  background: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  visual: HeroVisual;
  meta: string[];
  cta: {
    label: string;
    href: string;
    external?: boolean;
  };
};

const panels: HeroPanel[] = [
  {
    id: "hopla",
    number: "01",
    label: "Hopla Groupe",
    eyebrow: "Hopla Groupe",
    title: (
      <>
        <span className="hero-slider-title-line">
          Accompagner<span className="text-[#FF7A58]">.</span>
        </span>
        <span className="hero-slider-title-line">
          Développer<span className="text-[#F2295B]">.</span>
        </span>
        <span className="hero-slider-title-line">
          Engager<span className="text-[#74E8A0]">.</span>
        </span>
      </>
    ),
    description:
      "Deux expertises complémentaires pour structurer, transformer et faire avancer vos ambitions.",
    accent: "#FF7A58",
    accentSecondary: "#993578",
    accentSoft: "rgba(255,122,88,0.22)",
    background: "#081426",
    backgroundImage: "/images/hero/hopla-groupe.webp",
    backgroundPosition: "center center",
    visual: "hopla",
    meta: ["Digital", "Organisation", "Développement"],
    cta: {
      label: "Découvrir nos expertises",
      href: "/expertises",
    },
  },
  {
    id: "alteractweb",
    number: "02",
    label: "AlteractWeb",
    eyebrow: "Digital & Technologie",
    title: (
      <>
        Transformer les idées
        <span className="hero-slider-title-secondary">
          en solutions digitales.
        </span>
      </>
    ),
    description:
      "Nous concevons des expériences digitales, des plateformes et des outils métiers pensés pour accompagner le développement des organisations.",
    accent: "#FF6304",
    accentSecondary: "#F2295B",
    accentSoft: "rgba(242,41,91,0.2)",
    background: "#0A101D",
    backgroundImage: "/images/hero/alteractweb.webp",
    backgroundPosition: "center center",
    visual: "digital",
    meta: ["Sites web", "Applications", "Logiciels métiers"],
    cta: {
      label: "Découvrir AlteractWeb",
      href: "https://alteractweb.com",
      external: true,
    },
  },
  {
    id: "strategaction",
    number: "03",
    label: "Stratège Action",
    eyebrow: "Organisation · RH · Projets",
    title: (
      <>
        Structurer pour avancer
        <span className="hero-slider-title-secondary">
          avec plus de maîtrise.
        </span>
      </>
    ),
    description:
      "Nous accompagnons les organisations et les porteurs de projets pour structurer leurs ressources, leurs pratiques et leur passage à l’action.",
    accent: "#74E8A0",
    accentSecondary: "#2A7853",
    accentSoft: "rgba(116,232,160,0.18)",
    background: "#081712",
    backgroundImage: "/images/hero/strategaction.webp",
    backgroundPosition: "center center",
    visual: "strategy",
    meta: ["Organisation", "Ressources humaines", "Gestion de projet"],
    cta: {
      label: "Découvrir Stratège Action",
      href: "https://strategaction.com",
      external: true,
    },
  },
  {
    id: "approche",
    number: "04",
    label: "Notre approche",
    eyebrow: "Une vision complémentaire",
    title: (
      <>
        Relier la stratégie
        <span className="hero-slider-title-secondary">
          à ce qui la rend possible.
        </span>
      </>
    ),
    description:
      "Le digital, l’organisation et les ressources ne fonctionnent pas en silos. Hopla Groupe rapproche ces expertises pour construire des réponses cohérentes avec vos réalités.",
    accent: "#C06D9B",
    accentSecondary: "#FF7A58",
    accentSoft: "rgba(192,109,155,0.18)",
    background: "#11101D",
    backgroundImage: "/images/hero/notre-approche.webp",
    backgroundPosition: "center center",
    visual: "approach",
    meta: ["Observer", "Structurer", "Faire évoluer"],
    cta: {
      label: "Découvrir notre approche",
      href: "/a-propos",
    },
  },
];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
    >
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroVisualStage({ panel }: { panel: HeroPanel }) {
  return (
    <div
      aria-hidden="true"
      className="hero-visual pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden lg:block"
    >
      <div className="hero-visual-depth" />
      <div className="hero-visual-orbit hero-visual-orbit-one" />
      <div className="hero-visual-orbit hero-visual-orbit-two" />

      {panel.visual === "hopla" && (
        <div className="hero-visual-hopla">
          <div className="hero-hopla-core"><span>HG</span></div>
          <div className="hero-hopla-node hero-hopla-node-one">Digital</div>
          <div className="hero-hopla-node hero-hopla-node-two">Organisation</div>
          <div className="hero-hopla-node hero-hopla-node-three">Développement</div>
          <span className="hero-hopla-line hero-hopla-line-one" />
          <span className="hero-hopla-line hero-hopla-line-two" />
          <span className="hero-hopla-line hero-hopla-line-three" />
        </div>
      )}

      {panel.visual === "digital" && (
        <div className="hero-visual-digital">
          <div className="hero-digital-window">
            <div className="hero-digital-window-top">
              <span /><span /><span />
            </div>
            <div className="hero-digital-window-body">
              <div className="hero-digital-sidebar">
                <span /><span /><span /><span />
              </div>
              <div className="hero-digital-main">
                <div className="hero-digital-title" />
                <div className="hero-digital-grid">
                  <span /><span /><span /><span />
                </div>
              </div>
            </div>
          </div>
          <div className="hero-digital-card hero-digital-card-one">UI / UX</div>
          <div className="hero-digital-card hero-digital-card-two">Build</div>
          <div className="hero-digital-card hero-digital-card-three">Scale</div>
        </div>
      )}

      {panel.visual === "strategy" && (
        <div className="hero-visual-strategy">
          <div className="hero-strategy-axis" />
          <div className="hero-strategy-step hero-strategy-step-one"><span>01</span>Observer</div>
          <div className="hero-strategy-step hero-strategy-step-two"><span>02</span>Structurer</div>
          <div className="hero-strategy-step hero-strategy-step-three"><span>03</span>Accompagner</div>
          <div className="hero-strategy-step hero-strategy-step-four"><span>04</span>Faire évoluer</div>
        </div>
      )}

      {panel.visual === "approach" && (
        <div className="hero-visual-approach">
          <div className="hero-approach-circle hero-approach-circle-left"><span>Digital</span></div>
          <div className="hero-approach-circle hero-approach-circle-right"><span>Organisation</span></div>
          <div className="hero-approach-center"><span>Hopla</span></div>
          <div className="hero-approach-caption">Des expertises qui se complètent.</div>
        </div>
      )}
    </div>
  );
}

function HeroCta({ panel }: { panel: HeroPanel }) {
  const className = "hero-slider-cta";
  const content = (
    <>
      <span>{panel.cta.label}</span>
      <span aria-hidden="true">→</span>
    </>
  );

  if (panel.cta.external) {
    return (
      <a
        href={panel.cta.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={panel.cta.href} className={className}>
      {content}
    </Link>
  );
}

export default function HomeHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const visualRefs = useRef<Array<HTMLDivElement | null>>([]);
  const backgroundRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!rootRef.current || !ready) return;

    const ctx = gsap.context(() => {
      slideRefs.current.forEach((slide, index) => {
        if (!slide) return;
        gsap.set(slide, {
          autoAlpha: index === 0 ? 1 : 0,
          zIndex: index === 0 ? 2 : 1,
          pointerEvents: index === 0 ? "auto" : "none",
        });
      });

      contentRefs.current.forEach((content, index) => {
        if (!content) return;
        gsap.set(content, {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 26,
        });
      });

      visualRefs.current.forEach((visual, index) => {
        if (!visual) return;
        gsap.set(visual, {
          autoAlpha: index === 0 ? 1 : 0,
          xPercent: index === 0 ? 0 : 5,
          scale: index === 0 ? 1 : 1.03,
        });
      });

      backgroundRefs.current.forEach((background, index) => {
        if (!background) return;
        gsap.set(background, {
          scale: index === 0 ? 1.035 : 1.08,
          xPercent: index === 0 ? 0 : 2,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [ready]);

  const changePanel = useCallback((nextIndex: number) => {
    if (
      nextIndex < 0 ||
      nextIndex >= panels.length ||
      nextIndex === activeIndexRef.current ||
      isAnimatingRef.current
    ) {
      return;
    }

    const currentIndex = activeIndexRef.current;
    const currentSlide = slideRefs.current[currentIndex];
    const nextSlide = slideRefs.current[nextIndex];
    const currentContent = contentRefs.current[currentIndex];
    const nextContent = contentRefs.current[nextIndex];
    const currentVisual = visualRefs.current[currentIndex];
    const nextVisual = visualRefs.current[nextIndex];
    const nextBackground = backgroundRefs.current[nextIndex];

    if (!currentSlide || !nextSlide || !currentContent || !nextContent) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      gsap.set(currentSlide, {
        autoAlpha: 0,
        zIndex: 1,
        pointerEvents: "none",
      });
      gsap.set(nextSlide, {
        autoAlpha: 1,
        zIndex: 2,
        pointerEvents: "auto",
      });
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      return;
    }

    isAnimatingRef.current = true;

    gsap.set(nextSlide, {
      autoAlpha: 0,
      zIndex: 3,
      pointerEvents: "auto",
    });
    gsap.set(nextContent, { autoAlpha: 0, y: 34 });
    if (nextVisual) {
      gsap.set(nextVisual, { autoAlpha: 0, xPercent: 6, scale: 1.04 });
    }
    if (nextBackground) {
      gsap.set(nextBackground, { scale: 1.08, xPercent: 2 });
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(currentSlide, {
          autoAlpha: 0,
          zIndex: 1,
          pointerEvents: "none",
        });
        gsap.set(nextSlide, {
          autoAlpha: 1,
          zIndex: 2,
          pointerEvents: "auto",
        });

        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        isAnimatingRef.current = false;
      },
    });

    tl.to(
      currentContent,
      {
        autoAlpha: 0,
        y: -20,
        duration: 0.42,
      },
      0,
    );

    if (currentVisual) {
      tl.to(
        currentVisual,
        {
          autoAlpha: 0,
          xPercent: -3,
          scale: 0.985,
          duration: 0.48,
        },
        0,
      );
    }

    tl.to(
      nextSlide,
      {
        autoAlpha: 1,
        duration: 0.72,
      },
      0.12,
    );

    if (nextBackground) {
      tl.to(
        nextBackground,
        {
          scale: 1.035,
          xPercent: 0,
          duration: 1.35,
          ease: "power2.out",
        },
        0.12,
      );
    }

    tl.to(
      nextContent,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
      },
      0.34,
    );

    if (nextVisual) {
      tl.to(
        nextVisual,
        {
          autoAlpha: 1,
          xPercent: 0,
          scale: 1,
          duration: 0.9,
        },
        0.38,
      );
    }
  }, []);

  const goToPrevious = useCallback(() => {
    const current = activeIndexRef.current;
    changePanel(current === 0 ? panels.length - 1 : current - 1);
  }, [changePanel]);

  const goToNext = useCallback(() => {
    const current = activeIndexRef.current;
    changePanel(current === panels.length - 1 ? 0 : current + 1);
  }, [changePanel]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const distance = endX - startX;

    if (Math.abs(distance) < 52) return;
    if (distance < 0) goToNext();
    else goToPrevious();
  };

  const currentPanel = panels[activeIndex];

  return (
    <section
      ref={rootRef}
      aria-label="Présentation de Hopla Groupe"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="hero-slider"
      style={
        {
          "--hero-accent": currentPanel.accent,
          "--hero-accent-secondary": currentPanel.accentSecondary,
          "--hero-accent-soft": currentPanel.accentSoft,
        } as CSSProperties
      }
    >
      <div aria-hidden="true" className="hero-slider-grid" />

      <div className="hero-slider-stage">
        {panels.map((panel, index) => {
          const isActive = activeIndex === index;
          const isFirst = index === 0;

          return (
            <div
              key={panel.id}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              className={`hero-slider-slide hero-slider-slide--${panel.id}`}
              aria-hidden={!isActive}
              style={
                {
                  "--hero-accent": panel.accent,
                  "--hero-accent-secondary": panel.accentSecondary,
                  "--hero-accent-soft": panel.accentSoft,
                  backgroundColor: panel.background,
                } as CSSProperties
              }
            >
              {panel.backgroundImage && (
                <div
                  ref={(element) => {
                    backgroundRefs.current[index] = element;
                  }}
                  aria-hidden="true"
                  className="hero-slider-background"
                  style={{
                    backgroundImage: `url("${panel.backgroundImage}")`,
                    backgroundPosition:
                      panel.backgroundPosition ?? "center center",
                  }}
                />
              )}

              <div aria-hidden="true" className="hero-slider-shade" />
              <div aria-hidden="true" className="hero-slider-vignette" />
              <div aria-hidden="true" className="hero-slider-glow" />

              <div
                ref={(element) => {
                  visualRefs.current[index] = element;
                }}
                className="hero-slider-visual-layer"
              >
                <HeroVisualStage panel={panel} />
              </div>

              <div
                ref={(element) => {
                  contentRefs.current[index] = element;
                }}
                className="hero-slider-content"
              >
                <div className="container-hopla">
                  <div className="hero-slider-copy">
                    <div className="hero-slider-eyebrow">
                      <span>{panel.number}</span>
                      <span
                        aria-hidden="true"
                        className="hero-slider-eyebrow-line"
                      />
                      <span>{panel.eyebrow}</span>
                    </div>

                    {isFirst ? (
                      <h1
                        id="home-hero-title"
                        className="hero-slider-title"
                      >
                        {panel.title}
                      </h1>
                    ) : (
                      <h2 className="hero-slider-title">
                        {panel.title}
                      </h2>
                    )}

                    <p className="hero-slider-description">
                      {panel.description}
                    </p>

                    <div className="hero-slider-actions">
                      <HeroCta panel={panel} />
                    </div>

                    <div className="hero-slider-meta" aria-label="Domaines">
                      {panel.meta.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-slider-navigation">
        <div className="container-hopla">
          <div className="hero-slider-nav-inner">
            <div
              className="hero-slider-tabs"
              role="tablist"
              aria-label="Navigation des univers Hopla Groupe"
            >
              {panels.map((panel, index) => {
                const isActive = activeIndex === index;

                return (
                  <button
                    key={panel.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Afficher ${panel.label}`}
                    onClick={() => changePanel(index)}
                    className={`hero-slider-tab ${
                      isActive ? "is-active" : ""
                    }`}
                    style={
                      {
                        "--tab-accent": panel.accent,
                      } as CSSProperties
                    }
                  >
                    <span className="hero-slider-tab-number">
                      {panel.number}
                    </span>
                    <span className="hero-slider-tab-label">
                      {panel.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hero-slider-controls">
              <div
                className="hero-slider-counter"
                aria-live="polite"
                aria-atomic="true"
              >
                <span>{currentPanel.number}</span>
                <span aria-hidden="true">/</span>
                <span>{String(panels.length).padStart(2, "0")}</span>
              </div>

              <div className="hero-slider-progress" aria-hidden="true">
                <span
                  style={{
                    width: `${((activeIndex + 1) / panels.length) * 100}%`,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={goToPrevious}
                className="hero-slider-control"
                aria-label="Slide précédente"
              >
                <ArrowIcon direction="left" />
              </button>

              <button
                type="button"
                onClick={goToNext}
                className="hero-slider-control"
                aria-label="Slide suivante"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
