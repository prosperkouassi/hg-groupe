import pool from "@/lib/db";

/* =========================================================
   TYPES COMMUNS
========================================================= */

export type ProjectDomain = {
  id: number;
  name: string;
  slug: string;
};

export type ProjectCategory = {
  id: number;
  name: string;
  slug: string;
};

/* =========================================================
   TYPES — ADMIN
========================================================= */

export type AdminProject = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  projectYear: number | null;

  coverImage: string | null;
  coverImageAlt: string | null;

  status: "draft" | "published";
  displayOrder: number;

  domain: ProjectDomain;
  categories: ProjectCategory[];
};

export type AdminProjectDetail = {
  id: number;
  title: string;
  slug: string;

  /*
   * On conserve les deux formes pour compatibilité :
   *
   * project.domain.id
   * project.domainId
   */
  domain: ProjectDomain;
  domainId: number;

  categories: ProjectCategory[];
  categoryIds: number[];

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

  status: "draft" | "published";
  displayOrder: number;

  seoTitle: string | null;
  seoDescription: string | null;
};

type AdminProjectRow = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  project_year: number | null;

  cover_image: string | null;
  cover_image_alt: string | null;

  status: "draft" | "published";
  display_order: number;

  domain_id: number;
  domain_name: string;
  domain_slug: string;
};

type AdminProjectDetailRow = {
  id: number;
  title: string;
  slug: string;

  domain_id: number;
  domain_name: string;
  domain_slug: string;

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

  status: "draft" | "published";
  display_order: number;

  seo_title: string | null;
  seo_description: string | null;
};

type AdminCategoryRow = {
  project_id: number;
  id: number;
  name: string;
  slug: string;
};

/* =========================================================
   TYPES — ARCHIVE PUBLIQUE
========================================================= */

export type PublishedProject = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  projectYear: number | null;

  introduction: string | null;

  coverImage: string | null;
  coverImageAlt: string | null;

  displayOrder: number;

  domainId: number;
  domainName: string;
  domainSlug: string;

  categoryIds: number[];
  categories: ProjectCategory[];
};

type PublishedProjectRow = {
  id: number;
  title: string;
  slug: string;

  client: string | null;
  project_year: number | null;

  introduction: string | null;

  cover_image: string | null;
  cover_image_alt: string | null;

  display_order: number;

  domain_id: number;
  domain_name: string;
  domain_slug: string;
};

type PublishedProjectCategoryRow = {
  project_id: number;
  id: number;
  name: string;
  slug: string;
};

/* =========================================================
   TYPES — DÉTAIL PUBLIC
========================================================= */

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

  domain: ProjectDomain;
  categories: ProjectCategory[];

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

/* =========================================================
   TYPES — NAVIGATION PROJETS
========================================================= */

export type ProjectNavigationItem = {
  id: number;
  slug: string;
};

export type ProjectNavigation = {
  previous: ProjectNavigationItem | null;
  next: ProjectNavigationItem | null;
};

type ProjectNavigationRow = {
  id: number;
  slug: string;
};

/* =========================================================
   ADMIN — LISTE DES PROJETS
========================================================= */

export async function getAdminProjects(): Promise<
  AdminProject[]
> {
  const [projectRows] = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.client,
        p.project_year,
        p.cover_image,
        p.cover_image_alt,
        p.status,
        p.display_order,

        d.id AS domain_id,
        d.name AS domain_name,
        d.slug AS domain_slug

      FROM projects p

      INNER JOIN domains d
        ON d.id = p.domain_id

      ORDER BY
        p.display_order ASC,
        p.created_at DESC,
        p.id DESC
    `
  );

  const projects =
    projectRows as AdminProjectRow[];

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map(
    (project) => project.id
  );

  const placeholders = projectIds
    .map(() => "?")
    .join(", ");

  const [categoryRows] = await pool.query(
    `
      SELECT
        pc.project_id,
        c.id,
        c.name,
        c.slug

      FROM project_categories pc

      INNER JOIN categories c
        ON c.id = pc.category_id

      WHERE pc.project_id IN (${placeholders})

      ORDER BY
        c.name ASC,
        c.id ASC
    `,
    projectIds
  );

  const categories =
    categoryRows as AdminCategoryRow[];

  const categoriesByProject =
    new Map<
      number,
      ProjectCategory[]
    >();

  for (const category of categories) {
    const current =
      categoriesByProject.get(
        category.project_id
      ) ?? [];

    current.push({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });

    categoriesByProject.set(
      category.project_id,
      current
    );
  }

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,

    client: project.client,
    projectYear:
      project.project_year,

    coverImage:
      project.cover_image,
    coverImageAlt:
      project.cover_image_alt,

    status: project.status,
    displayOrder:
      project.display_order,

    domain: {
      id: project.domain_id,
      name: project.domain_name,
      slug: project.domain_slug,
    },

    categories:
      categoriesByProject.get(
        project.id
      ) ?? [],
  }));
}

/* =========================================================
   ADMIN — UN PROJET PAR ID
========================================================= */

export async function getAdminProjectById(
  projectId: number
): Promise<AdminProjectDetail | null> {
  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    return null;
  }

  const [projectRows] = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.slug,

        p.domain_id,

        d.name AS domain_name,
        d.slug AS domain_slug,

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

        p.status,
        p.display_order,

        p.seo_title,
        p.seo_description

      FROM projects p

      INNER JOIN domains d
        ON d.id = p.domain_id

      WHERE p.id = ?

      LIMIT 1
    `,
    [projectId]
  );

  const project = (
    projectRows as AdminProjectDetailRow[]
  )[0];

  if (!project) {
    return null;
  }

  const [categoryRows] =
    await pool.query(
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
          c.name ASC,
          c.id ASC
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

  const categoryIds =
    categories.map(
      (category) => category.id
    );

  return {
    id: project.id,

    title: project.title,
    slug: project.slug,

    domain: {
      id: project.domain_id,
      name: project.domain_name,
      slug: project.domain_slug,
    },

    domainId: project.domain_id,

    categories,
    categoryIds,

    client: project.client,
    projectYear:
      project.project_year,

    introduction:
      project.introduction,
    context: project.context,
    mission: project.mission,
    objectives: project.objectives,
    solution: project.solution,
    results: project.results,

    externalUrl:
      project.external_url,

    coverImage:
      project.cover_image,
    coverImageAlt:
      project.cover_image_alt,

    status: project.status,
    displayOrder:
      project.display_order,

    seoTitle: project.seo_title,
    seoDescription:
      project.seo_description,
  };
}

