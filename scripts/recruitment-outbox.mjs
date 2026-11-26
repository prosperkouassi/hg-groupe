const endpoint = "https://hoplagroupe.com/api/recrutement/candidatures/notifications";

async function main() {
  if (process.env.RECRUTEMENT_CANDIDATURES_ENABLED !== "true") {
    console.log("Réception des candidatures désactivée. Aucun appel.");
    return;
  }

  const secret = process.env.RECRUTEMENT_OUTBOX_SECRET;
  if (!secret || secret.length < 32 || secret !== secret.trim() || /[\r\n]/.test(secret)) {
    console.error("Secret du planificateur absent ou invalide.");
    process.exitCode = 1;
    return;
  }

  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    console.error("La vérification du certificat TLS doit rester activée.");
    process.exitCode = 1;
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      redirect: "error",
      signal: AbortSignal.timeout(90_000),
    });
    await response.body?.cancel();

    if (!response.ok) {
      console.error(`Traitement des notifications refusé ou indisponible (HTTP ${response.status}).`);
      process.exitCode = 1;
      return;
    }

    console.log("Passage du planificateur Recrutement terminé.");
  } catch {
    console.error("Appel au planificateur Recrutement interrompu.");
    process.exitCode = 1;
  }
}

await main();
