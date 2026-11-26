import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { OfferSummary } from "../offers";
import { candidateName, statusLabel, type Application } from "./applications";
import { base, dateLabel, Panel, Table, type Role } from "./common";
import shared from "./recruitment-admin.module.css";
import styles from "./recruitment-dashboard.module.css";

const applications = `${base}/candidatures`;
const spontaneous = `${base}/spontanees`;
const offers = `${base}/offres`;
const counters = {
  openOffers: "Offres en cours", closedOffers: "Offres fermées", draftOffers: "Offres en brouillon", scheduledOffers: "Offres programmées",
  pending: "En attente de validation", validated: "Candidatures validées", reviewing: "En cours d’étude",
  shortlisted: "Présélectionnées", today: "Reçues aujourd’hui", week: "Reçues cette semaine",
  spontaneous: "Candidatures spontanées",
};
type Counter = keyof typeof counters;
export type DashboardData = Partial<Record<Counter, number>> & {
  recent: (Application & { applicationType?: string })[];
  activity: { id: string | number; action: string; createdAt?: string | Date; toStatus?: string | null }[];
  attentionOffers?: OfferSummary[];
};

const icons = {
  openOffers: "M3 7h18v13H3z M8 7V4h8v3 M3 12h18",
  pending: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  validated: "m8 12 3 3 5-6 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  week: "M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4",
  reviewing: "M6 3h9l3 3v15H6z M9 11h6 M9 15h6",
};
const recentActions: Record<string, string> = {
  status: "Statut modifié", note: "Note ajoutée", delete: "Dossier supprimé", resend: "Lien de validation programmé",
  download: "Document téléchargé", document_download: "Document téléchargé",
};
const numberFormat = new Intl.NumberFormat("fr-CI");
const dayMs = 86_400_000;
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const countLabel = (value: number | undefined) => value === undefined ? "—" : numberFormat.format(value);

function PanelHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className={styles.panelHeading}><h2>{title}</h2>{children}</div>;
}

function ListLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className={shared.textLink} href={href}>{children}<span aria-hidden="true"> ↗</span></Link>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}

