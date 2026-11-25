import { issueDownload, readDownload } from "@/modules/recrutement/server/downloads";
import { applicationError } from "@/modules/recrutement/server/security";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    return await issueDownload(request, (await context.params).id);
  } catch (error) {
    return applicationError(error);
  }
}

export async function GET(request: Request, context: Context) {
  try {
    return await readDownload(request, (await context.params).id);
  } catch (error) {
    return applicationError(error);
  }
}

