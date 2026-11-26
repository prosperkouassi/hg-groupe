import { getJobs, parsePage } from "@/modules/recrutement/server/jobs";
import { publicOffersEnabled } from "@/modules/recrutement/public-visibility";

export async function GET(request: Request) {
  const headers = { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" };
  if (!publicOffersEnabled()) {
    return Response.json({ message: "Offres indisponibles." }, { status: 404, headers });
  }
  const page = parsePage(new URL(request.url).searchParams.get("page"));
  const result = await getJobs(page);
  return Response.json(result, {
    status: result.unavailable ? 503 : 200,
    headers,
  });
}
