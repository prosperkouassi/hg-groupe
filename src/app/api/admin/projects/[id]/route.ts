import { NextResponse } from "next/server";
import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { getAdminSession } from "@/lib/auth";
import pool from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type IdRow = RowDataPacket & {
  id: number;
};

type ExistingProjectRow =
  RowDataPacket & {
    id: number;
    status: "draft" | "published";
    published_at: Date | null;
  };

function optionalString(
  value: unknown
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleanValue = value.trim();

  return cleanValue || null;
}

/* =========================================================
   MODIFICATION D'UN PROJET
========================================================= */

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  const session =
    await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Session administrateur requise.",
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
        success: false,
        message: "Projet invalide.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const body =
      await request.json();

    /* =====================================================
       DONNÉES PRINCIPALES
    ====================================================== */

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug
            .trim()
            .toLowerCase()
        : "";

    const domainId = Number(
      body.domainId
    );

    const categoryIds =
      Array.isArray(body.categoryIds)
        ? body.categoryIds
            .map(Number)
            .filter(
              Number.isInteger
            )
        : [];

    const projectYear =
      body.projectYear === null ||
      body.projectYear === ""
        ? null
        : Number(
            body.projectYear
          );

    const displayOrder =
      Math.max(
        0,
        Number(
          body.displayOrder
        ) || 0
      );

    const status:
      | "draft"
      | "published" =
      body.status === "published"
        ? "published"
        : "draft";

    /* =====================================================
       VALIDATIONS
    ====================================================== */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le titre du projet est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        slug
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le slug du projet est invalide.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        domainId
      ) ||
      domainId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez sélectionner un domaine.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      projectYear !== null &&
      (!Number.isInteger(
        projectYear
      ) ||
        projectYear < 2000 ||
        projectYear > 2100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "L'année du projet est invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VÉRIFICATION DU PROJET
    ====================================================== */

    const [existingProjects] =
      await pool.execute<
        ExistingProjectRow[]
      >(
        `
          SELECT
            id,
            status,
            published_at

          FROM projects

          WHERE id = ?

          LIMIT 1
        `,
        [projectId]
      );

    const existingProject =
      existingProjects[0];

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le projet n'existe pas.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       VÉRIFICATION DU DOMAINE
    ====================================================== */

    const [domains] =
      await pool.execute<IdRow[]>(
        `
          SELECT id

          FROM domains

          WHERE id = ?

          LIMIT 1
        `,
        [domainId]
      );

    if (domains.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le domaine sélectionné n'existe pas.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VÉRIFICATION DU SLUG

       On exclut le projet en cours.
    ====================================================== */

    const [existingSlug] =
      await pool.execute<IdRow[]>(
        `
          SELECT id

          FROM projects

          WHERE slug = ?
            AND id <> ?

          LIMIT 1
        `,
        [
          slug,
          projectId,
        ]
      );

    if (
      existingSlug.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ce slug est déjà utilisé par un autre projet.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       VALIDATION DES CATÉGORIES
    ====================================================== */

    const uniqueCategoryIds = [
      ...new Set(categoryIds),
    ];

    if (
      uniqueCategoryIds.length >
      0
    ) {
      const placeholders =
        uniqueCategoryIds
          .map(() => "?")
          .join(", ");

      const [validCategories] =
        await pool.execute<
          IdRow[]
        >(
          `
            SELECT id

            FROM categories

            WHERE domain_id = ?
              AND id IN (${placeholders})
          `,
          [
            domainId,
            ...uniqueCategoryIds,
          ]
        );

      if (
        validCategories.length !==
        uniqueCategoryIds.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Une ou plusieurs catégories ne correspondent pas au domaine sélectionné.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =====================================================
       DATE DE PUBLICATION

       - passage brouillon → publié :
         date actuelle

       - déjà publié :
         on conserve la date

       - retour en brouillon :
         published_at = null
    ====================================================== */

    let publishedAt:
      | Date
      | null = null;

    if (
      status === "published"
    ) {
      publishedAt =
        existingProject.status ===
          "published" &&
        existingProject.published_at
          ? existingProject.published_at
          : new Date();
    }

    /* =====================================================
       TRANSACTION
    ====================================================== */

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /* ===================================================
         MISE À JOUR DU PROJET
      =================================================== */

      const [updateResult] =
        await connection.execute<ResultSetHeader>(
          `
            UPDATE projects

            SET
              domain_id = ?,
              title = ?,
              slug = ?,
              client = ?,
              project_year = ?,
              introduction = ?,
              context = ?,
              mission = ?,
              objectives = ?,
              solution = ?,
              results = ?,
              external_url = ?,
              cover_image = ?,
              cover_image_alt = ?,
              status = ?,
              display_order = ?,
              seo_title = ?,
              seo_description = ?,
              published_at = ?

            WHERE id = ?
          `,
          [
            domainId,
            title,
            slug,

            optionalString(
              body.client
            ),

            projectYear,

            optionalString(
              body.introduction
            ),

            optionalString(
              body.context
            ),

            optionalString(
              body.mission
            ),

            optionalString(
              body.objectives
            ),

            optionalString(
              body.solution
            ),

            optionalString(
              body.results
            ),

            optionalString(
              body.externalUrl
            ),

            optionalString(
              body.coverImage
            ),

            optionalString(
              body.coverImageAlt
            ),

            status,

            displayOrder,

            optionalString(
              body.seoTitle
            ),

            optionalString(
              body.seoDescription
            ),

            publishedAt,

            projectId,
          ]
        );

      if (
        updateResult.affectedRows ===
        0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Le projet n'a pas pu être modifié.",
          },
          {
            status: 404,
          }
        );
      }

      /* ===================================================
         MISE À JOUR DES CATÉGORIES

         On nettoie puis on recrée les associations.
      =================================================== */

      await connection.execute(
        `
          DELETE FROM project_categories

          WHERE project_id = ?
        `,
        [projectId]
      );

      for (
        const categoryId of
        uniqueCategoryIds
      ) {
        await connection.execute(
          `
            INSERT INTO project_categories (
              project_id,
              category_id
            )

            VALUES (?, ?)
          `,
          [
            projectId,
            categoryId,
          ]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message:
          "Projet modifié avec succès.",
        projectId,
      });
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Erreur modification projet :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue pendant l'enregistrement du projet.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   SUPPRESSION D'UN PROJET
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
        success: false,
        message:
          "Session administrateur requise.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await params;

  const projectId =
    Number(id);

  if (
    !Number.isInteger(
      projectId
    ) ||
    projectId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Projet invalide.",
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

    const [projects] =
      await connection.execute<
        IdRow[]
      >(
        `
          SELECT id

          FROM projects

          WHERE id = ?

          LIMIT 1
        `,
        [projectId]
      );

    if (
      projects.length === 0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Le projet n'existe pas ou a déjà été supprimé.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SUPPRESSION DES CATÉGORIES ASSOCIÉES
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

       Nous ne supprimons PAS les fichiers physiques,
       car un projet dupliqué peut utiliser les mêmes
       fichiers.
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

    const [deleteResult] =
      await connection.execute<ResultSetHeader>(
        `
          DELETE FROM projects

          WHERE id = ?
        `,
        [projectId]
      );

    if (
      deleteResult.affectedRows ===
      0
    ) {
      await connection.rollback();

      return NextResponse.json(
        {
          success: false,
          message:
            "Le projet n'a pas pu être supprimé.",
        },
        {
          status: 404,
        }
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message:
        "Projet supprimé avec succès.",
      projectId,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Erreur suppression projet :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
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