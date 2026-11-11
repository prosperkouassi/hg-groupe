import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAdminUserById } from '@/lib/admin';
export async function blogAdmin() { const session = await getAdminSession(); return session ? getAdminUserById(session.adminId) : null; }
export async function requireBlogAdmin() { const admin = await blogAdmin(); if (!admin) redirect('/admin/connexion'); return admin; }
export async function authorizeWrite(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  return !!(await blogAdmin());
}
