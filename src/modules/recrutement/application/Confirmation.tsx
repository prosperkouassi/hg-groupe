"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./confirmation.module.css";

export default function Confirmation() {
  const [phase, setPhase] = useState<"ready" | "expired" | "validated" | "resent">("ready");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setMessage("Ouvrez le lien reçu par e-mail pour confirmer votre candidature.");
      return;
    }

    setPending(true);
    setMessage("");
    const resend = phase === "expired";
    try {
      const response = await fetch(`/api/recrutement/candidatures/${resend ? "renvoyer" : "valider"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (response.ok) {
        setPhase(resend ? "resent" : "validated");
        window.history.replaceState(null, "", window.location.pathname);
      } else if (response.status === 410 && !resend) {
        setPhase("expired");
      }
      setMessage(typeof result.message === "string" ? result.message : "La demande n’a pas abouti.");
    } catch {
      setMessage("Le service est temporairement indisponible. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  const finished = phase === "validated" || phase === "resent";
  return (
    <section className={styles.section}>
      <div className={`container-hopla ${styles.content}`}>
        <h2 className="font-display">
          {phase === "validated" ? "Candidature validée" : phase === "resent" ? "Nouveau lien demandé" : "Valider mon e-mail"}
        </h2>
        {phase === "ready" && <p>Confirmez votre adresse e-mail pour que votre candidature puisse être transmise à l’équipe de recrutement.</p>}
        <p aria-live="polite">{message}</p>
        {finished ? (
          <Link href="/recrutement" className={styles.button}>Retour aux offres</Link>
        ) : (
          <button type="button" onClick={submit} disabled={pending} className={styles.button}>
            {pending ? "Traitement en cours…" : phase === "expired" ? "Demander un nouveau lien" : "Valider mon e-mail"}
          </button>
        )}
      </div>
    </section>
  );
}
