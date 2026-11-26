import Link from "next/link";
import { getNationalities } from "../../application/fields";
import { base, dateLabel, Details, Field, OptionList, PageLinks, Panel, Table, type Query, type Role } from "./common";
import { Download, Mutation } from "./actions";
import { ApplicationSelection } from "./application-selection";
import styles from "./recruitment-admin.module.css";
import applications from "./recruitment-applications.module.css";

const business = {
  validated: "À étudier", rejected: "Rejetée", reviewing: "En cours d’étude", shortlisted: "Présélectionnée",
  not_selected: "Non retenue", hired: "Recrutée",
};
const statuses: Record<string, string> = { pending: "En attente de validation", expired: "Lien expiré", ...business };
export const statusLabel = (status: string) => statuses[status] ?? status;

const nationalities = new Map(getNationalities().map(({ code, label }) => [code, label]));
function nationalityLabel(code?: string | null) {
  if (!code) return null;
  return code === "CI" ? "Ivoirienne" : nationalities.get(code) ?? null;
}

type Document = { id: string; kind: string; extension?: string; bytes?: number };
type Entry = { id: string | number; createdAt?: string | Date; actorName?: string | null };
type Note = Entry & { note: string };
type Event = Entry & { action: string; fromStatus?: string | null; toStatus?: string | null };
export type Application = {
  id: string; status: string; createdAt?: string | Date | null; validatedAt?: string | Date | null;
  jobSlug?: string | null; jobTitle?: string | null; firstName?: string | null; lastName?: string | null;
  email?: string | null; phone?: string | null; city?: string | null; nationality?: string | null; desiredPosition?: string | null;
  motivation?: string | null; consentedAt?: string | Date | null; documents?: Document[]; notes?: Note[]; history?: Event[];
};
type ApplicationList = {
  rows: Application[];
  total: number;
  page: number;
  pageSize: number;
  statusCounts: Partial<Record<string, number>>;
  allStatuses: number;
  offers: readonly { slug: string; title: string }[];
};
type Resource = "candidatures" | "spontanees";

export function candidateName(row: Application) {
  return [row.firstName, row.lastName].filter(Boolean).join(" ") || "Dossier masqué";
}

function Status({ value }: { value: string }) {
  return <span className={styles.status} data-status={value}>{statusLabel(value)}</span>;
}

function EmailStatus({ item }: { item: Application }) {
  const value = item.validatedAt ? "validated" : item.status === "expired" ? "expired" : "pending";
  const label = item.validatedAt ? "Validée" : value === "expired" ? "Lien expiré" : "À confirmer";
  return <span className={styles.status} data-status={item.validatedAt ? "email-validated" : value}>{label}</span>;
}

function ApplicationFilters({ list, query, spontaneous, href, canManage }: {
  list: ApplicationList; query: Query; spontaneous: boolean; href: string; canManage: boolean;
}) {
  const filterQuery = new URLSearchParams(Object.entries(query).filter(([key]) => key !== "status" && key !== "page"));
  const selectedOfferIsAvailable = list.offers.some(offer => offer.slug === query.offer);
  return <Panel><div className={applications.section}>
    <nav className={applications.shortcuts} aria-label="Candidatures par statut">
      {[["", "Toutes"], ...Object.entries(statuses)].filter(([value]) => canManage || value !== "pending" && value !== "expired")
        .map(([value, label]) => {
          const params = new URLSearchParams(filterQuery);
          if (value) params.set("status", value);
          return <Link key={value} href={params.size ? `${href}?${params}` : href}
            aria-current={(query.status ?? "") === value ? "page" : undefined}>
            {label} <span>{value ? list.statusCounts[value] ?? 0 : list.allStatuses}</span>
          </Link>;
        })}
    </nav>
    <form method="get" action={href} className={styles.filters}>
      <Field label="Recherche"><input type="search" name="q" defaultValue={query.q} maxLength={180} placeholder="Nom, e-mail, téléphone…" /></Field>
      {!spontaneous && <Field label="Offre d’emploi"><select name="offer" defaultValue={query.offer || ""}>
        <option value="">Toutes les offres</option>
        {query.offer && !selectedOfferIsAvailable && <option value={query.offer}>Offre sélectionnée</option>}
        {list.offers.map(offer => <option key={offer.slug} value={offer.slug}>{offer.title}</option>)}
      </select></Field>}
      <Field label="Statut du dossier"><select name="status" defaultValue={query.status || ""}>
        <option value="">Tous les statuts</option><OptionList options={canManage ? statuses : business}/>
      </select></Field>
      {canManage && <Field label="Validation e-mail"><select name="validation" defaultValue={query.validation || ""}>
        <option value="">Toutes</option><option value="validated">Validées</option><option value="unconfirmed">Non confirmées</option>
      </select></Field>}
      <Field label="Du"><input type="date" name="from" defaultValue={query.from} /></Field>
      <Field label="Au"><input type="date" name="to" defaultValue={query.to} /></Field>
      <Field label="Ordre"><select name="sort" defaultValue={query.sort || "newest"}>
        <option value="newest">Plus récentes</option><option value="oldest">Plus anciennes</option>
      </select></Field>
      <button className={styles.primary}>Filtrer</button>
      {Object.values(query).some(Boolean) && <Link className={styles.button} href={href}>Réinitialiser</Link>}
    </form>
  </div></Panel>;
}

