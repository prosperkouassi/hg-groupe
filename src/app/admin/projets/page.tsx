import Link from "next/link";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import ProjectActions from "@/components/admin/ProjectActions";

import { getAdminUserById } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import { getAdminProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/connexion");
  }

  const admin = await getAdminUserById(
    session.adminId
  );

  if (!admin) {
    redirect("/admin/connexion");
  }

  const projects = await getAdminProjects();

  const publishedProjects = projects.filter(
    (project) => project.status === "published"
  );

  const draftProjects = projects.filter(
    (project) => project.status === "draft"
  );

  const domainsCount = new Set(
    projects.map(
      (project) => project.domain.id
    )
  ).size;

  return (
    <AdminShell
      admin={{
        name: admin.name,
        email: admin.email,
      }}
    >
      <main className="min-h-screen bg-[#F7F4EF]">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-7 md:py-10 lg:px-10 xl:px-14">
          {/* HEADER */}

          <header className="flex flex-col gap-7 border-b border-[#081426]/10 pb-9 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#081426]/35">
                Cas d&apos;études
              </p>

              <h1 className="mt-2 text-[clamp(2.7rem,4.5vw,4.7rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-[#081426]">
                Projets
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#081426]/45">
                Gérez les réalisations publiées
                sur le site Hopla Groupe.
              </p>
            </div>

            <Link
              href="/admin/projets/nouveau"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#071529] px-7 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:bg-[#10213A] sm:self-auto"
              style={{
                color: "#FFFFFF",
              }}
            >
              <span
                className="text-[23px] font-light leading-none"
                style={{
                  color: "#FFFFFF",
                }}
              >
                +
              </span>

              <span
                style={{
                  color: "#FFFFFF",
                }}
              >
                Nouveau projet
              </span>
            </Link>
          </header>

          {/* STATISTIQUES */}

          <section className="py-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="min-h-[116px] rounded-[18px] border border-[#081426]/8 bg-white px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Total
                </p>

                <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#081426]">
                  {String(
                    projects.length
                  ).padStart(2, "0")}
                </p>
              </div>

              <div className="min-h-[116px] rounded-[18px] border border-[#081426]/8 bg-white px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Publiés
                </p>

                <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#081426]">
                  {String(
                    publishedProjects.length
                  ).padStart(2, "0")}
                </p>
              </div>

              <div className="min-h-[116px] rounded-[18px] border border-[#081426]/8 bg-white px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Brouillons
                </p>

                <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#081426]">
                  {String(
                    draftProjects.length
                  ).padStart(2, "0")}
                </p>
              </div>

              <div className="min-h-[116px] rounded-[18px] border border-[#081426]/8 bg-white px-6 py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#081426]/35">
                  Domaines utilisés
                </p>

                <p className="mt-4 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#081426]">
                  {String(
                    domainsCount
                  ).padStart(2, "0")}
                </p>
              </div>
            </div>
          </section>

          {/* LISTE */}

          {projects.length === 0 ? (
            <section className="overflow-hidden rounded-[26px] border border-[#081426]/8 bg-white">
              <div className="flex min-h-[420px] items-center justify-center px-6 py-16 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#081426]/5">
                    <span className="text-2xl text-[#081426]/35">
                      +
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-[#081426]">
                    Aucun projet pour le moment
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#081426]/45">
                    Créez votre premier cas
                    d&apos;étude. Il pourra être
                    enregistré en brouillon avant sa
                    publication.
                  </p>

                  <Link
                    href="/admin/projets/nouveau"
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#071529] px-6 text-sm font-semibold transition-all duration-300 hover:bg-[#10213A]"
                    style={{
                      color: "#FFFFFF",
                    }}
                  >
                    Créer le premier projet
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-[26px] border border-[#081426]/8 bg-white">
              <div className="border-b border-[#081426]/8 px-7 py-6">
                <h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#081426]">
                  Tous les projets
                </h2>

                <p className="mt-1 text-xs text-[#081426]/35">
                  {projects.length}{" "}
                  {projects.length > 1
                    ? "projets"
                    : "projet"}
                </p>
              </div>

              <div className="divide-y divide-[#081426]/8">
                {projects.map(
                  (project) => (
                    <article
                      key={project.id}
                      className="group grid gap-5 px-6 py-5 transition-colors duration-300 hover:bg-[#081426]/[0.018] md:grid-cols-[72px_minmax(0,1fr)_160px_90px_minmax(320px,auto)] md:items-center md:px-7"
                    >
                      {/* IMAGE */}

                      <div className="h-[72px] w-[72px] overflow-hidden rounded-[13px] bg-[#F2F0EC]">
                        {project.coverImage ? (
                          <img
                            src={
                              project.coverImage
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[#081426]/20">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect
                                x="4"
                                y="5"
                                width="16"
                                height="14"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />

                              <path
                                d="M7 16l3.5-3.5 2.5 2 2-2 2 2"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              <circle
                                cx="9"
                                cy="9"
                                r="1"
                                fill="currentColor"
                              />
                            </svg>

                            <span className="text-[8px] font-semibold uppercase tracking-[0.13em]">
                              Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* INFOS */}

                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-semibold tracking-[-0.025em] text-[#081426]">
                          {project.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.09em]",
                              project.status ===
                              "published"
                                ? "bg-[#2A7853]/10 text-[#2A7853]"
                                : "bg-[#081426]/6 text-[#081426]/40",
                            ].join(" ")}
                          >
                            {project.status ===
                            "published"
                              ? "Publié"
                              : "Brouillon"}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-xs text-[#081426]/40">
                          {project.client
                            ? `${project.client} · `
                            : ""}

                          {project.categories
                            .length > 0
                            ? project.categories
                                .map(
                                  (
                                    category
                                  ) =>
                                    category.name
                                )
                                .join(", ")
                            : project.domain
                                .name}
                        </p>
                      </div>

                      {/* DOMAINE */}

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#081426]/30">
                          Domaine
                        </p>

                        <p className="mt-1.5 text-xs font-medium text-[#081426]/65">
                          {
                            project.domain
                              .name
                          }
                        </p>
                      </div>

                      {/* ANNÉE */}

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#081426]/30">
                          Année
                        </p>

                        <p className="mt-1.5 text-xs font-medium text-[#081426]/65">
                          {project.projectYear ||
                            "—"}
                        </p>
                      </div>

                      {/* ACTIONS */}

                      <ProjectActions
                        projectId={
                          project.id
                        }
                        projectTitle={
                          project.title
                        }
                        projectSlug={
                          project.slug
                        }
                        status={
                          project.status
                        }
                      />
                    </article>
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </AdminShell>
  );
}