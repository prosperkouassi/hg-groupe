import { unlink } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import pool from "@/lib/db";

const allowedLayouts = [
  "full",
  "half",
  "large",
  "portrait",
] as const;

type LayoutType =
  (typeof allowedLayouts)[number];

type ExistingImageRow = {
  id: number;
  project_id: number;
  image_path: string;
};

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Session administrateur requise.",
      },
      { status: 401 }
    );
  }

  const { id, imageId } =
    await context.params;

  const projectId = Number(id);
  const projectImageId =
    Number(imageId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(projectImageId) ||
    projectImageId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Image invalide.",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    const altText =
      typeof body.altText === "string"
        ? body.altText.trim() || null
        : null;

    const caption =
      typeof body.caption === "string"
        ? body.caption.trim() || null
        : null;

    const requestedLayout =
      String(
        body.layoutType ?? "full"
      );

    if (
      !allowedLayouts.includes(
        requestedLayout as LayoutType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Disposition d'image invalide.",
        },
        { status: 400 }
      );
    }

    const displayOrder = Number(
      body.displayOrder ?? 0
    );

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ordre d'affichage invalide.",
        },
        { status: 400 }
      );
    }

    const [result] =
      await pool.query(
        `
          UPDATE project_images
          SET
            alt_text = ?,
            caption = ?,
            layout_type = ?,
            display_order = ?
          WHERE id = ?
            AND project_id = ?
        `,
        [
          altText,
          caption,
          requestedLayout,
          displayOrder,
          projectImageId,
          projectId,
        ]
      );

    const affectedRows = (
      result as {
        affectedRows: number;
      }
    ).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Image introuvable.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image mise à jour.",
    });
  } catch (error) {
    console.error(
      "Erreur modification image :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de modifier l'image.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Session administrateur requise.",
      },
      { status: 401 }
    );
  }

  const { id, imageId } =
    await context.params;

  const projectId = Number(id);
  const projectImageId =
    Number(imageId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !Number.isInteger(projectImageId) ||
    projectImageId <= 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Image invalide.",
      },
      { status: 400 }
    );
  }

  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            project_id,
            image_path
          FROM project_images
          WHERE id = ?
            AND project_id = ?
          LIMIT 1
        `,
        [
          projectImageId,
          projectId,
        ]
      );

    const image = (
      rows as ExistingImageRow[]
    )[0];

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          message: "Image introuvable.",
        },
        { status: 404 }
      );
    }

    await pool.query(
      `
        DELETE FROM project_images
        WHERE id = ?
          AND project_id = ?
      `,
      [
        projectImageId,
        projectId,
      ]
    );

    const galleryPrefix =
      "/images/cas-etudes/gallery/";

    if (
      image.image_path.startsWith(
        galleryPrefix
      )
    ) {
      const fileName =
        path.basename(
          image.image_path
        );

      const filePath = path.join(
        process.cwd(),
        "public",
        "images",
        "cas-etudes",
        "gallery",
        fileName
      );

      try {
        await unlink(filePath);
      } catch (fileError) {
        console.warn(
          "Fichier galerie déjà absent :",
          fileError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Image supprimée de la galerie.",
    });
  } catch (error) {
    console.error(
      "Erreur suppression image :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de supprimer l'image.",
      },
      { status: 500 }
    );
  }
}