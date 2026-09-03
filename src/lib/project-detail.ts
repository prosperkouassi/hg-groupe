import pool from "@/lib/db";

export type PublishedProjectImage = {
  id: number;
  imagePath: string;
  altText: string | null;
  caption: string | null;
  layoutType:
    | "full"
    | "half"
    | "large"
    | "portrait";
  displayOrder: number;
};

export type PublishedProjectDetail = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  projectYear: number | null;

  introduction: string | null;
  context: string | null;
  mission: string | null;
  objectives: string | null;
  solution: string | null;
  results: string | null;

  externalUrl: string | null;

  coverImage: string | null;
  coverImageAlt: string | null;

  seoTitle: string | null;
  seoDescription: string | null;

  domain: {
    id: number;
    name: string;
    slug: string;
  };

  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;

  images: PublishedProjectImage[];
};

type ProjectDetailRow = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  project_year: number | null;

  introduction: string | null;
  context: string | null;
  mission: string | null;
  objectives: string | null;
  solution: string | null;
  results: string | null;

  external_url: string | null;

  cover_image: string | null;
  cover_image_alt: string | null;

  seo_title: string | null;
  seo_description: string | null;

  domain_id: number;
  domain_name: string;
  domain_slug: string;
};

type ProjectCategoryRow = {
  id: number;
  name: string;
  slug: string;
};

type ProjectImageRow = {
  id: number;
  image_path: string;
  alt_text: string | null;
  caption: string | null;

  layout_type:
    | "full"
    | "half"
    | "large"
    | "portrait";

  display_order: number;
};

export async function getPublishedProjectDetail(
  slug: string
): Promise<PublishedProjectDetail | null> {
  const cleanSlug = slug.trim();

  if (!cleanSlug) {
    return null;
  }

  const [projectRows] = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.client,
        p.project_year,
        p.introduction,
        p.context,
        p.mission,
        p.objectives,
        p.solution,
        p.results,
        p.external_url,
        p.cover_image,
        p.cover_image_alt,
        p.seo_title,
        p.seo_description,

        d.id AS domain_id,
        d.name AS domain_name,
        d.slug AS domain_slug

      FROM projects p

      INNER JOIN domains d
        ON d.id = p.domain_id

      WHERE
        p.slug = ?
        AND p.status = 'published'

      LIMIT 1
    `,
    [cleanSlug]
  );

  const project = (
    projectRows as ProjectDetailRow[]
  )[0];

  if (!project) {
    return null;
  }

  const [categoryRows] = await pool.query(
    `
      SELECT
        c.id,
        c.name,
        c.slug

      FROM categories c

      INNER JOIN project_categories pc
        ON pc.category_id = c.id

      WHERE pc.project_id = ?

      ORDER BY
        c.name ASC
    `,
    [project.id]
  );

  const [imageRows] = await pool.query(
    `
      SELECT
        id,
        image_path,
        alt_text,
        caption,
        layout_type,
        display_order

      FROM project_images

      WHERE project_id = ?

      ORDER BY
        display_order ASC,
        id ASC
    `,
    [project.id]
  );

  const categories = (
    categoryRows as ProjectCategoryRow[]
  ).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));

  const images = (
    imageRows as ProjectImageRow[]
  ).map((image) => ({
    id: image.id,
    imagePath: image.image_path,
    altText: image.alt_text,
    caption: image.caption,
    layoutType: image.layout_type,
    displayOrder: image.display_order,
  }));

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,

    client: project.client,
    projectYear: project.project_year,

    introduction: project.introduction,
    context: project.context,
    mission: project.mission,
    objectives: project.objectives,
    solution: project.solution,
    results: project.results,

    externalUrl: project.external_url,

    coverImage: project.cover_image,
    coverImageAlt: project.cover_image_alt,

    seoTitle: project.seo_title,
    seoDescription: project.seo_description,

    domain: {
      id: project.domain_id,
      name: project.domain_name,
      slug: project.domain_slug,
    },

    categories,

    images,
  };
}