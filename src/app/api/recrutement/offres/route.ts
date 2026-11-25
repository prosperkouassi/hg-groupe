import { getJobs, parsePage } from "@/modules/recrutement/server/jobs";

export async function GET(request: Request) {
  const page = parsePage(new URL(request.url).searchParams.get("page"));
  const result = await getJobs(page);
  return Response.json(result, {
    status: result.unavailable ? 503 : 200,
    headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
  });
}