export function Dashboard({ data, role }: { data: DashboardData; role: Role }) {
  const canSeeOffers = role !== "manager";
  const canSeeSpontaneous = role !== "recruiter";
  const now = new Date();
  const today = dateKey(now);
  const monday = dateKey(new Date(now.getTime() - ((now.getUTCDay() + 6) % 7) * dayMs));
  const destinations: Record<Counter, string> = {
    openOffers: `${offers}?status=active`, closedOffers: `${offers}?status=closed`, draftOffers: `${offers}?status=draft`,
    scheduledOffers: `${offers}?status=scheduled`,
    pending: `${applications}?status=pending`, validated: `${applications}?validation=validated`, reviewing: `${applications}?status=reviewing`,
    shortlisted: `${applications}?status=shortlisted`, today: `${applications}?from=${today}&to=${today}`,
    week: `${applications}?from=${monday}&to=${today}`, spontaneous,
  };
  const primary = [
    canSeeOffers ? "openOffers" : "reviewing",
    canSeeSpontaneous ? "pending" : "reviewing",
    "validated", "week",
  ] as const;
  const workflow = canSeeSpontaneous
    ? ["pending", "reviewing", "shortlisted"] as const
    : ["reviewing", "shortlisted"] as const;
  const workflowTotal = workflow.reduce((sum, key) => sum + (data[key] ?? 0), 0);
  const deadlines = data.attentionOffers ?? [];

  function metric(key: Counter, bar = false) {
    return <li key={key}>
      <Link href={destinations[key]} className={styles.metric}>
        <span>{counters[key]}</span><strong>{countLabel(data[key])}</strong>
        {bar && <span aria-hidden="true" className={styles.track}>
          <span style={{ "--share": `${100 * (data[key] ?? 0) / Math.max(1, workflowTotal)}%` } as CSSProperties}/>
        </span>}
      </Link>
    </li>;
  }

  return <div className={styles.dashboard}>
    <ul className={styles.kpis} aria-label="Indicateurs principaux">
      {primary.map(key => <li key={key}><Link href={destinations[key]} className={styles.kpi}>
        <span className={styles.kpiTop}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={icons[key]}/></svg>
          <span aria-hidden="true">↗</span>
        </span>
        <strong>{countLabel(data[key])}</strong>
        <span>{counters[key]}</span>
      </Link></li>)}
    </ul>
    <div className={styles.summary}>
      <Panel>
        <PanelHeading title="Suivi des candidatures"/>
        <ul className={styles.metrics} aria-label="Répartition des étapes suivies">{workflow.map(key => metric(key, true))}</ul>
        {canSeeSpontaneous && <div className={styles.links}>
          <ListLink href={`${spontaneous}?status=pending`}>Spontanées en attente</ListLink>
          <ListLink href={`${spontaneous}?status=reviewing`}>En cours d’étude</ListLink>
          <ListLink href={`${spontaneous}?status=shortlisted`}>Présélectionnées</ListLink>
        </div>}
      </Panel>
      <Panel>
        <PanelHeading title="Réception des dossiers"/>
        <ul className={styles.metrics}>{metric("today")}{canSeeSpontaneous && metric("spontaneous")}</ul>
        {canSeeSpontaneous && <div className={styles.links}>
          <ListLink href={`${spontaneous}?from=${today}&to=${today}`}>Spontanées aujourd’hui</ListLink>
          <ListLink href={`${spontaneous}?from=${monday}&to=${today}`}>Cette semaine</ListLink>
        </div>}
      </Panel>
      {canSeeOffers && <Panel>
        <PanelHeading title="État des offres"/>
        <ul className={styles.metrics}>{metric("scheduledOffers")}{metric("draftOffers")}{metric("closedOffers")}</ul>
        <div className={styles.links}>
          <ListLink href={`${offers}?status=open`}>Ouvertes</ListLink>
          <ListLink href={`${offers}?status=closing`}>En clôture</ListLink>
        </div>
      </Panel>}
    </div>
    <div className={canSeeOffers ? styles.operations : undefined}>
      <Panel>
        <PanelHeading title="Dernières candidatures"><ListLink href={applications}>Toutes les candidatures sur offre</ListLink></PanelHeading>
        {data.recent.length ? <div className={styles.recent}>
          <Table columns={["Dossier", "Offre ou poste", "Réception", "Statut"]} label="Dernières candidatures">
            {data.recent.map(row => {
              const isSpontaneous = row.applicationType === "spontaneous_application";
              return <tr key={row.id}>
                <td><Link className={shared.textLink} href={`${isSpontaneous ? spontaneous : applications}?id=${encodeURIComponent(row.id)}`}>{candidateName(row)}</Link>
                  <small>{isSpontaneous ? "Spontanée" : "Sur offre"}</small></td>
                <td>{row.jobTitle ?? row.desiredPosition ?? "—"}</td>
                <td>{dateLabel(row.createdAt)}</td>
                <td><span className={shared.status} data-status={row.status}>{statusLabel(row.status)}</span></td>
              </tr>;
            })}
          </Table>
        </div> : <Empty>Aucun dossier reçu. Les nouvelles candidatures apparaîtront ici.</Empty>}
        {canSeeSpontaneous && <div className={styles.links}><ListLink href={spontaneous}>Toutes les candidatures spontanées</ListLink></div>}
      </Panel>
      {canSeeOffers && <Panel>
        <PanelHeading title="Suivi des échéances"><ListLink href={`${offers}?sort=deadline`}>Toutes les offres</ListLink></PanelHeading>
        {deadlines.length ? <ul className={styles.entries}>{deadlines.map(offer => {
          const deadline = offer.deadline ? new Date(offer.deadline) : null;
          const scheduled = offer.status === "scheduled";
          const days = deadline && Number.isFinite(deadline.getTime())
            ? (Date.parse(dateKey(deadline)) - Date.parse(today)) / dayMs
            : null;
          const remaining = days === null ? "Sans date de clôture"
            : deadline && deadline <= now ? "Échéance passée"
            : days === 0 ? "Clôture aujourd’hui" : `${numberFormat.format(days)} jour${days === 1 ? "" : "s"} restant${days === 1 ? "" : "s"}`;
          return <li key={offer.slug}>
            <div><Link className={shared.textLink} href={`${offers}?slug=${encodeURIComponent(offer.slug)}`}>{offer.title}</Link>
              {deadline && <small>Clôture le {dateLabel(offer.deadline)}</small>}
              {scheduled && <small>Publication le {dateLabel(offer.publishedAt)}</small>}
            </div>
            <span className={shared.status} data-offer-status={offer.status}>{scheduled ? "Publication programmée" : remaining}</span>
          </li>;
        })}</ul> : <Empty>Aucune clôture prochaine ni publication programmée.</Empty>}
      </Panel>}
    </div>
    <Panel>
      <PanelHeading title="Activité récente"/>
      {data.activity.length ? <ul className={styles.entries}>{data.activity.map(item => <li key={item.id}>
        <span>{recentActions[item.action] ?? item.action}{item.toStatus ? ` · ${statusLabel(item.toStatus)}` : ""}</span>
        <small>{dateLabel(item.createdAt)}</small>
      </li>)}</ul> : <Empty>Les prochaines actions sur les dossiers apparaîtront ici.</Empty>}
    </Panel>
  </div>;
}
