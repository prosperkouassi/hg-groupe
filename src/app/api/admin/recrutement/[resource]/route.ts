import { checkWriteOrigin } from "@/lib/blog/write-origin";
import {
  exportApplications, issueAdminDocument, mutateApplication, readAdminDocument,
} from "@/modules/recrutement/admin/applications";
import { formatAdminError } from "@/modules/recrutement/admin/gateway";
import { mutateOffer, mutateRecruiter } from "@/modules/recrutement/admin/offers";
import { getRecruitmentActor, RecruitmentAdminError } from "@/modules/recrutement/admin/permissions";
import { previewRetention, saveSettings } from "@/modules/recrutement/admin/settings";
import { boundedBody } from "@/modules/recrutement/server/security";

export const runtime = "nodejs";

type Context = { params: Promise<{ resource: string }> };
const privateHeaders = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function reply(payload: unknown, status = 200) {
  return Response.json(payload, { status, headers: privateHeaders });
}

function failure(error: unknown) {
  const { message, status } = formatAdminError(error);
  return reply({ message }, status);
}

function applicationType(resource: string) {
  if (resource === "candidatures") return "job_application";
  if (resource === "spontanees") return "spontaneous_application";
  throw new RecruitmentAdminError(404, "Ressource introuvable.");
}

export async function GET(request: Request, { params }: Context) {
  try {
    const { actor } = await getRecruitmentActor();
    const { resource } = await params;
    const query = new URL(request.url).searchParams;
    if (resource === "documents") {
      const authorization = request.headers.get("authorization");
      if (!authorization?.startsWith("Bearer ")) throw new RecruitmentAdminError(403, "Ticket de téléchargement requis.");
      return await readAdminDocument(actor, query.get("id") ?? "", authorization.slice(7));
    }
    if (resource === "reglages" && query.get("preview") === "retention") {
      return reply(await previewRetention(actor));
    }
    const type = applicationType(resource);
    if (query.get("export") !== "csv") throw new RecruitmentAdminError(404, "Ressource introuvable.");
    return await exportApplications(actor, type, Object.fromEntries(query));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    if (!checkWriteOrigin(request, process.env.RECRUTEMENT_ORIGIN ?? process.env.BLOG_SITE_URL,
      process.env.NODE_ENV === "production").allowed) {
      throw new RecruitmentAdminError(403, "Origine de la requête refusée.");
    }
    const { actor } = await getRecruitmentActor();
    const { resource } = await params;
    if (resource === "documents") {
      return reply(await issueAdminDocument(actor, new URL(request.url).searchParams.get("id") ?? ""));
    }
    const bounded = await boundedBody(request, "application/json", 128 * 1024);
    const input: unknown = await bounded.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new RecruitmentAdminError(400, "Le contenu de la requête est invalide.");
    }
    const fields = input as Record<string, unknown>;
    if (resource === "offres") return reply(await mutateOffer(actor, fields));
    if (resource === "recruteurs") return reply(await mutateRecruiter(actor, fields));
    if (resource === "reglages" && fields.action === "save") return reply(await saveSettings(actor, fields));
    const type = applicationType(resource);
    return reply(await mutateApplication(actor, type, typeof fields.action === "string" ? fields.action : "", fields));
  } catch (error) {
    return failure(error);
  }
}