export function Applications({ list, query, resource, role }: {
  list: ApplicationList; query: Query; resource: Resource; role: Role;
}) {
  const href = `${base}/${resource}`;
  const spontaneous = resource === "spontanees";
  const canManage = role !== "recruiter";
  const eligible = list.rows.filter(row => row.validatedAt).length;
  const position = spontaneous ? "Poste recherché" : "Offre d’emploi";
  const table = <div className={applications.table}>
    <Table responsive label="Liste des candidatures"
      columns={[...(canManage ? ["Sélection"] : []), "Candidature", position, "Réception", "E-mail", "Statut métier", "Actions"]}>
      {list.rows.map(row => {
        const candidate = candidateName(row);
        const detail = `${href}?${new URLSearchParams({ ...query, id: row.id })}`;
        return <tr key={row.id} role="row">
          {canManage && <td role="cell" data-selection>{row.validatedAt &&
            <label className={applications.check}>
              <input name="ids" type="checkbox" value={row.id} aria-label={`Sélectionner ${candidate}`} />
            </label>}</td>}
          <td role="cell" data-identity><strong>{candidate}</strong>{row.email && <div className={styles.note}>{row.email}</div>}</td>
          <td role="cell" data-label={position}>{spontaneous ? row.desiredPosition ?? "—" : row.jobTitle ?? "—"}
            {spontaneous && (row.city || row.nationality) &&
              <div className={styles.note}>{[row.city, nationalityLabel(row.nationality)].filter(Boolean).join(" · ")}</div>}
          </td>
          <td role="cell" data-label="Réception">{dateLabel(row.createdAt)}</td>
          <td role="cell" data-label="E-mail"><EmailStatus item={row}/></td>
          <td role="cell" data-label="Statut métier">{row.validatedAt ? <Status value={row.status}/> : "—"}</td>
          <td role="cell" data-row-action><Link className={styles.textLink} href={detail} aria-label={`Ouvrir le dossier : ${candidate}`}>Ouvrir</Link></td>
        </tr>;
      })}
    </Table>
  </div>;
  return <div className={styles.stack}>
    <ApplicationFilters key={JSON.stringify(query)} list={list} query={query} spontaneous={spontaneous} href={href} canManage={canManage}/>
    <Panel>
      <div className={applications.section}>
        {canManage && <div className={applications.toolbar}>
          <a className={styles.button}
            href={`/api/admin/recrutement/${resource}?${new URLSearchParams({ ...query, export: "csv" })}`}>Exporter en CSV</a>
          <p className={styles.note}>L’export inclut tous les résultats filtrés dont l’adresse e-mail est validée.</p>
        </div>}
        {list.rows.length === 0 ? <p className={styles.note}>Aucune candidature ne correspond aux critères.</p>
          : canManage && eligible > 0 ? <ApplicationSelection key={JSON.stringify(query)} count={eligible} resource={resource} canDelete={role === "admin"}
            choices={<OptionList options={business}/>}>{table}</ApplicationSelection>
          : table}
        <PageLinks href={href} query={query} page={list.page} total={list.total} size={list.pageSize}/>
      </div>
    </Panel>
  </div>;
}

