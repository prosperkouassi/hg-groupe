import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import ProjectForm from "@/components/admin/ProjectForm";

import { getAdminUserById } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import {
  getCaseCategories,
  getCaseDomains,
} from "@/lib/cases";
import { getAdminProjectById } from "@/lib/projects";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
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

  const { id } = await params;

  const projectId = Number(id);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    notFound();
  }

  const [project, domains, categories] =
    await Promise.all([
      getAdminProjectById(projectId),
      getCaseDomains(),
      getCaseCategories(),
    ]);

  if (!project) {
    notFound();
  }

  return (
    <AdminShell
      admin={{
        name: admin.name,
        email: admin.email,
      }}
    >
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-7 md:py-10 lg:px-10 xl:px-14">
          <header className="mb-10 border-b border-[#081426]/10 pb-8">
            <Link
              href="/admin/projets"
              className="text-xs font-semibold text-[#081426]/40 transition-colors hover:text-[#081426]"
            >
              ← Retour aux projets
            </Link>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#081426]/35">
                Modification
              </p>

              <h1 className="mt-3 text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-none tracking-[-0.05em]">
                {project.title}
              </h1>
            </div>
          </header>

          <ProjectForm
            domains={domains}
            categories={categories}
            initialData={{
              id: project.id,
              title: project.title,
              slug: project.slug,

              domainId: project.domain.id,

              categoryIds:
                project.categories.map(
                  (category) => category.id
                ),

              client: project.client,
              projectYear: project.projectYear,

              introduction:
                project.introduction ?? null,

              context:
                project.context ?? null,

              mission:
                project.mission ?? null,

              objectives:
                project.objectives ?? null,

              solution:
                project.solution ?? null,

              results:
                project.results ?? null,

              externalUrl:
                project.externalUrl ?? null,

              coverImage:
                project.coverImage,

              coverImageAlt:
                project.coverImageAlt ?? null,

              status:
                project.status,

              displayOrder:
                project.displayOrder,

              seoTitle:
                project.seoTitle ?? null,

              seoDescription:
                project.seoDescription ?? null,
            }}
          />
        </div>
      </main>
    </AdminShell>
  );
}