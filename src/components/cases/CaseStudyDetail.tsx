"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ProjectNavigation,
  PublishedProjectDetail,
  PublishedProjectImage,
} from "@/lib/projects";

type CaseStudyDetailProps = {
  project: PublishedProjectDetail;
  navigation: ProjectNavigation;
};

type ContentSectionProps = {
  number: string;
  title: string;
  content: string;
};

/* =========================================================
   HOOK REVEAL AU SCROLL
========================================================= */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(
              entry.target
            );
          }
        },
        {
          threshold: 0.18,
          rootMargin:
            "0px 0px -8% 0px",
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    isVisible,
  };
}

/* =========================================================
   CONTENU ÉDITORIAL
========================================================= */

function ContentSection({
  number,
  title,
  content,
}: ContentSectionProps) {
  const { ref, isVisible } =
    useReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="relative border-t border-[#081426]/10 py-16 md:py-20 lg:py-24"
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-0 top-[-1px] h-px bg-[#081426]/25 transition-[width] duration-[1100ms] ease-out",
          isVisible
            ? "w-full"
            : "w-0",
        ].join(" ")}
      />

      <div className="grid gap-8 lg:grid-cols-[120px_minmax(0,720px)] lg:gap-20">
        <div>
          <span
            className={[
              "inline-block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#081426]/30 transition-all duration-700 ease-out",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-20",
            ].join(" ")}
          >
            {number}
          </span>
        </div>

        <div>
          <h2
            className={[
              "text-2xl font-semibold tracking-[-0.035em] text-[#081426] transition-all duration-[800ms] ease-out md:text-[32px]",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-20",
            ].join(" ")}
          >
            {title}
          </h2>

          <p
            className={[
              "mt-6 max-w-[700px] whitespace-pre-line text-[16px] leading-[1.85] text-[#081426]/68 transition-all delay-100 duration-[900ms] ease-out md:text-[17px]",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-20",
            ].join(" ")}
          >
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   IMAGE DE COUVERTURE RESPONSIVE
========================================================= */

