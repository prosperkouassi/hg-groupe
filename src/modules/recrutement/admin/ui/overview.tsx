import Link from "next/link";
import type { RecruitmentSettings } from "../settings";
import { Mutation, RetentionPreview } from "./actions";
import { base, Field, Panel } from "./common";
import { EmailTemplate } from "./email-template";
import styles from "./recruitment-admin.module.css";

export { Dashboard, type DashboardData } from "./dashboard";

const categories = {
  messagerie: ["Messagerie", "Configurez l’expédition et les destinataires des notifications."],
  modeles: ["Modèles d’e-mails", "Personnalisez les messages envoyés aux candidats et à l’administration."],
  candidatures: ["Candidatures", "Définissez le consentement et les limites des documents et liens de confirmation."],
  securite: ["Sécurité et antispam", "Réglez les quotas de soumission dans les limites de sécurité du service."],
  conservation: ["Conservation des données", "Définissez la durée de conservation et estimez les dossiers concernés."],
} as const;
type Category = keyof typeof categories;

export function Settings({ settings, tab }: {settings: RecruitmentSettings; tab?: string}) {
  const category = tab && Object.hasOwn(categories, tab) ? tab as Category : "messagerie";
  const [title, description] = categories[category];
  const emailFields = [
    ["sender", "Adresse d’expédition autorisée"],
    ["additionalRecipient", "Destinataire supplémentaire"],
  ] as const;

  return <div className={styles.settingsLayout}>
    <nav aria-label="Catégories de réglages" className={styles.settingsMenu}>
      {(Object.keys(categories) as Category[]).map(key =>
        <Link key={key} href={`${base}/reglages?tab=${key}`} aria-current={category === key ? "page" : undefined}>
          {categories[key][0]}
        </Link>
      )}
    </nav>
    <div className={styles.stack}>
      <Panel>
        <div className={styles.settingsHeading}>
          <h2>{title}</h2><p className={styles.note}>{description}</p>
        </div>
        <Mutation key={category} resource="reglages" action="save" button="Enregistrer cette catégorie" transform="settings" protectChanges>
          <input type="hidden" name="category" value={category}/>
          {category === "messagerie" && <>
            <div className={styles.fields}>
              <Field label="Adresse de l’administration">
                <input type="email" value={settings.administratorEmail} readOnly placeholder="Non configurée"/>
              </Field>
              {emailFields.map(([key, label]) => <Field key={key} label={label}>
                <input name={key} type="email" defaultValue={settings[key]} maxLength={254} spellCheck={false} autoComplete="off"/>
              </Field>)}
              <div><strong>État du destinataire enregistré</strong><p className={styles.note}>
                {settings.additionalRecipient && settings.additionalRecipientConfirmed ? "Vérifié" : "En attente de vérification"}
              </p></div>
            </div>
            <p className={styles.note}>L’exploitant configure l’adresse de l’administration et vérifie chaque adresse supplémentaire avant d’autoriser son utilisation.</p>
            <Field label="Signature des e-mails"><textarea name="signature" defaultValue={settings.signature} required maxLength={1200} rows={3}/></Field>
          </>}
          {category === "modeles" && <>
            <EmailTemplate kind="verification" title="Vérification de l’adresse e-mail" subject={settings.verificationSubject} body={settings.verificationBody} signature={settings.signature}/>
            <EmailTemplate kind="recruiter" title="Notification à l’administration" subject={settings.recruiterSubject} body={settings.recruiterBody} signature={settings.signature}/>
            <EmailTemplate kind="candidate" title="Confirmation de transmission au candidat" subject={settings.candidateSubject} body={settings.candidateBody} signature={settings.signature}/>
          </>}
          {category === "candidatures" && <>
            <Field label="Texte de consentement"><textarea name="consentText" defaultValue={settings.consentText} rows={3} maxLength={1000} required/></Field>
            <fieldset><legend>Formats autorisés</legend>
              <div className={styles.actions}>
                {["pdf", "doc", "docx"].map(format => <label className={styles.check} key={format}>
                  <input name="allowedFormats" type="checkbox" value={format} defaultChecked={settings.allowedFormats.some(value => value === format)}/>{format.toUpperCase()}
                </label>)}
              </div>
            </fieldset>
            <div className={styles.fields}>
              <Field label="Taille maximale par document (Mio)"><input name="maxFileMiB" type="number" min={1} max={5} defaultValue={settings.maxFileMiB} required/></Field>
              <Field label="Validité du lien de confirmation (heures)"><input name="confirmationHours" type="number" min={1} max={48} defaultValue={settings.confirmationHours} required/></Field>
            </div>
            <p className={styles.note}>Offres publiques {process.env.RECRUTEMENT_OFFRES_ENABLED === "true" ? "activées" : "désactivées"} · Réception des candidatures {process.env.RECRUTEMENT_CANDIDATURES_ENABLED === "true" ? "activée" : "désactivée"}</p>
          </>}
          {category === "securite" && <>
            <div className={styles.fields}>
              <Field label="Quota par adresse IP (10 minutes)"><input name="ipLimit" type="number" min={1} max={12} defaultValue={settings.ipLimit} required aria-describedby="ip-quota-hint"/></Field>
              <Field label="Quota par adresse e-mail (1 heure)"><input name="emailLimit" type="number" min={1} max={3} defaultValue={settings.emailLimit} required aria-describedby="email-quota-hint"/></Field>
              <p id="ip-quota-hint" className={styles.note}>Nombre maximal de soumissions associées à une même adresse IP.</p>
              <p id="email-quota-hint" className={styles.note}>Nombre maximal de soumissions associées à une même adresse e-mail.</p>
            </div>
            <p className={styles.note}>Le champ piège et les limites de vérification des liens restent imposés lorsque les candidatures sont actives.</p>
          </>}
          {category === "conservation" && <>
            <Field label="Durée de conservation (jours)"><input name="retentionDays" type="number" min={1} max={730} defaultValue={settings.retentionDays} required/></Field>
            <Field label="Règle à la fin de la conservation">
              <select name="retentionPolicy" defaultValue={settings.anonymize ? "anonymize" : settings.automaticDeletion ? "delete" : ""}>
                <option value="">Non configurée</option>
                <option value="anonymize">Anonymisation</option>
                <option value="delete">Suppression</option>
              </select>
            </Field>
            <p className={styles.note}>Les opérations automatiques de nettoyage sont désactivées.</p>
          </>}
        </Mutation>
      </Panel>
      {category === "conservation" && <Panel><div className={styles.stack}>
        <h2>Estimation des dossiers concernés</h2><p className={styles.note}>Le calcul utilise la dernière durée enregistrée.</p><RetentionPreview/>
      </div></Panel>}
    </div>
  </div>;
}