const historyLabels: Record<string, string> = { status: "Changement de statut", note: "Note interne", download: "Téléchargement", resend: "Renvoi du lien" };

function EntryMeta({ entry }: { entry: Entry }) {
  return <p className={styles.note}>{[entry.actorName, entry.createdAt ? dateLabel(entry.createdAt) : null].filter(Boolean).join(" · ")}</p>;
}

function contactLink(value: string | null | undefined, type: "email" | "phone") {
  if (!value) return null;
  if (type === "email" && /^[^\s<>@]+@[^\s<>@]+$/.test(value)) {
    return <a className={styles.textLink} href={`mailto:${encodeURIComponent(value).replace("%40", "@")}`}>{value}</a>;
  }
  const number = value.replace(/[\s().-]/g, "");
  if (type === "phone" && /^\+?\d{7,15}$/.test(number)) {
    return <a className={styles.textLink} href={`tel:${number}`}>{value}</a>;
  }
  return value;
}

function PrivateDocuments({ item }: { item: Application }) {
  const size = new Intl.NumberFormat("fr-CI", { maximumFractionDigits: 1 });
  return <Panel><div className={applications.section}>
    <h2>Documents privés</h2>
    {item.documents?.length ? <ul className={applications.entries}>
      {item.documents.map(document => {
        const name = document.kind === "cv" ? "CV" : "Lettre de motivation";
        const format = document.extension?.toUpperCase();
        const bytes = document.bytes;
        const length = typeof bytes === "number" ? bytes >= 1024 * 1024
          ? `${size.format(bytes / (1024 * 1024))} Mio` : `${size.format(bytes / 1024)} Kio` : null;
        return <li className={applications.document} key={document.id}>
          <div><strong>{name}</strong><p className={styles.note}>{[format, length].filter(Boolean).join(" · ")}</p></div>
          <Download id={document.id} label={document.kind === "cv" ? "Télécharger le CV" : "Télécharger la lettre"}/>
        </li>;
      })}
    </ul> : <p className={styles.note}>Aucun document accessible.</p>}
  </div></Panel>;
}

function Timeline({ item, resource }: { item: Application; resource: Resource }) {
  return <>
    {item.validatedAt && <Panel><div className={applications.section}>
      <h2>Notes internes</h2>
      <Mutation resource={resource} action="note" data={{ id: item.id }} button="Ajouter une note">
        <Field label="Nouvelle note"><textarea name="note" required maxLength={4000} rows={3}/></Field>
      </Mutation>
      {item.notes?.length ? <ol className={applications.timeline}>{item.notes.map(note => <li key={note.id}>
        <p className={styles.preline}>{note.note}</p><EntryMeta entry={note}/>
      </li>)}</ol> : <p className={styles.note}>Aucune note interne.</p>}
    </div></Panel>}
    <Panel><div className={applications.section}>
      <h2>Historique</h2>
      {item.history?.length ? <ol className={applications.timeline}>{item.history.map(event => <li key={event.id}>
        <strong>{historyLabels[event.action] ?? event.action}</strong>
        {event.toStatus && <p>{event.fromStatus && `${statusLabel(event.fromStatus)} → `}{statusLabel(event.toStatus)}</p>}
        <EntryMeta entry={event}/>
      </li>)}</ol> : <p className={styles.note}>Aucune activité enregistrée.</p>}
    </div></Panel>
  </>;
}

