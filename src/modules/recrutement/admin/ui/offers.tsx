import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminOffer, OfferSummary, RecruiterProfile, listOffers } from "../offers";
import { Mutation } from "./actions";
import { base, Check, dateLabel, Field, OptionList, PageLinks, Panel, Table, type Query, type Role } from "./common";
import styles from "./recruitment-admin.module.css";
import { getNationalities } from "../../application/fields";
import { formatDate, formatPublication } from "../../dates";
import { isPublicOfferAsset } from "../../public-assets";
import { publicRecruiter } from "../../server/jobs";
import { Recruiter } from "../../ui/JobDetail";
import publicStyles from "../../ui/recruitment.module.css";
import { OfferCountry, OfferField, OfferIdentity, OfferListEditor, OfferRecruiter, RecruiterDialog } from "./offer-controls";
import listStyles from "./recruitment-offers.module.css";

export const offerStates = {draft:"Brouillon",scheduled:"Programmée",open:"Ouverte",closing:"Bientôt fermée",closed:"Fermée"};
const offersPath = `${base}/offres`;
const contracts = ["Stage","Alternance","CDD","CDI","Freelance","Mission","Temporaire"];
const modes = ["Sur site","Hybride","Télétravail"];
const sectionFields = {missions:"Missions principales",profile:"Profil recherché",skills:"Compétences requises",benefits:"Avantages",process:"Processus de recrutement"};
type OfferList = Awaited<ReturnType<typeof listOffers>>;
const statusLinks = {all:"Toutes",active:"En cours",open:"Ouvertes",closing:"Bientôt fermées",scheduled:"Programmées",draft:"Brouillons",closed:"Fermées"} as const;
const countFormat = new Intl.NumberFormat("fr-CI");

function OfferStatus({ offer }: {offer:OfferSummary}) {
  return <span className={styles.status} data-offer-status={offer.status}>{offerStates[offer.status]}</span>;
}

function OfferCell({ label, children }: {label?:string; children:ReactNode}) {
  return <td role="cell">{label && <span aria-hidden="true" className={listStyles.cellLabel}>{label}</span>}{children}</td>;
}

function OfferActions({ offer, role, detail }: {offer:OfferSummary; role:Role; detail:string}) {
  const canEdit = role === "admin";
  const operations = [
    ["publish", "Publier", offer.status === "draft" || offer.status === "closed"],
    ["unpublish", "Dépublier", Boolean(offer.publishedAt)],
    ["draft", "Mettre en brouillon", offer.status !== "draft" || Boolean(offer.publishedAt)],
    ["close", "Fermer", offer.status === "open" || offer.status === "closing"],
  ] as const;
  return <div className={listStyles.rowActions}>
    {canEdit && <Link className={styles.textLink} href={detail}>Modifier</Link>}
    <Link className={styles.textLink} href={`${detail}&preview=1`}>Prévisualiser</Link>
    {canEdit && <details className={listStyles.more}>
      <summary aria-label={`Autres actions pour ${offer.title}`}>Plus d’actions</summary>
      <div className={listStyles.commands}>
        {operations.filter(([, , available]) => available).map(([action, label]) =>
          <Mutation key={action} resource="offres" action={action} data={{slug:offer.slug}}
            confirm={`${label} l’offre « ${offer.title} » ?`}>
            <button className={styles.button}>{label}</button>
          </Mutation>)}
        <Link className={styles.button} href={`${detail}#duplication-offre`}>Dupliquer</Link>
        {!offer.publishedAt && <Link className={styles.danger} href={`${detail}#suppression-offre`}>Supprimer</Link>}
      </div>
    </details>}
  </div>;
}

