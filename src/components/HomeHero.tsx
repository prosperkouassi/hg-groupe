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
  tabBackground: string;

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
        <span className="hero-accordion-title-line">
          Accompagner
          <span className="text-[#FF7A58]">.</span>
        </span>

        <span className="hero-accordion-title-line">
          Développer
          <span className="text-[#F2295B]">.</span>
        </span>

        <span className="hero-accordion-title-line">
          Engager
          <span className="text-[#74E8A0]">.</span>
        </span>
      </>
    ),

    description:
      "Deux expertises complémentaires pour structurer, transformer et faire avancer vos ambitions.",

    accent: "#FF7A58",
    accentSecondary: "#993578",
    accentSoft: "rgba(255,122,88,0.22)",

    background: "#081426",
    tabBackground: "#0A192B",

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
        <span className="block text-white/35">
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
    tabBackground: "#17121F",

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
        <span className="block text-white/35">
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
    tabBackground: "#0C1C18",

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
        <span className="block text-white/35">
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
    tabBackground: "#151321",

    visual: "approach",

    meta: ["Observer", "Structurer", "Faire évoluer"],

    cta: {
      label: "Découvrir notre approche",
      href: "/a-propos",
    },
  },
];

const TAB_WIDTH = 88;
const MOBILE_BREAKPOINT = 768;
const INACTIVE_TAB_BACKGROUND = "#FFFFFF";

