import type { Metadata } from "next";

export function recruitmentMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [{ url: "/images/og-hopla-groupe.jpg", width: 1200, height: 630, alt: "Hopla Groupe" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-hopla-groupe.jpg"],
    },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}
