export function publicOffersEnabled() {
  return process.env.RECRUTEMENT_OFFRES_ENABLED === "true";
}

export function publicApplicationsEnabled() {
  return process.env.RECRUTEMENT_CANDIDATURES_ENABLED === "true";
}

export function publicRecruitmentEnabled() {
  return publicOffersEnabled() || publicApplicationsEnabled();
}
