import { processConfirmation } from "@/modules/recrutement/server/applications";
import { applicationError } from "@/modules/recrutement/server/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return await processConfirmation(request, "validate");
  } catch (error) {
    return applicationError(error);
  }
}

