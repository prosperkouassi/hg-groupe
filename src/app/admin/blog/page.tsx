import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { requireBlogAdmin } from '@/lib/blog/access';
import { adminArticles } from '@/lib/blog/data';
import s from '@/components/admin/blog/admin-blog.module.css';
export const dynamic = 'force-dynamic';
export default async function BlogAdminPage() { const admin = await requireBlogAdmin(); const articles = await adminArticles(); return <AdminShell admin={admin}><main className={s.main}><div className={s.top}><div><h1>Le blog</h1><p>Préparez vos articles et publiez les versions validées par votre équipe</p></div><Link className={s.new} href="/admin/blog/nouveau">Nouvel article +</Link></div><div className={s.list}>{articles.length ? articles.map(a => <article className={s.row} key={a.id}><div><span className={s.badge}>{a.published ? 'Publié · brouillon modifiable' : 'Brouillon privé'}</span><h2>{a.draft.title || 'Sans titre'}</h2><p>{a.draft.category} · {a.draft.author}</p></div><Link href={`/admin/blog/${a.id}`}>Modifier →</Link></article>) : <p>Aucun article pour le moment. Créez votre premier brouillon.</p>}</div></main></AdminShell>; }