export function ApplicationDetail({ item, resource, role, query = {} }: { item: Application; resource: Resource; role: Role; query?: Query }) {
  const params = new URLSearchParams(query);
  params.delete("id");
  const baseUrl = `${base}/${resource}`;
  const target = params.size ? `${baseUrl}?${params}` : baseUrl;
  const spontaneous = resource === "spontanees";
  const validated = Boolean(item.validatedAt);
  const position = spontaneous ? item.desiredPosition : item.jobTitle;
  const contextFields: [string, string | null | undefined][] = spontaneous ? [
    ["Poste recherché", item.desiredPosition],
    ["Ville de résidence", item.city],
    ["Nationalité", nationalityLabel(item.nationality)],
  ] : [["Offre d’emploi", item.jobTitle]];
  const name = candidateName(item);
  const initials = [item.firstName, item.lastName].map(part => Array.from(part?.trim() ?? "")[0]).filter(Boolean).join("").toLocaleUpperCase("fr");
  return <div className={styles.stack}>
    <div><Link href={target} className={styles.textLink}>Retour à la liste</Link></div>
    <Panel><div className={applications.profile}>
      {initials && <span className={styles.avatar} aria-hidden="true">{initials}</span>}
      <div className={applications.summary}>
        <h2>{name}</h2>
        {position && <p>{position}</p>}
        <div className={styles.actions}>
          {validated && <Status value={item.status}/>}
          <span className={applications.badgePair}>E-mail <EmailStatus item={item}/></span>
          <span className={styles.note}>Reçue le {dateLabel(item.createdAt)}</span>
        </div>
      </div>
    </div></Panel>
    <div className={applications.detail}>
      <div className={applications.column}>
        <Panel><div className={applications.section}>
          <h2>Informations personnelles</h2>
          {validated ? <Details values={[["Nom et prénom", name], ...contextFields]}/>
            : <p className={styles.note}>Les informations du dossier seront accessibles après validation de l’adresse e-mail.</p>}
        </div></Panel>
        {validated && !spontaneous && <Panel><div className={applications.section}>
          <h2>Motivation</h2>
          <p className={item.motivation ? styles.preline : styles.note}>{item.motivation || "Aucune motivation renseignée."}</p>
        </div></Panel>}
        {validated && <PrivateDocuments item={item}/>}
        <Timeline item={item} resource={resource}/>
      </div>
      <aside className={applications.column} aria-label="Suivi et administration">
        <Panel><div className={applications.section}>
          <h2>Suivi de la candidature</h2>
          {validated ? <Mutation key={item.id} resource={resource} action="status" data={{ id: item.id }} button="Enregistrer le statut" disableWhenUnchanged>
            <Field label="Statut métier"><select name="status" key={item.status} defaultValue={item.status}><OptionList options={business}/></select></Field>
          </Mutation> : <p className={styles.note}>{item.status === "expired" ? "Le lien de validation a expiré." : "L’adresse e-mail n’a pas encore été confirmée."}</p>}
          {!validated && item.status === "expired" && role !== "recruiter" &&
            <Mutation resource={resource} action="resend" data={{ id: item.id }}
              button="Demander le renvoi du lien" confirm="Programmer le renvoi du lien de validation ?"/>}
        </div></Panel>
        {validated && <Panel><div className={applications.section}>
          <h2>Coordonnées</h2>
          <Details values={[["E-mail", contactLink(item.email, "email")], ["Téléphone", contactLink(item.phone, "phone")]]}/>
        </div></Panel>}
        <Panel><div className={applications.section}>
          <h2>Informations administratives</h2>
          <Details values={[
            ["Réception", dateLabel(item.createdAt)],
            ["Validation de l’e-mail", validated ? dateLabel(item.validatedAt) : <EmailStatus item={item}/>],
            ...(validated ? [["Consentement enregistré", dateLabel(item.consentedAt)] as [string, string]] : []),
          ]}/>
          {!spontaneous && item.jobSlug && role !== "manager" && <Link
            href={`${base}/offres?${new URLSearchParams({ slug: item.jobSlug })}`} className={styles.textLink}>Consulter l’offre associée</Link>}
        </div></Panel>
        {role === "admin" && <section className={applications.sensitive}>
          <h2>Actions sensibles</h2>
          <p>La suppression efface définitivement le dossier et ses documents.</p>
          <Mutation resource={resource} action="delete" data={{ id: item.id }} button="Supprimer le dossier"
            confirm="Supprimer définitivement cette candidature et ses documents ?" returnTo={target}/>
        </section>}
      </aside>
    </div>
  </div>;
}