function ProjectCover({
  image,
  alt,
}: {
  image: string;
  alt: string;
}) {
  return (
    <div className="mx-auto mt-4 w-full max-w-[1440px] px-5 md:px-8 lg:px-12">
      <div className="h-[220px] w-full overflow-hidden rounded-[2px] bg-[#EAE7E1] md:h-[350px] lg:h-[480px]">
        <img
          src={image}
          alt={alt}
          className="block h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}


/* =========================================================
   GALERIE / CARROUSEL
========================================================= */

function ProjectGallery({
  images,
  projectTitle,
}: {
  images: PublishedProjectImage[];
  projectTitle: string;
}) {
  const [activeIndex, setActiveIndex] =
    useState(0);

  const touchStartX =
    useRef<number | null>(null);

  const { ref, isVisible } =
    useReveal<HTMLElement>();

  const totalImages = images.length;

  const previousImage =
    useCallback(() => {
      setActiveIndex((current) =>
        current === 0
          ? totalImages - 1
          : current - 1
      );
    }, [totalImages]);

  const nextImage =
    useCallback(() => {
      setActiveIndex((current) =>
        current ===
        totalImages - 1
          ? 0
          : current + 1
      );
    }, [totalImages]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "ArrowLeft"
      ) {
        previousImage();
      }

      if (
        event.key === "ArrowRight"
      ) {
        nextImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    nextImage,
    previousImage,
  ]);

  if (totalImages === 0) {
    return null;
  }

  const activeImage =
    images[activeIndex];

  const imageAlt =
    activeImage.altText?.trim() ||
    `${projectTitle} — réalisation Hopla Groupe`;

  const currentNumber = String(
    activeIndex + 1
  ).padStart(2, "0");

  const totalNumber = String(
    totalImages
  ).padStart(2, "0");

  const progress =
    ((activeIndex + 1) /
      totalImages) *
    100;

  function handleTouchStart(
    event: React.TouchEvent
  ) {
    touchStartX.current =
      event.touches[0].clientX;
  }

  function handleTouchEnd(
    event: React.TouchEvent
  ) {
    if (
      touchStartX.current === null
    ) {
      return;
    }

    const touchEndX =
      event.changedTouches[0]
        .clientX;

    const distance =
      touchStartX.current -
      touchEndX;

    if (distance > 50) {
      nextImage();
    }

    if (distance < -50) {
      previousImage();
    }

    touchStartX.current = null;
  }

  return (
    <section
      ref={ref}
      aria-label={`Galerie du projet ${projectTitle}`}
      className="border-t border-[#081426]/10 bg-[#F6F3EE] py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <div
          className={[
            "mb-10 transition-all duration-[900ms] ease-out md:mb-12",
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-20",
          ].join(" ")}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#081426]/40">
            Le projet en images
          </p>

          <h2 className="mt-6 max-w-[760px] text-3xl font-semibold tracking-[-0.04em] text-[#081426] md:text-4xl lg:text-[46px]">
            Une vision concrète du projet
          </h2>
        </div>

        <div
          className={[
            "relative overflow-hidden rounded-[3px] bg-[#EAE7E1] transition-all delay-100 duration-[1100ms] ease-out",
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-20",
          ].join(" ")}
          onTouchStart={
            handleTouchStart
          }
          onTouchEnd={handleTouchEnd}
        >
          <div className="aspect-[16/9] w-full md:aspect-[16/8.2]">
            <img
              key={activeImage.id}
              src={
                activeImage.imagePath
              }
              alt={imageAlt}
              draggable={false}
              className="h-full w-full animate-[galleryFade_.55s_ease-out] object-cover"
            />
          </div>
        </div>

        <div className="mt-8 grid items-center gap-6 md:grid-cols-[120px_1fr_auto] md:gap-10">
          <div className="flex items-baseline">
            <span className="text-lg font-medium tracking-[-0.03em] text-[#081426]">
              {currentNumber}
            </span>

            <span className="mx-2 text-[#081426]/25">
              /
            </span>

            <span className="text-sm text-[#081426]/40">
              {totalNumber}
            </span>
          </div>

          <div className="relative hidden h-px overflow-hidden bg-[#081426]/10 md:block">
            <span
              className="absolute inset-y-0 left-0 bg-[#081426] transition-[width] duration-500 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          {totalImages > 1 && (
            <div className="flex items-center gap-7">
              <button
                type="button"
                onClick={
                  previousImage
                }
                aria-label="Image précédente"
                className="group flex h-11 w-11 items-center justify-center text-[#081426] transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[30px] font-light leading-none transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Image suivante"
                className="group flex h-11 w-11 items-center justify-center text-[#081426] transition-opacity duration-300 hover:opacity-50"
              >
                <span className="text-[30px] font-light leading-none transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          )}
        </div>

        {totalImages > 1 && (
          <div className="relative mt-6 h-px overflow-hidden bg-[#081426]/10 md:hidden">
            <span
              className="absolute inset-y-0 left-0 bg-[#081426] transition-[width] duration-500 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {activeImage.caption && (
          <div className="mt-8 flex max-w-[760px] items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-[11px] h-px w-8 shrink-0 bg-[#081426]/35"
            />

            <p className="text-[13px] italic leading-6 text-[#081426]/50 md:text-sm">
              {
                activeImage.caption
              }
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes galleryFade {
          from {
            opacity: 0.3;
            transform: scale(
              1.012
            );
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CaseStudyDetail({
  project,
  navigation,
}: CaseStudyDetailProps) {
  const categoriesLabel =
    project.categories
      .map(
        (category) =>
          category.name
      )
      .join(" · ");

  let sectionNumber = 1;

  function nextNumber() {
    const value = String(
      sectionNumber
    ).padStart(2, "0");

    sectionNumber += 1;

    return value;
  }

  return (
    <main className="bg-[#F6F3EE] text-[#081426]">
      {/* HERO */}

      <section className="pt-32 md:pt-40 lg:pt-48">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
          <div className="max-w-[1050px]">
            <div className="animate-[heroReveal_.7s_ease-out_both]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#081426]/45">
                <span>
                  {
                    project.domain
                      .name
                  }
                </span>

                {categoriesLabel && (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-[#081426]/25"
                    />

                    <span>
                      {
                        categoriesLabel
                      }
                    </span>
                  </>
                )}
              </div>
            </div>

            <h1 className="mt-8 max-w-[1050px] animate-[heroReveal_.85s_.08s_ease-out_both] text-[clamp(2.75rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.055em] text-[#081426]">
              {project.title}
            </h1>

            {project.introduction && (
              <p className="mt-6 max-w-[760px] animate-[heroReveal_.9s_.16s_ease-out_both] text-lg leading-[1.65] text-[#081426]/65 md:text-xl">
                {
                  project.introduction
                }
              </p>
            )}
          </div>

          {/* MÉTADONNÉES */}

          <div className="mt-14 grid animate-[heroReveal_.9s_.24s_ease-out_both] gap-8 border-t border-[#081426]/10 py-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {project.client && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Client
                </p>

                <p className="mt-3 text-sm font-medium text-[#081426]">
                  {project.client}
                </p>
              </div>
            )}

            {project.projectYear && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Année
                </p>

                <p className="mt-3 text-sm font-medium text-[#081426]">
                  {
                    project.projectYear
                  }
                </p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                Domaine
              </p>

              <p className="mt-3 text-sm font-medium text-[#081426]">
                {
                  project.domain.name
                }
              </p>
            </div>

            {categoriesLabel && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Expertise
                </p>

                <p className="mt-3 text-sm font-medium leading-6 text-[#081426]">
                  {
                    categoriesLabel
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COVER */}

        {project.coverImage && (
          <ProjectCover
            image={
              project.coverImage
            }
            alt={
              project.coverImageAlt?.trim() ||
              project.title
            }
          />
        )}
      </section>

      {/* CONTENU */}

      <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8 lg:px-12 lg:py-16">
        {project.context && (
          <ContentSection
            number={nextNumber()}
            title="Contexte"
            content={
              project.context
            }
          />
        )}

        {project.mission && (
          <ContentSection
            number={nextNumber()}
            title="Mission"
            content={
              project.mission
            }
          />
        )}

        {project.objectives && (
          <ContentSection
            number={nextNumber()}
            title="Objectifs"
            content={
              project.objectives
            }
          />
        )}

        {project.solution && (
          <ContentSection
            number={nextNumber()}
            title="Solution"
            content={
              project.solution
            }
          />
        )}

        {project.results && (
          <ContentSection
            number={nextNumber()}
            title="Résultats"
            content={
              project.results
            }
          />
        )}
      </div>

      {/* GALERIE */}

      <ProjectGallery
        images={project.images}
        projectTitle={
          project.title
        }
      />

      {/* CTA PROJET */}

      {project.externalUrl && (
        <section className="bg-[#081426] py-20 text-white md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Découvrir le projet
                </p>

                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.045em] text-white md:text-5xl">
                  Voir le projet en ligne
                </h2>
              </div>

              <a
                href={
                  project.externalUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center self-start rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-[#081426] lg:self-auto"
              >
                Visiter le site

                <span
                  aria-hidden="true"
                  className="ml-3"
                >
                  ↗
                </span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* CTA CONTACT */}

      <section className="bg-[#081426] text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-24 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-[760px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Votre projet
              </p>

              <h2 className="mt-6 text-[clamp(2.25rem,4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                Un projet en tête ?
              </h2>

              <p className="mt-6 max-w-[620px] text-[16px] leading-7 text-white/60 md:text-[17px]">
                Parlons de vos ambitions
                et voyons comment les
                transformer en solutions
                concrètes.
              </p>
            </div>

            <Link
              href="/contact"
              className="group inline-flex min-h-12 items-center justify-center self-start rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#081426] lg:self-end"
            >
              Parlons de votre projet

              <span
                aria-hidden="true"
                className="ml-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* NAVIGATION ENTRE PROJETS */}

      <section className="border-t border-[#081426]/10 bg-[#F6F3EE]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
          <div className="grid min-h-[110px] grid-cols-2 items-center border-b border-[#081426]/10 md:min-h-[130px]">
            <div className="flex justify-start">
              {navigation.previous && (
                <Link
                  href={`/cas-etudes/${navigation.previous.slug}`}
                  className="group inline-flex items-center gap-3 text-[13px] font-semibold text-[#081426] md:text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  >
                    ←
                  </span>

                  <span>
                    Projet précédent
                  </span>
                </Link>
              )}
            </div>

            <div className="flex justify-end">
              {navigation.next && (
                <Link
                  href={`/cas-etudes/${navigation.next.slug}`}
                  className="group inline-flex items-center gap-3 text-[13px] font-semibold text-[#081426] md:text-sm"
                >
                  <span>
                    Projet suivant
                  </span>

                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* RETOUR ARCHIVE */}

          <div className="flex justify-center py-8 md:py-10">
            <Link
              href="/cas-etudes"
              className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#081426]/55 transition-colors duration-300 hover:text-[#081426]"
            >
              Tous les cas d&apos;études
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(
              18px
            );
          }

          to {
            opacity: 1;
            transform: translateY(
              0
            );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}