import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getAdminUserById } from '@/lib/admin';
import { checkWriteOrigin } from './write-origin';

export async function blogAdmin() {
  const session = await getAdminSession();
  return session ? getAdminUserById(session.adminId) : null;
}
export async function requireBlogAdmin() {
  const admin = await blogAdmin();
  if (!admin) redirect('/admin/connexion');
  return admin;
}
export async function blogWriteGuard(request: Request): Promise<Response | null> {
  const decision = checkWriteOrigin(request, process.env.BLOG_SITE_URL, process.env.NODE_ENV === 'production');
  if (!decision.allowed) {
    console.warn('Blog : écriture refusée', { reason: decision.reason });
    const message = decision.reason === 'invalid_configuration'
      ? 'Configuration BLOG_SITE_URL invalide. Utilisez l’adresse publique HTTPS du site dans Hostinger.'
      : 'Origine de la requête refusée. Vérifiez que BLOG_SITE_URL correspond à l’adresse publique du site.';
    return Response.json({ message }, { status: decision.reason === 'invalid_configuration' ? 503 : 403, headers: { 'Cache-Control': 'no-store' } });
  }
  // Origin approval never grants authentication: an active administrator is still mandatory.
  if (!await blogAdmin()) return Response.json({ message: 'Session administrateur expirée. Reconnectez-vous puis réessayez.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  return null;
}
export async function authorizeWrite(request: Request) {
  return await blogWriteGuard(request) === null;
}
