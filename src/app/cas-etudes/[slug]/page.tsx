import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CaseStudyDetail from "@/components/cases/CaseStudyDetail";

import {
  getPublishedProjectBySlug,
  getPublishedProjectNavigation,
} from "@/lib/projects";

type CaseStudyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;

  const project =
    await getPublishedProjectBySlug(slug);

  if (!project) {
    return {
      title:
        "Cas d’étude introuvable | Hopla Groupe",

      description:
        "Le cas d’étude demandé n’est pas disponible.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    project.seoTitle?.trim() ||
    `${project.title} | Hopla Groupe`;

  const description =
    project.seoDescription?.trim() ||
    project.introduction?.trim() ||
    `Découvrez le projet ${project.title} accompagné par Hopla Groupe.`;

  return {
    title,

    description,

    alternates: {
      canonical: `/cas-etudes/${project.slug}`,
    },

    openGraph: {
      title,

      description,

      url: `/cas-etudes/${project.slug}`,

      type: "article",

      images: project.coverImage
        ? [
            {
              url: project.coverImage,

              alt:
                project.coverImageAlt?.trim() ||
                project.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: project.coverImage
        ? [project.coverImage]
        : undefined,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: CaseStudyPageProps) {
  const { slug } = await params;

  const project =
    await getPublishedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const navigation =
    await getPublishedProjectNavigation(
      project.id
    );

  return (
    <CaseStudyDetail
      project={project}
      navigation={navigation}
    />
  );
}