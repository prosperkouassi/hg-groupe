"use client";

import { useState } from "react";
import { Field } from "./common";
import styles from "./recruitment-admin.module.css";

type Kind = "verification" | "recruiter" | "candidate";
const intro = {
  verification: "Votre candidature au poste « Chef de projet ».",
  recruiter: "",
  candidate: "Votre candidature au poste « Chef de projet » a bien été transmise.",
};
const details = {
  verification: "Valider mon e-mail · lien individuel ajouté lors de l’envoi",
  recruiter: "Camille Exemple — Chef de projet\nType : candidature sur offre\nEspace sécurisé · lien individuel ajouté lors de l’envoi",
  candidate: "",
};

export function EmailTemplate({ kind, title, subject, body, signature }: {
  kind: Kind; title: string; subject: string; body: string; signature: string;
}) {
  const [previewSubject, setSubject] = useState(subject);
  const [previewBody, setBody] = useState(body);
  return <fieldset className={styles.template}>
    <legend>{title}</legend>
    <div className={styles.stack}>
      <Field label="Objet"><input name={`${kind}Subject`} value={previewSubject} onChange={event => setSubject(event.target.value)} maxLength={180} required/></Field>
      <Field label="Contenu"><textarea name={`${kind}Body`} value={previewBody} onChange={event => setBody(event.target.value)} rows={4} maxLength={6000} required/></Field>
      <p className={styles.note}>{kind === "recruiter" ? "Variable disponible dans l’objet : [Poste]." : "Les informations du dossier sont ajoutées automatiquement."}</p>
      <details className={styles.templatePreview}>
        <summary>Aperçu avec un dossier fictif</summary>
        <p><strong>{kind === "recruiter" ? previewSubject.replaceAll("[Poste]", "Chef de projet") : previewSubject}</strong></p>
        <p className={styles.preline}>{[intro[kind], previewBody, details[kind], signature].filter(Boolean).join("\n\n")}</p>
      </details>
    </div>
  </fieldset>;
}
