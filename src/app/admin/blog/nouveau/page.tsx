import AdminShell from '@/components/admin/AdminShell';
import BlogEditor from '@/components/admin/blog/Editor';
import { requireBlogAdmin } from '@/lib/blog/access';
export default async function NewArticlePage() { const admin = await requireBlogAdmin(); return <AdminShell admin={admin}><BlogEditor /></AdminShell>; }
