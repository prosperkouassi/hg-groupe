import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import PartnerManager from '@/components/admin/PartnerManager';
import { getAdminSession } from '@/lib/auth';
import { getAdminUserById } from '@/lib/admin';
import { getPartners } from '@/lib/partners';

export default async function PartnersPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/connexion');
  const admin = await getAdminUserById(session.adminId);
  if (!admin) redirect('/admin/connexion');
  const partners = await getPartners();
  return <AdminShell admin={{ name: admin.name, email: admin.email }}>
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="text-4xl font-semibold tracking-tight">Partenaires</h1>
      <p className="mt-4 mb-8 text-sm text-slate-600">Gérez les logos de la section « Ils nous font confiance ». Seuls les partenaires publiés apparaissent sur le site.</p>
      <PartnerManager partners={partners} />
    </main>
  </AdminShell>;
}
