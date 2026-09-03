"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  domainId: number;
  name: string;
  slug: string;
};

type CasesArchiveProps = {
  domains: CaseDomain[];
  categories: CaseCategory[];
  projects: PublishedProject[];
};

export default function CasesArchive({
  domains,
  categories,
  projects,
}: CasesArchiveProps) {
  const [activeDomainId, setActiveDomainId] =
    useState<number | null>(null);

  const [activeCategoryId, setActiveCategoryId] =
    useState<number | null>(null);

  /* ======================================================
     CATÉGORIES DISPONIBLES
  ====================================================== */

  const visibleCategories = useMemo(() => {
    if (activeDomainId === null) {
      return [];
    }

    return categories.filter(
      (category) =>
        category.domainId === activeDomainId
    );
  }, [categories, activeDomainId]);

  /* ======================================================
     PROJETS FILTRÉS
  ====================================================== */

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesDomain =
        activeDomainId === null ||
        project.domainId === activeDomainId;

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

    /*
     * Quand on change de domaine,
     * on réinitialise automatiquement
     * la sous-catégorie.
     */
    setActiveCategoryId(null);
  }

  return (
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
                activeDomainId === domain.id;

              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() =>
                    selectDomain(domain.id)
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
                    setActiveCategoryId(null)
                  }
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-300",
                    activeCategoryId === null
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
                        key={category.id}
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
                        ].join(" ")}
                      >
                        {category.name}

                        <span
                          className={[
                            "ml-2 text-[10px]",
                            isActive
                              ? "text-white/50"
                              : "text-[#081426]/30",
                          ].join(" ")}
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
            PROJETS
        ================================================== */}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24 lg:gap-x-12 lg:gap-y-32">
            {filteredProjects.map(
              (project, index) => {
                const categoryLabel =
                  project.categories
                    .map(
                      (category) =>
                        category.name
                    )
                    .join(" · ");

                return (
                  <article
                    key={project.id}
                    className={[
                      "group",
                      index % 2 === 1
                        ? "md:translate-y-20"
                        : "",
                    ].join(" ")}
                  >
                    <Link
                      href={`/cas-etudes/${project.slug}`}
                      className="block"
                    >
                      {/* IMAGE */}

                      <div className="aspect-[4/3] overflow-hidden bg-[#E7E3DD]">
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
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#081426]/25">
                              Hopla Groupe
                            </span>
                          </div>
                        )}
                      </div>

                      {/* INFORMATIONS */}

                      <div className="pt-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/40">
                          <span>
                            {
                              project.domainName
                            }
                          </span>

                          {categoryLabel && (
                            <>
                              <span
                                aria-hidden="true"
                                className="h-1 w-1 rounded-full bg-[#081426]/20"
                              />

                              <span>
                                {categoryLabel}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#081426] md:text-3xl">
                              {project.title}
                            </h2>

                            {(project.client ||
                              project.projectYear) && (
                              <p className="mt-3 text-sm text-[#081426]/45">
                                {project.client}

                                {project.client &&
                                  project.projectYear &&
                                  " · "}

                                {
                                  project.projectYear
                                }
                              </p>
                            )}
                          </div>

                          <span
                            aria-hidden="true"
                            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#081426]/15 text-lg transition-all duration-300 group-hover:border-[#081426] group-hover:bg-[#081426] group-hover:text-white"
                          >
                            ↗
                          </span>
                        </div>

                        {project.introduction && (
                          <p className="mt-6 max-w-xl text-sm leading-7 text-[#081426]/60 md:text-[15px]">
                            {
                              project.introduction
                            }
                          </p>
                        )}
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
                Aucun cas d’étude dans cette
                sélection
              </h2>

              <p className="mt-6 text-base leading-7 text-[#081426]/60">
                Modifiez les filtres pour
                découvrir les autres projets
                accompagnés par Hopla Groupe.
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
  );
}