export function Offers({ list, query, role }: {list:OfferList; query:Query; role:Role}) {
  const activeStatus = query.status && Object.hasOwn(statusLinks, query.status) ? query.status : "all";
  return <div className={styles.stack}>
    <Panel>
      <nav aria-label="Offres par statut" className={listStyles.shortcuts}>
        {(Object.keys(statusLinks) as (keyof typeof statusLinks)[]).map(status => {
          const params = new URLSearchParams();
          for (const key of ["q", "contract", "sort"] as const) if (query[key]) params.set(key, query[key]);
          if (status !== "all") params.set("status", status);
          return <Link key={status} href={params.size ? `${offersPath}?${params}` : offersPath}
            aria-current={activeStatus === status ? "page" : undefined}>
            {statusLinks[status]} <span>{countFormat.format(list.counts[status])}</span>
          </Link>;
        })}
      </nav>
      <form method="get" className={`${styles.filters} ${listStyles.filters}`} key={new URLSearchParams(query).toString()}>
      <Field label="Recherche"><input type="search" name="q" defaultValue={query.q} maxLength={120} placeholder="Poste, ville ou slug…" /></Field>
      <Field label="Statut"><select name="status" defaultValue={query.status || ""}><option value="">Tous les statuts</option>
        <OptionList options={{active:"En cours",...offerStates}}/></select></Field>
      <Field label="Type de contrat"><select name="contract" defaultValue={query.contract || ""}><option value="">Tous les contrats</option>
        {contracts.map(value => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Tri"><select name="sort" defaultValue={query.sort || "newest"}><OptionList options={{
        newest:"Les plus récentes",oldest:"Les plus anciennes",title:"Titre de A à Z",deadline:"Date limite",
      }}/></select></Field>
      <button className={styles.button}>Filtrer</button>
      <a className={styles.button} href={offersPath}>Réinitialiser</a>
    </form></Panel>
    <Panel>
      {list.items.length ? <div className={listStyles.results}>
        <Table responsive label="Liste des offres" columns={["Offre","Contrat","Publication","Date limite","Statut","Candidatures","Actions"]}>
        {list.items.map(offer => {
          const detail = `${offersPath}?${new URLSearchParams({slug:offer.slug})}`;
          const count = countFormat.format(offer.validatedApplications);
          return <tr key={offer.slug} role="row">
          <OfferCell><Link className={styles.textLink} href={detail}>{offer.title}</Link>
            <div className={styles.note}>{offer.city}, {offer.country}{offer.featured ? " · À la une" : ""}</div></OfferCell>
          <OfferCell label="Contrat"><span className={listStyles.contract}>{offer.contract}</span></OfferCell>
          <OfferCell label="Publication">{dateLabel(offer.publishedAt)}</OfferCell>
          <OfferCell label="Date limite">{dateLabel(offer.deadline)}</OfferCell>
          <OfferCell label="Statut"><OfferStatus offer={offer}/></OfferCell>
          <OfferCell label="Candidatures"><Link className={listStyles.applicationCount}
            aria-label={`${count} candidature${offer.validatedApplications === 1 ? " validée" : "s validées"} pour ${offer.title}`}
            href={`${base}/candidatures?${new URLSearchParams({offer:offer.slug,validation:"validated"})}`}>{count}</Link></OfferCell>
          <OfferCell><OfferActions offer={offer} role={role} detail={detail}/></OfferCell>
        </tr>;
        })}
      </Table></div> : <p className={styles.note}>Aucune offre ne correspond aux critères.</p>}
      <PageLinks href={offersPath} query={query} page={list.page} total={list.total} size={20}/>
    </Panel>
  </div>;
}

