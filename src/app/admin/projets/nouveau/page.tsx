import Link from "next/link";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import ProjectForm from "@/components/admin/ProjectForm";

import { getAdminUserById } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import {
  getCaseCategories,
  getCaseDomains,
} from "@/lib/cases";

export default async function NewProjectPage() {
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

  const [domains, categories] =
    await Promise.all([
      getCaseDomains(),
      getCaseCategories(),
    ]);

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
                Cas d&apos;études
              </p>

              <h1 className="mt-3 text-[clamp(2.2rem,4vw,4rem)] font-semibold leading-none tracking-[-0.05em]">
                Nouveau projet
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#081426]/50">
                Ajoutez une nouvelle réalisation au
                portfolio Hopla Groupe.
              </p>
            </div>
          </header>

          <ProjectForm
            domains={domains}
            categories={categories}
          />
        </div>
      </main>
    </AdminShell>
  );
}