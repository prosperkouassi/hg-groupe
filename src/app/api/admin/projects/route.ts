import { NextResponse } from "next/server";
import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { getAdminSession } from "@/lib/auth";
import pool from "@/lib/db";

type IdRow = RowDataPacket & {
  id: number;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleanValue = value.trim();

  return cleanValue || null;
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Session administrateur requise.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const domainId = Number(body.domainId);

    const categoryIds = Array.isArray(
      body.categoryIds
    )
      ? body.categoryIds
          .map(Number)
          .filter(Number.isInteger)
      : [];

    const projectYear =
      body.projectYear === null ||
      body.projectYear === ""
        ? null
        : Number(body.projectYear);

    const displayOrder = Math.max(
      0,
      Number(body.displayOrder) || 0
    );

    const status =
      body.status === "published"
        ? "published"
        : "draft";

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le titre du projet est obligatoire.",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(domainId) ||
      domainId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez sélectionner un domaine.",
        },
        { status: 400 }
      );
    }

    if (
      projectYear !== null &&
      (!Number.isInteger(projectYear) ||
        projectYear < 2000 ||
        projectYear > 2100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "L'année du projet est invalide.",
        },
        { status: 400 }
      );
    }

    const [domains] = await pool.execute<IdRow[]>(
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
        { status: 400 }
      );
    }

    const [existingSlug] =
      await pool.execute<IdRow[]>(
        `
          SELECT id
          FROM projects
          WHERE slug = ?
          LIMIT 1
        `,
        [slug]
      );

    if (existingSlug.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ce slug est déjà utilisé par un autre projet.",
        },
        { status: 409 }
      );
    }

    const uniqueCategoryIds = [
      ...new Set(categoryIds),
    ];

    if (uniqueCategoryIds.length > 0) {
      const placeholders = uniqueCategoryIds
        .map(() => "?")
        .join(", ");

      const [validCategories] =
        await pool.execute<IdRow[]>(
          `
            SELECT id
            FROM categories
            WHERE domain_id = ?
              AND id IN (${placeholders})
          `,
          [domainId, ...uniqueCategoryIds]
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
          { status: 400 }
        );
      }
    }

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const publishedAt =
        status === "published"
          ? new Date()
          : null;

      const [result] =
        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO projects (
              domain_id,
              title,
              slug,
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
              seo_description,
              published_at
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
          `,
          [
            domainId,
            title,
            slug,
            optionalString(body.client),
            projectYear,
            optionalString(body.introduction),
            optionalString(body.context),
            optionalString(body.mission),
            optionalString(body.objectives),
            optionalString(body.solution),
            optionalString(body.results),
            optionalString(body.externalUrl),
            optionalString(body.coverImage),
            optionalString(body.coverImageAlt),
            status,
            displayOrder,
            optionalString(body.seoTitle),
            optionalString(
              body.seoDescription
            ),
            publishedAt,
          ]
        );

      const projectId = result.insertId;

      for (const categoryId of uniqueCategoryIds) {
        await connection.execute(
          `
            INSERT INTO project_categories (
              project_id,
              category_id
            )
            VALUES (?, ?)
          `,
          [projectId, categoryId]
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: "Projet enregistré.",
          projectId,
        },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Erreur création projet :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue pendant l'enregistrement du projet.",
      },
      { status: 500 }
    );
  }
}