function OfferPreview({ offer }: {offer:AdminOffer}) {
  const startDate = offer.startDate && Number.isFinite(Date.parse(offer.startDate)) ? offer.startDate : null;
  const facts = [
    ["Postes à pourvoir", offer.positions], ["Expérience", offer.experience],
    ["Niveau d’études", offer.education], ["Rémunération", offer.salary],
    ["Horaires", offer.hours], ["Début souhaité", startDate && <time dateTime={startDate}>
      {formatDate(startDate)}
    </time>],
  ] as const;
  const sections = [
    ...(["missions", "profile", "skills", "benefits"] as const).map(key => ({ title: sectionFields[key], items: offer[key] })),
    { title: "Documents à fournir", items: ["CV obligatoire", offer.coverLetterRequired ? "Lettre de motivation obligatoire" : "Lettre de motivation facultative"] },
    { title: sectionFields.process, items: offer.process },
  ];
  const attachments = [...new Set(offer.attachments.filter(path => isPublicOfferAsset(path, false)))].slice(0, 10);
  const recruiter = publicRecruiter(offer.recruiter);
  return <article className={`${publicStyles.detail} ${listStyles.preview}`} aria-labelledby="aperçu-offre-titre">
    <p className={listStyles.previewNotice}>Aperçu privé — non accessible au public</p>
    <div className={publicStyles.detailIntro}>
      <h2 id="aperçu-offre-titre" className="font-display">{offer.title}</h2>
      <p>{[offer.company, offer.city, offer.country].filter(Boolean).join(" · ")}</p>
      <ul className={publicStyles.tags} aria-label="Conditions de travail">
        {offer.featured && <li>À la une</li>}
        <li>{offer.contract}</li><li>{offer.workMode}</li>
      </ul>
      <div className={publicStyles.dates}>
        {offer.publishedAt && <time dateTime={offer.publishedAt}>{formatPublication(offer.publishedAt)}</time>}
        {offer.deadline && <p>Clôture le <time dateTime={offer.deadline}>{formatDate(offer.deadline)}</time></p>}
      </div>
    </div>
    <div className={listStyles.previewContent}>
      {isPublicOfferAsset(offer.imageUrl, true) && <Image src={offer.imageUrl} alt="" width={1200} height={600}
        sizes="(max-width: 760px) 100vw, (max-width: 1440px) 62vw, 850px" className={listStyles.previewImage} />}
      <dl className={publicStyles.facts}>{facts.filter(([,value]) => value).map(([label,value]) =>
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <section className={publicStyles.detailSection}><h3>Description du poste</h3>
        <p>{offer.description}</p></section>
      {sections.filter(({ items }) => items.length > 0).map(({ title, items }) =>
        <section key={title} className={publicStyles.detailSection}>
          <h3>{title}</h3><ul>{items.map((value,index) => <li key={index}>{value}</li>)}</ul>
        </section>)}
      {attachments.length > 0 && <section className={publicStyles.detailSection}>
        <h3>Pièces jointes de l’offre</h3><ul>{attachments.map((path,index) =>
          <li key={`${path}-${index}`}><a className={styles.textLink} href={path} download>{path.split("/").pop()}</a></li>)}</ul>
      </section>}
      <section className={publicStyles.recruiterCard}><h3>Recruteur</h3>
        {recruiter ? <Recruiter recruiter={recruiter}/> : <p>{offer.company ?? "Hopla Groupe"}</p>}
      </section>
    </div>
  </article>;
}

const conditions = [
  ["experience","Niveau d’expérience",true], ["education","Niveau d’études",true],
  ["salary","Rémunération (facultatif)",false], ["hours","Horaires (facultatif)",false],
] as const;

const publicationForm = "publication-offre";

function PublicationActions({ offer }: {offer:AdminOffer}) {
  const operations = [
    ["unpublish", "Dépublier", Boolean(offer.publishedAt)],
    ["draft", "Mettre en brouillon", offer.status !== "draft" || Boolean(offer.publishedAt)],
    ["close", "Fermer", offer.status === "open" || offer.status === "closing"],
  ] as const;
  const publish = offer.status === "draft" || offer.status === "closed";
  return <>
    <Field label="Date de publication (heure d’Abidjan)">
      <input form={publicationForm} name="publishedAt" type="datetime-local" defaultValue={offer.publishedAt?.slice(0,16)}/>
    </Field>
    <p className={styles.note}>Laissez la date vide pour publier immédiatement. La publication utilise la version enregistrée.</p>
    <div className={listStyles.publicationActions}>
      <button form={publicationForm} type="submit" name="_action" value="publish" className={styles.primary}>
        {publish ? "Publier ou programmer" : "Modifier la date de publication"}
      </button>
      {operations.filter(([, , available]) => available).map(([action, label]) =>
        <button key={action} form={publicationForm} type="submit" name="_action" value={action} className={styles.button}>{label}</button>)}
    </div>
  </>;
}

export function OfferDetail({ offer, recruiters, role, preview }: {
  offer:AdminOffer|null; recruiters:RecruiterProfile[]; role:Role; preview:boolean;
}) {
  const canEdit = role === "admin";
  const detail = offer && `${offersPath}?${new URLSearchParams({slug:offer.slug})}`;
  const optionalDate = (value?: string | null) => value?.slice(0,16) ?? "";
  const formId = "formulaire-offre";
  return <div className={styles.stack}>
    <div className={styles.actions}>
      <Link href={offersPath} className={styles.textLink}>Retour aux offres</Link>
      {preview && detail && canEdit && <Link href={detail} className={styles.button}>Revenir à la fiche</Link>}
    </div>
    {(preview || !canEdit) && offer ? <Panel><OfferPreview offer={offer}/></Panel> : canEdit ? <>
      <Mutation formId={formId} resource="offres" action={offer ? "update" : "create"}
        data={offer ? {slug:offer.slug} : undefined} transform="offer" protectChanges
        returnTo={offer ? undefined : `${offersPath}?slug={slug}`}>
        <div className={listStyles.editor}>
          <div className={styles.stack}>
            <Panel><div className={styles.stack}><h2>Informations générales</h2>
              <p className={styles.note}>Les champs sont obligatoires sauf indication contraire.</p>
              <OfferIdentity key={offer?.slug ?? "nouvelle"} title={offer?.title} slug={offer?.slug}/>
              <div className={styles.fields}>
                <Field label="Entreprise ou service (facultatif)"><input name="company" maxLength={180} defaultValue={offer?.company ?? ""}/></Field>
                <Field label="Type de contrat"><select name="contract" defaultValue={offer?.contract ?? "CDI"}>
                  {contracts.map(value => <option key={value}>{value}</option>)}</select></Field>
                <OfferCountry options={getNationalities()} code={offer?.countryCode} label={offer?.country}/>
                <OfferField label="Ville" name="city" maxLength={120} required defaultValue={offer?.city ?? ""}/>
                <Field label="Mode de travail"><select name="workMode" defaultValue={offer?.workMode ?? "Sur site"}>
                  {modes.map(value => <option key={value}>{value}</option>)}</select></Field>
                <OfferField label="Nombre de postes" name="positions" type="number" min={1} max={65535} defaultValue={offer?.positions ?? 1} required/>
              </div>
            </div></Panel>
            <Panel><div className={styles.stack}><h2>Conditions du poste</h2><div className={styles.fields}>
              {conditions.map(([name,label,required]) => <OfferField key={name} label={label} name={name}
                required={required} maxLength={180} defaultValue={offer?.[name] ?? ""}/>)}
              <Field label="Date de début (facultatif)"><input name="startDate" type="date" defaultValue={offer?.startDate ?? ""}/></Field>
            </div></div></Panel>
            <Panel><div className={styles.stack}><h2>Contenu de l’annonce</h2>
              <OfferField label="Description du poste" name="description" multiline required maxLength={12000} defaultValue={offer?.description}/>
              {(Object.keys(sectionFields) as (keyof typeof sectionFields)[]).map(key =>
                <OfferListEditor key={key} name={key} label={sectionFields[key]} initial={offer?.[key]}/>)}
            </div></Panel>
          </div>
          <aside className={styles.stack} aria-label="Options de l’offre">
            <Panel><div className={styles.stack}><h2>Publication</h2>
              {offer && <OfferStatus offer={offer}/>}
              <p className={styles.note}>Les dates sont exprimées à l’heure d’Abidjan.</p>
              <Field label="Date limite (facultatif)"><input name="deadline" type="datetime-local" defaultValue={optionalDate(offer?.deadline)}/></Field>
              <Check name="featured" checked={offer?.featured}>Offre à la une</Check>
              <div className={styles.actions}>
                <button className={styles.primary}>{offer ? "Enregistrer les modifications" : "Enregistrer le brouillon"}</button>
                {detail && <a href={`${detail}&preview=1`} target="_blank" rel="noopener" className={styles.button}>
                  Prévisualiser la version enregistrée
                </a>}
              </div>
              {offer && <div className={listStyles.publicationControls}><PublicationActions key={offer.publishedAt} offer={offer}/></div>}
            </div></Panel>
            <Panel><div className={styles.stack}><h2>Recruteur</h2>
              <OfferRecruiter profiles={recruiters} initial={offer?.recruiterId ?? (recruiters.length === 1 ? recruiters[0].id : "")}/>
            </div></Panel>
            <Panel><div className={styles.stack}><h2>Documents demandés</h2>
              <p>CV obligatoire</p><Check name="coverLetterRequired" checked={offer?.coverLetterRequired}>Lettre de motivation obligatoire</Check>
            </div></Panel>
            <Panel><div className={styles.stack}><h2>Image de mise en avant</h2>
              <Field label="Chemin public de l’image (facultatif)"><input name="imageUrl" maxLength={500} placeholder="/images/exemple.webp" defaultValue={offer?.imageUrl ?? ""}/></Field>
            </div></Panel>
            <Panel><div className={styles.stack}><h2>Documents publics</h2>
              <OfferListEditor name="attachments" label="Chemins des fichiers publics" initial={offer?.attachments} limit={10}/>
            </div></Panel>
          </aside>
        </div>
      </Mutation>
      {offer && <>
        <Mutation key={offer.slug} formId={publicationForm} resource="offres" action="publish" data={{slug:offer.slug}} protectChanges
          confirm={`Appliquer cette action de publication à la version enregistrée de « ${offer.title} » ?`}/>
        <Panel><div className={styles.stack}><h2 id="duplication-offre">Duplication</h2>
          <Mutation resource="offres" action="duplicate" data={{slug:offer.slug}} button="Dupliquer en brouillon"
            confirm="Dupliquer la version enregistrée et quitter cette fiche ? Les modifications non enregistrées seront perdues."
            returnTo={`${offersPath}?slug={slug}`}/>
        </div></Panel>
        <Panel><div className={styles.stack}><h2 id="suppression-offre">Suppression</h2>
          {offer.publishedAt
            ? <p className={styles.note}>Dépubliez l’offre avant de la supprimer.</p>
            : <Mutation resource="offres" action="delete" data={{slug:offer.slug}} button="Supprimer l’offre"
              confirm="Supprimer cette offre et la retirer des listes ?" returnTo={offersPath}>
              <Field label={`Saisissez le slug « ${offer.slug} » pour confirmer la suppression`}>
                <input name="confirmation" required autoComplete="off" maxLength={140} spellCheck={false}/>
              </Field>
            </Mutation>}
        </div></Panel>
      </>}
    </> : <Panel><p className={styles.note}>La création est réservée à l’administration.</p></Panel>}
  </div>;
}

function RecruiterFields({ person }: {person?:RecruiterProfile}) {
  return <div className={styles.fields}>
    <Field label="Prénom"><input name="firstName" defaultValue={person?.firstName} autoComplete="off" required maxLength={100}/></Field>
    <Field label="Nom"><input name="lastName" defaultValue={person?.lastName} autoComplete="off" required maxLength={100}/></Field>
    <Field label="Poste ou fonction"><input name="role" defaultValue={person?.role} required maxLength={180}/></Field>
    <Field label="Entreprise"><input value="Hopla Groupe" readOnly/></Field>
  </div>;
}

export function RecruiterAdd() {
  return <RecruiterDialog primary label="Ajouter un recruteur" title="Ajouter un recruteur">
    <Mutation resource="recruteurs" action="create" button="Ajouter le profil"><RecruiterFields/></Mutation>
  </RecruiterDialog>;
}

export function Recruiters({ profiles }: {profiles:RecruiterProfile[]}) {
  return <div className={styles.stack}>
    {profiles.length ? <div className={listStyles.profiles}>{profiles.map(person => <Panel key={person.id}>
      <div className={listStyles.profileCard}>
        <div className={listStyles.profile}><span className={styles.avatar} aria-hidden="true">{person.initials}</span>
          <div><h2>{person.firstName} {person.lastName}</h2><p>{person.role} · Hopla Groupe</p>
            <p className={styles.note}>{person.offerCount} offre{person.offerCount === 1 ? "" : "s"} associée{person.offerCount === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <RecruiterDialog label="Modifier" title={`Modifier ${person.firstName} ${person.lastName}`}>
            <Mutation resource="recruteurs" action="update" data={{id:person.id}} button="Enregistrer le profil"><RecruiterFields person={person}/></Mutation>
          </RecruiterDialog>
          {person.offerCount > 0 ? <RecruiterDialog danger label="Supprimer" title="Réattribuer les offres avant suppression">
            {profiles.length > 1 ? <Mutation resource="recruteurs" action="reassign" data={{id:person.id}} button="Réattribuer les offres"
              confirm="Réattribuer les offres associées à ce profil ?">
              <Field label="Attribuer ses offres à"><select name="replacementId" required defaultValue="">
                <option value="" disabled>Choisir un recruteur</option>{profiles.filter(profile=>profile.id!==person.id).map(profile=>
                  <option key={profile.id} value={profile.id}>{profile.firstName} {profile.lastName}</option>)}
              </select></Field>
            </Mutation> : <p className={styles.note}>Ajoutez un autre recruteur pour pouvoir réattribuer les offres.</p>}
          </RecruiterDialog> : <Mutation resource="recruteurs" action="delete" data={{id:person.id,confirmation:true}}
            confirm="Supprimer définitivement ce profil de recrutement ?">
            <button className={styles.danger}>Supprimer</button>
          </Mutation>}
        </div>
      </div>
    </Panel>)}</div> : <Panel><div className={styles.stack}><p className={styles.note}>Aucun profil recruteur enregistré.</p>
    </div></Panel>}
  </div>;
}
