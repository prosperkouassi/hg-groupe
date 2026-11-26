import { redirect } from "next/navigation";

import { ApplicationError } from "../server/security";
import { getApplication, getApplicationDashboard, listApplications } from "./applications";
import { getOffer, getOfferDashboard, listOffers, listRecruiters, OfferError } from "./offers";
import { getRecruitmentActor, RecruitmentAdminError, requireRecruitmentRole, type Actor } from "./permissions";
import { readSettings } from "./settings";

export const sections = ["dashboard", "offres", "candidatures", "spontanees", "recruteurs", "reglages"] as const;
export type AdminSection = typeof sections[number];

export function formatAdminError(error: unknown) {
  if (error instanceof RecruitmentAdminError || error instanceof ApplicationError || error instanceof OfferError) {
    return { status: error.status, message: error.message };
  }
  return { status: 503, message: "Le service Recrutement est temporairement indisponible. Réessayez plus tard." };
}

async function getSection(actor: Actor, section: AdminSection, query: Record<string, string>) {
  switch (section) {
    case "dashboard": {
      const [applications, offers] = await Promise.all([
        getApplicationDashboard(actor),
        actor.role === "manager" ? { openOffers: 0, closedOffers: 0, draftOffers: 0, attentionOffers: [] }
          : getOfferDashboard(actor),
      ]);
      return { ...applications, ...offers };
    }
    case "offres": {
      requireRecruitmentRole(actor, "admin", "recruiter");
      if (query.new === "1") requireRecruitmentRole(actor, "admin");
      if (query.slug || query.new === "1") {
        const [offer, recruiters] = await Promise.all([
          query.slug ? getOffer(actor, query.slug) : null,
          listRecruiters(actor),
        ]);
        if (query.slug && !offer) throw new RecruitmentAdminError(404, "Offre introuvable.");
        return { offer, recruiters };
      }
      return listOffers(actor, query);
    }
    case "candidatures":
    case "spontanees": {
      if (section === "spontanees") requireRecruitmentRole(actor, "admin", "manager");
      const type = section === "candidatures" ? "job_application" : "spontaneous_application";
      if (query.id) {
        const application = await getApplication(actor, type, query.id);
        if (!application) throw new RecruitmentAdminError(404, "Candidature introuvable.");
        return application;
      }
      return listApplications(actor, type, query);
    }
    case "recruteurs":
      requireRecruitmentRole(actor, "admin");
      return listRecruiters(actor);
    case "reglages":
      return readSettings(actor);
  }
}

export async function getAdminPage(section: AdminSection, query: Record<string, string>) {
  let access;
  try {
    access = await getRecruitmentActor();
  } catch (error) {
    const failure = formatAdminError(error);
    if (failure.status === 401) redirect("/admin/connexion");
    return { admin: null, actor: null, unavailable: failure.status === 503, error: failure.message };
  }
  try {
    const data = await getSection(access.actor, section, query);
    return { ...access, data };
  } catch (error) {
    const failure = formatAdminError(error);
    return { ...access, unavailable: failure.status === 503, error: failure.message };
  }
}
