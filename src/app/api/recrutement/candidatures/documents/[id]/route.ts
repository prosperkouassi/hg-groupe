import { issueAdminDocument, readAdminDocument } from "@/modules/recrutement/admin/applications";
import { getRecruitmentActor, RecruitmentAdminError } from "@/modules/recrutement/admin/permissions";
import { ApplicationError, applicationError, verifyOrigin } from "@/modules/recrutement/server/security";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

function unavailable() {
  return new ApplicationError(404, "Document indisponible.");
}

function documentError(error: unknown) {
  if (error instanceof RecruitmentAdminError && (error.status === 401 || error.status === 403)) {
    return applicationError(unavailable());
  }
  if (error instanceof ApplicationError && error.status === 404) return applicationError(unavailable());
  return applicationError(error);
}

export async function POST(request: Request, context: Context) {
  try {
    verifyOrigin(request);
    const { actor } = await getRecruitmentActor();
    const { id } = await context.params;
    const { ticket, expiresIn } = await issueAdminDocument(actor, id);
    return Response.json({ url: `/api/recrutement/candidatures/documents/${id}#ticket=${ticket}`, expiresIn }, {
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return documentError(error);
  }
}

export async function GET(request: Request, context: Context) {
  try {
    const ticket = (request.headers.get("authorization") ?? "").match(/^Bearer (\S+)$/)?.[1];
    if (!ticket) throw unavailable();
    const { actor } = await getRecruitmentActor();
    return await readAdminDocument(actor, (await context.params).id, ticket);
  } catch (error) {
    return documentError(error);
  }
}

