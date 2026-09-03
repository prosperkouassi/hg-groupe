import { NextResponse } from "next/server";

import pool from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  domain_id: number;
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
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

type SlugRow = {
  id: number;
};

type ExistingProjectRow = {
  id: number;
  title: string;
};

function createSlugBase(slug: string) {
  return `${slug}-copie`;
}

/* =========================================================
   DUPLICATION
========================================================= */

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const session =
    await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "Non autorisé.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;
  const projectId = Number(id);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    return NextResponse.json(
      {
        error: "Projet invalide.",
      },
      {
        status: 400,
      }
    );
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [projectRows] =
      await connection.query(
        `
          SELECT
            id,
            title,
            slug,
            domain_id,
            client,
            project_year,
            introduction,
            context,
            mission,
            objectives,
            solution,
            results,
            external_url,
            cover_image,
            cover_image_alt,
            display_order,
            seo_title,
            seo_description

          FROM projects

          WHERE id = ?

          LIMIT 1
        `,
        [projectId]
      );

    const project = (
      projectRows as ProjectRow[]
    )[0];

    if (!project) {
      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "Le projet n’existe pas.",
        },
        {
          status: 404,
        }
      );
    }

    const slugBase =
      createSlugBase(project.slug);

    let duplicateSlug = slugBase;
    let suffix = 2;

    while (true) {
      const [existingRows] =
        await connection.query(
          `
            SELECT
              id

            FROM projects

            WHERE slug = ?

            LIMIT 1
          `,
          [duplicateSlug]
        );

      const existing =
        existingRows as SlugRow[];

      if (existing.length === 0) {
        break;
      }

      duplicateSlug =
        `${slugBase}-${suffix}`;

      suffix += 1;
    }

    const duplicateTitle =
      `${project.title} — Copie`;

    const [insertResult] =
      await connection.execute(
        `
          INSERT INTO projects (
            title,
            slug,
            domain_id,
            client,
            project_year,
            introduction,
            context,
            mission,
            objectives,
            solution,
            results,
            external_url,
            cover_image,
            cover_image_alt,
            status,
            display_order,
            seo_title,
            seo_description
          )

          VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, 'draft', ?,
            ?, ?
          )
        `,
        [
          duplicateTitle,
          duplicateSlug,
          project.domain_id,
          project.client,
          project.project_year,
          project.introduction,
          project.context,
          project.mission,
          project.objectives,
          project.solution,
          project.results,
          project.external_url,
          project.cover_image,
          project.cover_image_alt,
          project.display_order,
          project.seo_title,
          project.seo_description,
        ]
      );

    const newProjectId = (
      insertResult as {
        insertId: number;
      }
    ).insertId;

    /* =====================================================
       DUPLICATION DES CATÉGORIES
    ====================================================== */

    await connection.execute(
      `
        INSERT INTO project_categories (
          project_id,
          category_id
        )

        SELECT
          ?,
          category_id

        FROM project_categories

        WHERE project_id = ?
      `,
      [
        newProjectId,
        projectId,
      ]
    );

    /* =====================================================
       DUPLICATION DE LA GALERIE

       Les chemins d'images sont conservés.
       Les fichiers physiques ne sont pas copiés.
    ====================================================== */

    await connection.execute(
      `
        INSERT INTO project_images (
          project_id,
          image_path,
          alt_text,
          caption,
          layout_type,
          display_order
        )

        SELECT
          ?,
          image_path,
          alt_text,
          caption,
          layout_type,
          display_order

        FROM project_images

        WHERE project_id = ?
      `,
      [
        newProjectId,
        projectId,
      ]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      projectId: newProjectId,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Erreur duplication projet:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant la duplication.",
      },
      {
        status: 500,
      }
    );
  } finally {
    connection.release();
  }
}

/* =========================================================
   SUPPRESSION
========================================================= */

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const session =
    await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "Non autorisé.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;
  const projectId = Number(id);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    return NextResponse.json(
      {
        error: "Projet invalide.",
      },
      {
        status: 400,
      }
    );
  }

  const connection =
    await pool.getConnection();

  try {
    await connection.beginTransaction();

    /* =====================================================
       VÉRIFICATION DU PROJET
    ====================================================== */

    const [projectRows] =
      await connection.query(
        `
          SELECT
            id,
            title

          FROM projects

          WHERE id = ?

          LIMIT 1
        `,
        [projectId]
      );

    const project = (
      projectRows as ExistingProjectRow[]
    )[0];

    if (!project) {
      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "Le projet n’existe pas ou a déjà été supprimé.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SUPPRESSION DES ASSOCIATIONS DE CATÉGORIES
    ====================================================== */

    await connection.execute(
      `
        DELETE FROM project_categories

        WHERE project_id = ?
      `,
      [projectId]
    );

    /* =====================================================
       SUPPRESSION DES ENTRÉES DE GALERIE

       Important :
       on ne supprime PAS les fichiers physiques.

       Plusieurs projets peuvent partager la même image
       après une duplication.
    ====================================================== */

    await connection.execute(
      `
        DELETE FROM project_images

        WHERE project_id = ?
      `,
      [projectId]
    );

    /* =====================================================
       SUPPRESSION DU PROJET
    ====================================================== */

    await connection.execute(
      `
        DELETE FROM projects

        WHERE id = ?
      `,
      [projectId]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message:
        "Le projet a été supprimé.",
      projectId,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Erreur suppression projet:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant la suppression du projet.",
      },
      {
        status: 500,
      }
    );
  } finally {
    connection.release();
  }
}