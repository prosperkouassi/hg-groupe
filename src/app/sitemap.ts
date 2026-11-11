import type { MetadataRoute } from "next";

// Query publication state on each request; do not cache a database outage.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hoplagroupe.com";

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/expertises`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cas-etudes`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/a-propos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const projects = await Promise.race([
      // Import inside the guard: missing database configuration must also fall back.
      import("@/lib/projects").then(({ getPublishedProjects }) =>
        getPublishedProjects()
      ),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Sitemap timeout")), 5000);
      }),
    ]);

    const slugs = new Set(
      projects
        .map((project) => project.slug)
        // Match the slug format accepted by the project administration API.
        .filter((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    );

    for (const slug of slugs) {
      pages.push({ url: `${baseUrl}/cas-etudes/${slug}` });
    }
  } catch {
    // Never log query errors, credentials or project data in this public route.
    console.warn("Sitemap: études de cas indisponibles ; pages publiques uniquement.");
  } finally {
    clearTimeout(timeout);
  }

  pages.push({ url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 });
  try {
    const { publishedSitemap } = await import('@/lib/blog/data');
    const articles = await publishedSitemap();
    for (const article of articles) {
      if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) pages.push({ url: `${baseUrl}/blog/${article.slug}`, lastModified: article.modified });
    }
  } catch { console.warn('Sitemap : articles indisponibles.'); }
  return pages;
}
