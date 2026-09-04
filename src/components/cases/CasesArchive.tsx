"use client";

import Link from "next/link";
import {
  MouseEvent,
  useMemo,
  useState,
} from "react";

import type {
  PublishedProject,
} from "@/lib/projects";

type CaseDomain = {
  id: number;
  name: string;
  slug: string;
};

type CaseCategory = {
  id: number;
  domain_id: number;
  name: string;
  slug: string;
};

type CasesArchiveProps = {
  domains: CaseDomain[];
  categories: CaseCategory[];
  projects: PublishedProject[];
};

type CursorState = {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  category: string;
};

/* ======================================================
   MOTIF CLASSIC METRO
====================================================== */

const metroPattern = [
  "lg:col-span-4",
  "lg:col-span-8",

  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",

  "lg:col-span-8",
  "lg:col-span-4",
];

export default function CasesArchive({
  domains,
  categories,
  projects,
}: CasesArchiveProps) {
  const [activeDomainId, setActiveDomainId] =
    useState<number | null>(null);

  const [
    activeCategoryId,
    setActiveCategoryId,
  ] = useState<number | null>(null);

  const [cursor, setCursor] =
    useState<CursorState>({
      visible: false,
      x: 0,
      y: 0,
      title: "",
      category: "",
    });

  /* ======================================================
     CATÉGORIES DISPONIBLES
  ====================================================== */

  const visibleCategories = useMemo(() => {
    if (activeDomainId === null) {
      return [];
    }

    return categories.filter(
      (category) =>
        category.domain_id ===
        activeDomainId
    );
  }, [categories, activeDomainId]);

  /* ======================================================
     PROJETS FILTRÉS
  ====================================================== */

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesDomain =
        activeDomainId === null ||
        project.domainId ===
          activeDomainId;

      const matchesCategory =
        activeCategoryId === null ||
        project.categoryIds.includes(
          activeCategoryId
        );

      return (
        matchesDomain &&
        matchesCategory
      );
    });
  }, [
    projects,
    activeDomainId,
    activeCategoryId,
  ]);

  /* ======================================================
     CHANGEMENT DE DOMAINE
  ====================================================== */

  function selectDomain(
    domainId: number | null
  ) {
    setActiveDomainId(domainId);
    setActiveCategoryId(null);
  }

  /* ======================================================
     CAPTION CURSOR
  ====================================================== */

  function handleCursorEnter(
    event: MouseEvent<HTMLElement>,
    project: PublishedProject
  ) {
    if (
      window.matchMedia(
        "(pointer: coarse)"
      ).matches
    ) {
      return;
    }

    const categoryLabel =
      project.categories
        .map(
          (category) =>
            category.name
        )
        .join(" · ");

    setCursor({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: project.title,
      category:
        categoryLabel ||
        project.domainName,
    });
  }

  function handleCursorMove(
    event: MouseEvent<HTMLElement>
  ) {
    setCursor((previous) => {
      if (!previous.visible) {
        return previous;
      }

      return {
        ...previous,
        x: event.clientX,
        y: event.clientY,
      };
    });
  }

  function handleCursorLeave() {
    setCursor((previous) => ({
      ...previous,
      visible: false,
    }));
  }

  return (
    <>
      <section className="bg-[#F6F3EE] px-5 pb-28 pt-12 text-[#081426] md:px-8 md:pb-36 md:pt-16 lg:px-12 lg:pb-44">
        <div className="mx-auto max-w-[1440px]">

          {/* ==================================================
              FILTRES PRINCIPAUX
          ================================================== */}

          <div className="border-b border-[#081426]/10 pb-6">
            <div className="flex flex-wrap gap-x-8 gap-y-4">

              <button
                type="button"
                onClick={() =>
                  selectDomain(null)
                }
                className={[
                  "relative pb-2 text-sm font-semibold transition-colors duration-300",
                  activeDomainId === null
                    ? "text-[#081426]"
                    : "text-[#081426]/40 hover:text-[#081426]",
                ].join(" ")}
              >
                Tous

                <span className="ml-2 text-[10px] font-medium text-[#081426]/35">
                  {projects.length}
                </span>

                {activeDomainId === null && (
                  <span className="absolute bottom-0 left-0 h-px w-full bg-[#081426]" />
                )}
              </button>

              {domains.map((domain) => {
                const count =
                  projects.filter(
                    (project) =>
                      project.domainId ===
                      domain.id
                  ).length;

                const isActive =
                  activeDomainId ===
                  domain.id;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() =>
                      selectDomain(
                        domain.id
                      )
                    }
                    className={[
                      "relative pb-2 text-sm font-semibold transition-colors duration-300",
                      isActive
                        ? "text-[#081426]"
                        : "text-[#081426]/40 hover:text-[#081426]",
                    ].join(" ")}
                  >
                    {domain.name}

                    <span className="ml-2 text-[10px] font-medium text-[#081426]/35">
                      {count}
                    </span>

                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-px w-full bg-[#081426]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================================================
              SOUS-CATÉGORIES
          ================================================== */}

          {activeDomainId !== null &&
            visibleCategories.length > 0 && (
              <div className="border-b border-[#081426]/10 py-5">
                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setActiveCategoryId(
                        null
                      )
                    }
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300",
                      activeCategoryId ===
                      null
                        ? "border-[#081426] bg-[#081426] text-white"
                        : "border-[#081426]/15 text-[#081426]/55 hover:border-[#081426]/35 hover:text-[#081426]",
                    ].join(" ")}
                  >
                    Tout
                  </button>

                  {visibleCategories.map(
                    (category) => {
                      const isActive =
                        activeCategoryId ===
                        category.id;

                      const count =
                        projects.filter(
                          (project) =>
                            project.domainId ===
                              activeDomainId &&
                            project.categoryIds.includes(
                              category.id
                            )
                        ).length;

                      return (
                        <button
                          key={
                            category.id
                          }
                          type="button"
                          onClick={() =>
                            setActiveCategoryId(
                              category.id
                            )
                          }
                          className={[
                            "rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300",
                            isActive
                              ? "border-[#081426] bg-[#081426] text-white"
                              : "border-[#081426]/15 text-[#081426]/55 hover:border-[#081426]/35 hover:text-[#081426]",
                          ].join(
                            " "
                          )}
                        >
                          {
                            category.name
                          }

                          <span
                            className={[
                              "ml-2 text-[10px]",
                              isActive
                                ? "text-white/50"
                                : "text-[#081426]/30",
                            ].join(
                              " "
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* ==================================================
              COMPTEUR
          ================================================== */}

          <div className="flex items-center justify-between py-10 md:py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
              {filteredProjects.length}{" "}
              {filteredProjects.length > 1
                ? "projets"
                : "projet"}
            </p>
          </div>

          {/* ==================================================
              GRILLE CLASSIC METRO
          ================================================== */}

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-12 md:grid-cols-2 md:gap-x-6 md:gap-y-14 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-16">

              {filteredProjects.map(
                (project, index) => {
                  const categoryLabel =
                    project.categories
                      .map(
                        (category) =>
                          category.name
                      )
                      .join(", ");

                  const patternIndex =
                    index %
                    metroPattern.length;

                  const metroClass =
                    metroPattern[
                      patternIndex
                    ];

                  const imageRatio =
                    patternIndex === 1 ||
                    patternIndex === 5
                      ? "aspect-[2/1]"
                      : "aspect-[1/1]";

                  return (
                    <article
                      key={project.id}
                      className={[
                        "group min-w-0 md:col-span-1",
                        metroClass,
                      ].join(" ")}
                    >
                      <Link
                        href={`/cas-etudes/${project.slug}`}
                        className="block"
                      >

                        {/* =========================
                            IMAGE
                        ========================= */}

                        <div
                          onMouseEnter={(
                            event
                          ) =>
                            handleCursorEnter(
                              event,
                              project
                            )
                          }
                          onMouseMove={
                            handleCursorMove
                          }
                          onMouseLeave={
                            handleCursorLeave
                          }
                          className="relative overflow-hidden rounded-[9px] bg-[#E7E3DD] md:cursor-none"
                        >
                          <div
                            className={[
                              "relative overflow-hidden",
                              imageRatio,
                            ].join(" ")}
                          >
                            {project.coverImage ? (
                              <img
                                src={
                                  project.coverImage
                                }
                                alt={
                                  project.coverImageAlt?.trim() ||
                                  project.title
                                }
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/25">
                                  Hopla Groupe
                                </span>
                              </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-[#081426]/0 transition-colors duration-500 group-hover:bg-[#081426]/[0.025]" />
                          </div>
                        </div>

                        {/* =========================
                            INFOS
                        ========================= */}

                        <div className="pt-4">

                          <h2 className="text-[15px] font-semibold leading-[1.3] tracking-[-0.025em] text-[#081426] md:text-[16px]">
                            {
                              project.title
                            }
                          </h2>

                          <p className="mt-1.5 text-[11px] leading-5 text-[#081426]/50">
                            {categoryLabel ||
                              project.domainName}
                          </p>
                        </div>
                      </Link>
                    </article>
                  );
                }
              )}
            </div>
          ) : (

            /* ==================================================
                ÉTAT VIDE
            ================================================== */

            <div className="border-t border-[#081426]/10 py-20 md:py-28">
              <div className="max-w-xl">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/35">
                  Aucun projet
                </p>

                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#081426] md:text-4xl">
                  Aucun cas d’étude
                  dans cette sélection
                </h2>

                <p className="mt-6 text-base leading-7 text-[#081426]/60">
                  Modifiez les filtres
                  pour découvrir les
                  autres projets
                  accompagnés par
                  Hopla Groupe.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    selectDomain(null)
                  }
                  className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full border border-[#081426]/20 px-5 text-sm font-semibold text-[#081426] transition-colors hover:bg-[#081426] hover:text-white"
                >
                  Voir tous les projets
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CAPTION CURSOR
      ====================================================== */}

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block",
          "will-change-transform",
          cursor.visible
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
        style={{
          transform: `translate3d(
            ${cursor.x + 18}px,
            ${cursor.y + 18}px,
            0
          )`,
          transition:
            "opacity 160ms ease",
        }}
      >
        <div className="min-w-[150px] max-w-[230px] rounded-[9px] bg-[#081426] px-4 py-3 text-white shadow-[0_14px_40px_rgba(8,20,38,0.18)]">

          <p className="text-[13px] font-semibold leading-[1.3] tracking-[-0.025em]">
            {cursor.title}
          </p>

          {cursor.category && (
            <p className="mt-1.5 text-[9px] font-medium uppercase leading-[1.5] tracking-[0.14em] text-white/55">
              {cursor.category}
            </p>
          )}
        </div>
      </div>
    </>
  );
}