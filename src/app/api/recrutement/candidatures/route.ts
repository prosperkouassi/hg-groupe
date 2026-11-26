import { loadRecruitmentSettings } from "@/modules/recrutement/admin/settings";
import { submitApplication } from "@/modules/recrutement/server/applications";
import { applicationError } from "@/modules/recrutement/server/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    return await submitApplication(request, loadRecruitmentSettings);
  } catch (error) {
    return applicationError(error);
  }
}