function HeroVisualStage({ panel }: { panel: HeroPanel }) {
  return (
    <div
      aria-hidden="true"
      className="
        hero-visual
        pointer-events-none
        absolute
        inset-y-0
        right-0
        hidden
        w-[46%]
        overflow-hidden
        lg:block
      "
    >
      <div className="hero-visual-depth" />

      <div className="hero-visual-orbit hero-visual-orbit-one" />
      <div className="hero-visual-orbit hero-visual-orbit-two" />

      {panel.visual === "hopla" && (
        <div className="hero-visual-hopla">
          <div className="hero-hopla-core">
            <span>HG</span>
          </div>

          <div className="hero-hopla-node hero-hopla-node-one">
            Digital
          </div>

          <div className="hero-hopla-node hero-hopla-node-two">
            Organisation
          </div>

          <div className="hero-hopla-node hero-hopla-node-three">
            Développement
          </div>

          <span className="hero-hopla-line hero-hopla-line-one" />
          <span className="hero-hopla-line hero-hopla-line-two" />
          <span className="hero-hopla-line hero-hopla-line-three" />
        </div>
      )}

      {panel.visual === "digital" && (
        <div className="hero-visual-digital">
          <div className="hero-digital-window">
            <div className="hero-digital-window-top">
              <span />
              <span />
              <span />
            </div>

            <div className="hero-digital-window-body">
              <div className="hero-digital-sidebar">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="hero-digital-main">
                <div className="hero-digital-title" />

                <div className="hero-digital-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>

          <div className="hero-digital-card hero-digital-card-one">
            UI / UX
          </div>

          <div className="hero-digital-card hero-digital-card-two">
            Build
          </div>

          <div className="hero-digital-card hero-digital-card-three">
            Scale
          </div>
        </div>
      )}

      {panel.visual === "strategy" && (
        <div className="hero-visual-strategy">
          <div className="hero-strategy-axis" />

          <div className="hero-strategy-step hero-strategy-step-one">
            <span>01</span>
            Observer
          </div>

          <div className="hero-strategy-step hero-strategy-step-two">
            <span>02</span>
            Structurer
          </div>

          <div className="hero-strategy-step hero-strategy-step-three">
            <span>03</span>
            Accompagner
          </div>

          <div className="hero-strategy-step hero-strategy-step-four">
            <span>04</span>
            Faire évoluer
          </div>
        </div>
      )}

      {panel.visual === "approach" && (
        <div className="hero-visual-approach">
          <div className="hero-approach-circle hero-approach-circle-left">
            <span>Digital</span>
          </div>

          <div className="hero-approach-circle hero-approach-circle-right">
            <span>Organisation</span>
          </div>

          <div className="hero-approach-center">
            <span>Hopla</span>
          </div>

          <div className="hero-approach-caption">
            Des expertises qui se complètent.
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeHero() {
  const rootRef = useRef<HTMLElement | null>(null);

  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  const visualRefs = useRef<Array<HTMLDivElement | null>>([]);

  const mobileContentRef = useRef<HTMLDivElement | null>(null);

  const touchStartXRef = useRef<number | null>(null);

  const activeIndexRef = useRef(0);

  const isAnimatingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  const [responsiveReady, setResponsiveReady] = useState(false);

  /*
   * =========================================================
   * RESPONSIVE
   * =========================================================
   */

  useEffect(() => {
    const media = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    const updateViewport = () => {
      setIsMobile(media.matches);
      setResponsiveReady(true);
    };

    updateViewport();

    media.addEventListener("change", updateViewport);

    return () => {
      media.removeEventListener("change", updateViewport);
    };
  }, []);

  /*
   * =========================================================
   * INITIALISATION DESKTOP
   * =========================================================
   */

  useLayoutEffect(() => {
    if (!rootRef.current || !responsiveReady || isMobile) {
      return;
    }

    const context = gsap.context(() => {
      panelRefs.current.forEach((panel, index) => {
        if (!panel) return;

        const data = panels[index];

        gsap.set(panel, {
          width:
            index === activeIndexRef.current
              ? `calc(100% - ${(panels.length - 1) * TAB_WIDTH}px)`
              : TAB_WIDTH,

          backgroundColor:
            index === activeIndexRef.current
              ? data.background
              : INACTIVE_TAB_BACKGROUND,
        });
      });

      contentRefs.current.forEach((content, index) => {
        if (!content) return;

        const isCurrent = index === activeIndexRef.current;

        gsap.set(content, {
          autoAlpha: isCurrent ? 1 : 0,
          x: isCurrent ? 0 : 32,
        });
      });

      visualRefs.current.forEach((visual, index) => {
        if (!visual) return;

        const isCurrent = index === activeIndexRef.current;

        gsap.set(visual, {
          autoAlpha: isCurrent ? 1 : 0,
          xPercent: isCurrent ? 0 : 8,
          scale: isCurrent ? 1 : 1.06,
        });
      });
    }, rootRef);

    return () => {
      context.revert();
    };
  }, [isMobile, responsiveReady]);

  /*
   * =========================================================
   * CHANGEMENT DE PANNEAU
   * =========================================================
   */

  const changePanel = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= panels.length) {
        return;
      }

      /*
       * MOBILE
       */

      if (isMobile) {
        if (
          nextIndex === activeIndexRef.current ||
          isAnimatingRef.current
        ) {
          return;
        }

        const previousIndex = activeIndexRef.current;
        const mobileContent = mobileContentRef.current;

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (!mobileContent || reducedMotion) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);

          return;
        }

        const direction =
          nextIndex > previousIndex ? 1 : -1;

        isAnimatingRef.current = true;

        gsap.to(mobileContent, {
          autoAlpha: 0,
          x: direction * -28,
          filter: "blur(7px)",
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);

            requestAnimationFrame(() => {
              gsap.fromTo(
                mobileContent,
                {
                  autoAlpha: 0,
                  x: direction * 34,
                  filter: "blur(7px)",
                },
                {
                  autoAlpha: 1,
                  x: 0,
                  filter: "blur(0px)",
                  duration: 0.62,
                  ease: "power3.out",
                  clearProps: "filter",
                  onComplete: () => {
                    isAnimatingRef.current = false;
                  },
                },
              );
            });
          },
        });

        return;
      }

      if (
        nextIndex === activeIndexRef.current ||
        isAnimatingRef.current
      ) {
        return;
      }

      const previousIndex = activeIndexRef.current;

      const previousPanel = panelRefs.current[previousIndex];
      const nextPanel = panelRefs.current[nextIndex];

      const previousContent = contentRefs.current[previousIndex];
      const nextContent = contentRefs.current[nextIndex];

      const previousVisual = visualRefs.current[previousIndex];
      const nextVisual = visualRefs.current[nextIndex];

      if (!previousPanel || !nextPanel) {
        return;
      }

      const nextData = panels[nextIndex];

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      /*
       * =====================================================
       * REDUCED MOTION
       * =====================================================
       */

      if (reducedMotion) {
        /*
         * Le panneau entrant reçoit son fond sombre AVANT
         * son ouverture.
         */
        gsap.set(nextPanel, {
          backgroundColor: nextData.background,
        });

        /*
         * Le panneau sortant se referme en conservant
         * son fond sombre.
         */
        gsap.set(previousPanel, {
          width: TAB_WIDTH,
        });

        /*
         * Il ne redevient blanc qu'une fois fermé.
         */
        gsap.set(previousPanel, {
          backgroundColor: INACTIVE_TAB_BACKGROUND,
        });

        gsap.set(nextPanel, {
          width: `calc(100% - ${(panels.length - 1) * TAB_WIDTH}px)`,
        });

        if (previousContent) {
          gsap.set(previousContent, {
            autoAlpha: 0,
          });
        }

        if (nextContent) {
          gsap.set(nextContent, {
            autoAlpha: 1,
            x: 0,
          });
        }

        if (previousVisual) {
          gsap.set(previousVisual, {
            autoAlpha: 0,
          });
        }

        if (nextVisual) {
          gsap.set(nextVisual, {
            autoAlpha: 1,
            xPercent: 0,
            scale: 1,
          });
        }

        activeIndexRef.current = nextIndex;

        setActiveIndex(nextIndex);

        return;
      }

      /*
       * =====================================================
       * TIMELINE
       * =====================================================
       */

      isAnimatingRef.current = true;

      /*
       * On met à jour la référence immédiatement pour que
       * les contrôles connaissent déjà le prochain panneau,
       * mais on retarde la mise à jour React de activeIndex
       * jusqu'à la fin de l'animation.
       *
       * Cela évite que la languette du panneau sortant
       * soit recréée alors que ce panneau est encore large.
       */
      activeIndexRef.current = nextIndex;

      /*
       * La languette cliquée est encore présente dans le DOM
       * tant que activeIndex n'a pas été mis à jour.
       *
       * On la masque immédiatement avant toute modification
       * de largeur afin qu'aucun fond blanc ne puisse
       * s'étendre avec le panneau entrant.
       */
      const nextTab =
        nextPanel.querySelector<HTMLElement>(".hero-accordion-tab");

      if (nextTab) {
        gsap.set(nextTab, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
      }

      /*
       * Le panneau entrant reçoit immédiatement son fond sombre
       * AVANT que sa largeur commence à augmenter.
       */
      gsap.set(nextPanel, {
        backgroundColor: nextData.background,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power4.inOut",
        },

        onComplete: () => {
          /*
           * Le changement React n'intervient qu'une fois
           * les deux panneaux arrivés à leur largeur finale.
           *
           * À ce moment seulement :
           * - le nouveau panneau devient officiellement actif ;
           * - la languette blanche de l'ancien panneau apparaît,
           *   alors qu'il mesure déjà 88 px.
           */
          setActiveIndex(nextIndex);
          isAnimatingRef.current = false;
        },
      });

      /*
       * 01 — CONTENU SORTANT
       */

      if (previousContent) {
        const previousElements =
          previousContent.querySelectorAll("[data-hero-reveal]");

        timeline.to(
          previousElements,
          {
            opacity: 0,
            y: -14,
            duration: 0.24,

            stagger: {
              each: 0.025,
              from: "end",
            },

            ease: "power2.in",
          },
          0,
        );

        timeline.to(
          previousContent,
          {
            autoAlpha: 0,
            x: -30,
            duration: 0.35,
            ease: "power2.in",
          },
          0.06,
        );
      }

      /*
       * 02 — VISUEL SORTANT
       */

      if (previousVisual) {
        timeline.to(
          previousVisual,
          {
            autoAlpha: 0,
            xPercent: -5,
            scale: 1.05,
            duration: 0.48,
            ease: "power3.inOut",
          },
          0,
        );
      }

      /*
       * 03 — RECONFIGURATION PHYSIQUE
       *
       * IMPORTANT :
       * aucune couleur n'est animée ici.
       *
       * - le panneau entrant est déjà sombre ;
       * - le panneau sortant reste sombre pendant
       *   toute sa fermeture.
       */

      timeline.to(
        previousPanel,
        {
          width: TAB_WIDTH,
          duration: 1.05,
        },
        0.1,
      );

      timeline.to(
        nextPanel,
        {
          width: `calc(100% - ${(panels.length - 1) * TAB_WIDTH}px)`,
          duration: 1.05,
        },
        0.1,
      );

      /*
       * 04 — LE PANNEAU SORTANT DEVIENT BLANC
       *
       * Cette opération intervient seulement lorsque
       * la fermeture est terminée :
       *
       * 0.1 + 1.05 = 1.15 s
       */

      timeline.set(
        previousPanel,
        {
          backgroundColor: INACTIVE_TAB_BACKGROUND,
        },
        1.15,
      );

      /*
       * 05 — HALO
       */

      const nextGlow = nextPanel.querySelector(
        ".hero-accordion-panel-glow",
      );

      if (nextGlow) {
        timeline.fromTo(
          nextGlow,
          {
            opacity: 0.2,
            scale: 0.74,
            xPercent: 14,
          },
          {
            opacity: 0.82,
            scale: 1,
            xPercent: 0,
            duration: 1.25,
            ease: "power3.out",
          },
          0.18,
        );
      }

      /*
       * 06 — VISUEL ENTRANT
       */

      if (nextVisual) {
        timeline.fromTo(
          nextVisual,
          {
            autoAlpha: 0,
            xPercent: 10,
            scale: 1.08,
          },
          {
            autoAlpha: 1,
            xPercent: 0,
            scale: 1,
            duration: 1.05,
            ease: "power3.out",
          },
          0.48,
        );
      }

      /*
       * 07 — CONTENU ENTRANT
       */

      if (nextContent) {
        const nextElements =
          nextContent.querySelectorAll("[data-hero-reveal]");

        gsap.set(nextElements, {
          opacity: 0,
          y: 28,
        });

        timeline.fromTo(
          nextContent,
          {
            autoAlpha: 0,
            x: 42,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.55,
            ease: "power3.out",
          },
          0.58,
        );

        timeline.to(
          nextElements,
          {
            opacity: 1,
            y: 0,
            duration: 0.62,

            stagger: {
              each: 0.065,
              from: "start",
            },

            ease: "power3.out",
          },
          0.66,
        );
      }
    },

    [isMobile],
  );

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const goToPrevious = useCallback(() => {
    const previousIndex =
      activeIndexRef.current === 0
        ? panels.length - 1
        : activeIndexRef.current - 1;

    changePanel(previousIndex);
  }, [changePanel]);

  const goToNext = useCallback(() => {
    const nextIndex =
      activeIndexRef.current === panels.length - 1
        ? 0
        : activeIndexRef.current + 1;

    changePanel(nextIndex);
  }, [changePanel]);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (startX === null || endX === undefined) {
      return;
    }

    const distance = endX - startX;

    if (Math.abs(distance) < 52) {
      return;
    }

    if (distance < 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  /*
   * =========================================================
   * CLAVIER
   * =========================================================
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  const currentPanel = panels[activeIndex];

  /*
   * =========================================================
   * PREMIER RENDU
   * =========================================================
   */

  if (!responsiveReady) {
    return (
      <section
        aria-labelledby="home-hero-title"
        className="
          relative
          flex
          min-h-[100svh]
          items-center
          overflow-hidden
          bg-[#081426]
          text-white
        "
      >
        <div className="container-hopla">
          <h1
            id="home-hero-title"
            className="
              max-w-4xl
              text-[clamp(2.8rem,5.3vw,5.2rem)]
              font-semibold
              leading-[1.02]
              tracking-[-0.04em]
            "
          >
            <span className="block">
              Accompagner
              <span className="text-[#FF7A58]">.</span>
            </span>

            <span className="block">
              Développer
              <span className="text-[#F2295B]">.</span>
            </span>

            <span className="block">
              Engager
              <span className="text-[#74E8A0]">.</span>
            </span>
          </h1>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * MOBILE
   * =========================================================
   */

  if (isMobile) {
    return (
      <section
        ref={rootRef}
        aria-labelledby="home-hero-title"
        className="
          hero-accordion
          relative
          min-h-[100svh]
          overflow-hidden
          bg-[#081426]
          text-white
        "
        style={
          {
            "--hero-accent": currentPanel.accent,
            "--hero-accent-secondary": currentPanel.accentSecondary,
            "--hero-accent-soft": currentPanel.accentSoft,
          } as CSSProperties
        }
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          <div className="hero-accordion-grid" />

          <div
            className="
              hero-accordion-halo
              hero-accordion-halo-warm
            "
          />

          <div
            className="
              hero-accordion-halo
              hero-accordion-halo-green
            "
          />
        </div>

        <div
          className="
            relative
            z-10
            flex
            min-h-[100svh]
            flex-col
          "
        >
          {/* NAVIGATION MOBILE */}

          <div
            role="tablist"
            aria-label="Navigation des univers Hopla Groupe"
            className="
              flex
              overflow-x-auto
              border-b
              border-white/10
              px-5
              pt-28
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {panels.map((panel, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={panel.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hero-mobile-panel-${panel.id}`}
                  onClick={() => changePanel(index)}
                  className={`
                    hero-mobile-tab
                    ${isActive ? "is-active" : ""}
                  `}
                >
                  {panel.number}

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-0
                        left-4
                        right-4
                        h-px
                      "
                      style={{
                        background: `linear-gradient(90deg, ${panel.accent}, ${panel.accentSecondary})`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* CONTENU */}

          <div
            ref={mobileContentRef}
            id={`hero-mobile-panel-${currentPanel.id}`}
            role="tabpanel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="
              hero-mobile-panel-content
              container-hopla
              flex
              flex-1
              touch-pan-y
              items-center
              py-12
            "
          >
            <div className="w-full">
              <div
                className="
                  mb-7
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  aria-hidden="true"
                  className="h-px w-7"
                  style={{
                    background: `linear-gradient(90deg, ${currentPanel.accent}, ${currentPanel.accentSecondary})`,
                  }}
                />

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-white/45
                  "
                >
                  {currentPanel.eyebrow}
                </p>
              </div>

              <h1
                id="home-hero-title"
                className="
                  max-w-[540px]
                  text-[clamp(2.45rem,11vw,4.2rem)]
                  font-semibold
                  leading-[1.02]
                  tracking-[-0.045em]
                "
              >
                {currentPanel.title}
              </h1>

              <p
                className="
                  hero-accordion-description
                  max-w-xl
                  text-[15px]
                  leading-[1.75]
                  text-white/55
                "
              >
                {currentPanel.description}
              </p>

              <div className="hero-accordion-actions">
                {currentPanel.cta.external ? (
                  <a
                    href={currentPanel.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-accordion-cta"
                  >
                    {currentPanel.cta.label}

                    <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link
                    href={currentPanel.cta.href}
                    className="hero-accordion-cta"
                  >
                    {currentPanel.cta.label}

                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>

              <div
                className="
                  hero-accordion-meta
                  flex
                  flex-wrap
                  gap-x-5
                  gap-y-3
                  border-t
                  border-white/10
                  pt-5
                "
              >
                {currentPanel.meta.map((item) => (
                  <span
                    key={item}
                    className="
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-white/30
                    "
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* NAV BAS */}

          <div
            className="
              container-hopla
              flex
              items-center
              justify-between
              pb-7
            "
          >
            <span
              className="
                text-[9px]
                font-semibold
                tracking-[0.18em]
                text-white/25
              "
            >
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(panels.length).padStart(2, "0")}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Panneau précédent"
                onClick={goToPrevious}
                className="hero-accordion-control"
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Panneau suivant"
                onClick={goToNext}
                className="hero-accordion-control"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * DESKTOP / TABLETTE
   * =========================================================
   */

  return (
    <section
      ref={rootRef}
      aria-labelledby="home-hero-title"
      onKeyDown={handleKeyDown}
      className="
        hero-accordion
        relative
        min-h-[100svh]
        overflow-hidden
        bg-[#081426]
        text-white
      "
    >
      {/* DÉCOR GLOBAL */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
        "
      >
        <div className="hero-accordion-grid" />
      </div>

      {/* PANNEAUX */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[100svh]
          w-full
        "
      >
        {panels.map((panel, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={panel.id}
              ref={(element) => {
                panelRefs.current[index] = element;
              }}
              className="
                hero-accordion-panel
                relative
                min-h-[100svh]
                flex-none
                overflow-hidden
                border-r
                border-white/10
              "
              style={
                {
                  "--hero-accent": panel.accent,
                  "--hero-accent-secondary": panel.accentSecondary,
                  "--hero-accent-soft": panel.accentSoft,

                  backgroundColor:
                    index === 0
                      ? panel.background
                      : INACTIVE_TAB_BACKGROUND,
                } as CSSProperties
              }
            >
              {/* HALO LOCAL */}

              <div
                aria-hidden="true"
                className="hero-accordion-panel-glow"
              />

              {/* VISUEL */}

              <div
                ref={(element) => {
                  visualRefs.current[index] = element;
                }}
                className="absolute inset-0"
              >
                <HeroVisualStage panel={panel} />
              </div>

              {/* CONTENU */}

              <div
                ref={(element) => {
                  contentRefs.current[index] = element;
                }}
                aria-hidden={!isActive}
                className="
                  hero-accordion-content
                  absolute
                  inset-0
                  flex
                  items-center
                "
              >
                <div
                  className="
                    container-hopla
                    relative
                    z-20
                    w-full
                    py-32
                    lg:py-36
                  "
                >
                  <div
                    className="
                      max-w-[720px]
                      xl:max-w-[790px]
                    "
                  >
                    {/* EYEBROW */}

                    <div
                      data-hero-reveal
                      className="
                        mb-7
                        flex
                        items-center
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-semibold
                          tracking-[0.22em]
                          text-white/40
                        "
                      >
                        {panel.number}
                      </span>

                      <span
                        aria-hidden="true"
                        className="
                          hero-accordion-accent-line
                          h-px
                          w-9
                        "
                      />

                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.24em]
                          text-white/45
                          lg:text-[11px]
                        "
                      >
                        {panel.eyebrow}
                      </p>
                    </div>

                    {/* TITRE */}

                    {index === 0 ? (
                      <h1
                        id="home-hero-title"
                        data-hero-reveal
                        className="
                          max-w-[820px]
                          text-[clamp(3.1rem,4.65vw,5.15rem)]
                          font-semibold
                          leading-[0.98]
                          tracking-[-0.05em]
                        "
                      >
                        {panel.title}
                      </h1>
                    ) : (
                      <h2
                        data-hero-reveal
                        className="
                          max-w-[790px]
                          text-[clamp(2.65rem,3.8vw,4.35rem)]
                          font-semibold
                          leading-[1.02]
                          tracking-[-0.045em]
                        "
                      >
                        {panel.title}
                      </h2>
                    )}

                    {/* DESCRIPTION */}

                    <p
                      data-hero-reveal
                      className="
                        hero-accordion-description
                        max-w-[600px]
                        text-[clamp(1rem,1.1vw,1.14rem)]
                        leading-[1.75]
                        text-white/58
                      "
                    >
                      {panel.description}
                    </p>

                    {/* CTA */}

                    <div
                      data-hero-reveal
                      className="hero-accordion-actions"
                    >
                      {panel.cta.external ? (
                        <a
                          href={panel.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            hero-accordion-cta
                            group
                          "
                        >
                          <span>{panel.cta.label}</span>

                          <span
                            aria-hidden="true"
                            className="
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                              group-hover:-translate-y-1
                            "
                          >
                            ↗
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={panel.cta.href}
                          className="
                            hero-accordion-cta
                            group
                          "
                        >
                          <span>{panel.cta.label}</span>

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
                      )}
                    </div>

                    {/* META */}

                    <div
                      data-hero-reveal
                      className="
                        hero-accordion-meta
                        flex
                        flex-wrap
                        gap-x-7
                        gap-y-3
                        border-t
                        border-white/10
                        pt-6
                      "
                    >
                      {panel.meta.map((item) => (
                        <span
                          key={item}
                          className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-white/32
                          "
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LANGUETTE */}

              {!isActive && (
                <button
                  type="button"
                  aria-label={`Découvrir ${panel.label}`}
                  onClick={() => changePanel(index)}
                  className="
                    hero-accordion-tab
                    group
                    absolute
                    inset-0
                    z-30
                    flex
                    cursor-pointer
                    flex-col
                    items-center
                    justify-between
                    overflow-hidden
                    py-7
                  "
                >
                  <span
                    className="
                      relative
                      z-10
                      hero-accordion-tab-number
                      text-[9px]
                      font-semibold
                      tracking-[0.2em]
                    "
                  >
                    {panel.number}
                  </span>

                  <span
                    className="
                      hero-accordion-tab-label
                      relative
                      z-10
                    "
                  >
                    {panel.label}
                  </span>

                  <span
                    className="
                      hero-accordion-tab-dot-shell
                      relative
                      z-10
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      border
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="hero-accordion-tab-dot"
                    />
                  </span>

                  <span
                    aria-hidden="true"
                    className="hero-accordion-tab-hover-line"
                  />
                </button>
              )}
            </div>
          );
        })}

        {/* CONTRÔLES */}

        <div
          className="
            absolute
            bottom-8
            right-8
            z-40
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            aria-label="Panneau précédent"
            onClick={goToPrevious}
            className="hero-accordion-control"
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Panneau suivant"
            onClick={goToNext}
            className="hero-accordion-control"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}