import { getAdminSession } from '@/lib/auth';
import { getAdminUserById } from '@/lib/admin';

export async function authorizePartnerAdmin(request: Request) {
  // Reject cross-origin writes in addition to the existing SameSite session cookie.
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return false;
  const session = await getAdminSession();
  return !!session && !!(await getAdminUserById(session.adminId));
}
