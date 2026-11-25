import { getJob } from "@/modules/recrutement/server/jobs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const headers = { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" };
  try {
    const job = await getJob((await params).slug);
    return job
      ? Response.json(job, { headers })
      : Response.json({ message: "Offre introuvable." }, { status: 404, headers });
  } catch {
    return Response.json({ message: "Offre temporairement indisponible." }, { status: 503, headers });
  }
}
