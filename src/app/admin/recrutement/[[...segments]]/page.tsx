import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminPage } from "@/modules/recrutement/admin/gateway";
import { ApplicationDetail, Applications } from "@/modules/recrutement/admin/ui/applications";
import { base, Menu, Panel, sections, type Query, type Section } from "@/modules/recrutement/admin/ui/common";
import { OfferDetail, Offers, RecruiterAdd, Recruiters } from "@/modules/recrutement/admin/ui/offers";
import { Dashboard, Settings } from "@/modules/recrutement/admin/ui/overview";
import styles from "@/modules/recrutement/admin/ui/recruitment-admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{segments?:string[]}>;
  searchParams: Promise<Record<string, string|string[]|undefined>>;
};

function isSection(section: string): section is Section {
  return Object.hasOwn(sections, section);
}

function title(section: Section, query: Query) {
  if (section === "offres") {
    if (query.preview && query.slug) return "Aperçu privé de l’offre";
    if (query.slug) return "Fiche de l’offre";
    if (query.new === "1") return "Nouvelle offre";
  }
  return sections[section];
}

export default async function RecruitmentAdminPage({ params, searchParams }: Props) {
  const { segments = [] } = await params;
  const section = segments[0] ?? "dashboard";
  if (segments.length > 1 || !isSection(section)) notFound();
  const query: Query = Object.fromEntries(Object.entries(await searchParams).filter((item): item is [string,string] => typeof item[1] === "string"));
  const result = await getAdminPage(section, query);
  const role = result.actor?.role;
  const data = "data" in result ? result.data : undefined;

  function content() {
    if (result.error) return <Panel><div className={styles.stack}>
      <h2>{result.unavailable ? "Recrutement indisponible" : "Accès ou dossier indisponible"}</h2>
      <p className={styles.error} role="alert">{result.error}</p>
      <Link className={styles.textLink} href={section === "dashboard" ? "/admin" : base}>
        {section === "dashboard" ? "Retour à l’administration" : "Retour au tableau de bord"}
      </Link>
    </div></Panel>;
    if (!role || !data) return null;
    if (section === "dashboard" && "recent" in data) return <Dashboard data={data} role={role}/>;
    if (section === "offres" && "items" in data) return <Offers list={data} query={query} role={role}/>;
    if (section === "offres" && "recruiters" in data && data.recruiters) {
      return <OfferDetail offer={data.offer ?? null} recruiters={data.recruiters} role={role} preview={query.preview === "1"}/>;
    }
    if (section === "recruteurs" && Array.isArray(data)) return <Recruiters profiles={data}/>;
    if (section === "reglages" && "administratorEmail" in data) return <Settings settings={data} tab={query.tab}/>;
    if (section === "candidatures" || section === "spontanees") {
      if ("rows" in data) return <Applications list={data} query={query} resource={section} role={role}/>;
      if ("id" in data) return <ApplicationDetail item={data} query={query} resource={section} role={role}/>;
    }
    return <Panel><p className={styles.error} role="alert">Impossible d’afficher cette section.</p></Panel>;
  }

  const workspace = <main id="recruitment-workspace" className={styles.workspace}>
    <a className={styles.skip} href="#recruitment-content">Aller au contenu du recrutement</a>
    {role && <Menu section={section} role={role}/>}
    <div className={styles.heading}>
      <div><h1 id="recruitment-content" tabIndex={-1}>{title(section,query)}</h1>
        {section === "dashboard" && <p>Gestion du recrutement de Hopla Groupe</p>}</div>
      {!result.error && section === "recruteurs" && role === "admin" && <RecruiterAdd/>}
      {!result.error && role && (section === "dashboard" || section === "offres" && !query.slug && query.new !== "1") &&
        <div className={styles.actions}>
          {role === "admin" && <Link className={styles.primary} href={`${base}/offres?new=1`}>Nouvelle offre</Link>}
          {section === "dashboard" && <Link className={styles.button} href={`${base}/candidatures`}>Consulter les candidatures</Link>}
        </div>}
    </div>
    {content()}
  </main>;
  return result.admin ? <AdminShell admin={result.admin}>{workspace}</AdminShell> : <div className={styles.fallback}>{workspace}</div>;
}
