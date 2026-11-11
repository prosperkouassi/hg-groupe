import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import BlogEditor from '@/components/admin/blog/Editor';
import { requireBlogAdmin } from '@/lib/blog/access';
import { adminArticle } from '@/lib/blog/data';
export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) { const admin = await requireBlogAdmin(); const id = Number((await params).id); if (!Number.isSafeInteger(id) || id < 1) notFound(); const article = await adminArticle(id); if (!article) notFound(); return <AdminShell admin={admin}><BlogEditor article={article} /></AdminShell>; }