/* =========================================================
   PUBLIC — ARCHIVE
========================================================= */

export async function getPublishedProjects(): Promise<
  PublishedProject[]
> {
  const [projectRows] = await pool.query(
    `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.client,
        p.project_year,
        p.introduction,
        p.cover_image,
        p.cover_image_alt,
        p.display_order,

        d.id AS domain_id,
        d.name AS domain_name,
        d.slug AS domain_slug

      FROM projects p

      INNER JOIN domains d
        ON d.id = p.domain_id

      WHERE p.status = 'published'

      ORDER BY
        p.display_order ASC,
        p.project_year DESC,
        p.id DESC
    `
  );

  const projects =
    projectRows as PublishedProjectRow[];

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map(
    (project) => project.id
  );

  const placeholders = projectIds
    .map(() => "?")
    .join(", ");

  const [categoryRows] =
    await pool.query(
      `
        SELECT
          pc.project_id,
          c.id,
          c.name,
          c.slug

        FROM project_categories pc

        INNER JOIN categories c
          ON c.id = pc.category_id

        WHERE pc.project_id IN (${placeholders})

        ORDER BY
          c.name ASC,
          c.id ASC
      `,
      projectIds
    );

  const categories =
    categoryRows as PublishedProjectCategoryRow[];

  const categoriesByProject =
    new Map<
      number,
      ProjectCategory[]
    >();

  for (const category of categories) {
    const current =
      categoriesByProject.get(
        category.project_id
      ) ?? [];

    current.push({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });

    categoriesByProject.set(
      category.project_id,
      current
    );
  }

  return projects.map((project) => {
    const projectCategories =
      categoriesByProject.get(
        project.id
      ) ?? [];

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,

      client: project.client,
      projectYear:
        project.project_year,

      introduction:
        project.introduction,

      coverImage:
        project.cover_image,
      coverImageAlt:
        project.cover_image_alt,

      displayOrder:
        project.display_order,

      domainId: project.domain_id,
      domainName:
        project.domain_name,
      domainSlug:
        project.domain_slug,

      categoryIds:
        projectCategories.map(
          (category) =>
            category.id
        ),

      categories:
        projectCategories,
    };
  });
}

/* =========================================================
   PUBLIC — DÉTAIL PAR SLUG
========================================================= */

export async function getPublishedProjectBySlug(
  slug: string
): Promise<PublishedProjectDetail | null> {
  const cleanSlug = slug.trim();

  if (!cleanSlug) {
    return null;
  }

  const [projectRows] =
    await pool.query(
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

  const [categoryRows] =
    await pool.query(
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
          c.name ASC,
          c.id ASC
      `,
      [project.id]
    );

  const [imageRows] =
    await pool.query(
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

    layoutType:
      image.layout_type,
    displayOrder:
      image.display_order,
  }));

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,

    client: project.client,
    projectYear:
      project.project_year,

    introduction:
      project.introduction,
    context: project.context,
    mission: project.mission,
    objectives:
      project.objectives,
    solution: project.solution,
    results: project.results,

    externalUrl:
      project.external_url,

    coverImage:
      project.cover_image,
    coverImageAlt:
      project.cover_image_alt,

    seoTitle: project.seo_title,
    seoDescription:
      project.seo_description,

    domain: {
      id: project.domain_id,
      name: project.domain_name,
      slug: project.domain_slug,
    },

    categories,

    images,
  };
}

/* =========================================================
   PUBLIC — NAVIGATION PRÉCÉDENT / SUIVANT
========================================================= */

export async function getPublishedProjectNavigation(
  currentProjectId: number
): Promise<ProjectNavigation> {
  if (
    !Number.isInteger(
      currentProjectId
    ) ||
    currentProjectId <= 0
  ) {
    return {
      previous: null,
      next: null,
    };
  }

  const [projectRows] =
    await pool.query(
      `
        SELECT
          p.id,
          p.slug

        FROM projects p

        WHERE p.status = 'published'

        ORDER BY
          p.display_order ASC,
          p.project_year DESC,
          p.id DESC
      `
    );

  const projects =
    projectRows as ProjectNavigationRow[];

  const currentIndex =
    projects.findIndex(
      (project) =>
        project.id ===
        currentProjectId
    );

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null,
    };
  }

  const previousProject =
    currentIndex > 0
      ? projects[currentIndex - 1]
      : null;

  const nextProject =
    currentIndex <
    projects.length - 1
      ? projects[currentIndex + 1]
      : null;

  return {
    previous: previousProject
      ? {
          id: previousProject.id,
          slug: previousProject.slug,
        }
      : null,

    next: nextProject
      ? {
          id: nextProject.id,
          slug: nextProject.slug,
        }
      : null,
  };
}