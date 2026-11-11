'use client';
import s from '@/components/blog/blog.module.css';
export default function BlogError({ reset }: { reset: () => void }) { return <main className={s.page}><div className={s.error}><h1>Le blog est momentanément indisponible</h1><p>Veuillez réessayer dans quelques instants</p><button className={s.button} onClick={reset}>Réessayer</button></div></main>; }
