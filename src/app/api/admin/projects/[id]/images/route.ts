import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import pool from "@/lib/db";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const allowedLayouts = [
  "full",
  "half",
  "large",
  "portrait",
] as const;

type LayoutType =
  (typeof allowedLayouts)[number];

type ProjectImageRow = {
  id: number;
  project_id: number;
  image_path: string;
  alt_text: string | null;
  caption: string | null;
  layout_type: LayoutType;
  display_order: number;
  created_at: Date;
  updated_at: Date;
};

function sanitizeBaseName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function projectExists(projectId: number) {
  const [rows] = await pool.query(
    `
      SELECT id
      FROM projects
      WHERE id = ?
      LIMIT 1
    `,
    [projectId]
  );

  return Array.isArray(rows) && rows.length > 0;
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
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

  const { id } = await context.params;
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
      { status: 400 }
    );
  }

  const exists =
    await projectExists(projectId);

  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        message: "Projet introuvable.",
      },
      { status: 404 }
    );
  }

  const [rows] = await pool.query(
    `
      SELECT
        id,
        project_id,
        image_path,
        alt_text,
        caption,
        layout_type,
        display_order,
        created_at,
        updated_at
      FROM project_images
      WHERE project_id = ?
      ORDER BY
        display_order ASC,
        id ASC
    `,
    [projectId]
  );

  const images = (
    rows as ProjectImageRow[]
  ).map((image) => ({
    id: image.id,
    projectId: image.project_id,
    imagePath: image.image_path,
    altText: image.alt_text,
    caption: image.caption,
    layoutType: image.layout_type,
    displayOrder: image.display_order,
    createdAt: image.created_at,
    updatedAt: image.updated_at,
  }));

  return NextResponse.json({
    success: true,
    images,
  });
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
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

  const { id } = await context.params;
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
      { status: 400 }
    );
  }

  const exists =
    await projectExists(projectId);

  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        message: "Projet introuvable.",
      },
      { status: 404 }
    );
  }

  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const altText =
      String(
        formData.get("altText") ?? ""
      ).trim() || null;

    const caption =
      String(
        formData.get("caption") ?? ""
      ).trim() || null;

    const requestedLayout =
      String(
        formData.get("layoutType") ??
          "full"
      );

    const layoutType =
      allowedLayouts.includes(
        requestedLayout as LayoutType
      )
        ? (requestedLayout as LayoutType)
        : "full";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucune image reçue.",
        },
        { status: 400 }
      );
    }

    const extension =
      allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format non autorisé. Utilisez JPG, PNG ou WebP.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Le fichier est vide.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "L'image dépasse la taille maximale de 8 Mo.",
        },
        { status: 400 }
      );
    }

    const originalBaseName =
      sanitizeBaseName(file.name) ||
      "image";

    const fileName =
      `${originalBaseName}-${randomUUID()}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "images",
      "cas-etudes",
      "gallery"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    await writeFile(filePath, buffer);

    const publicPath =
      `/images/cas-etudes/gallery/${fileName}`;

    const [orderRows] =
      await pool.query(
        `
          SELECT
            COALESCE(
              MAX(display_order),
              -1
            ) + 1 AS next_order
          FROM project_images
          WHERE project_id = ?
        `,
        [projectId]
      );

    const nextOrder = Number(
      (
        orderRows as Array<{
          next_order: number;
        }>
      )[0]?.next_order ?? 0
    );

    const [result] =
      await pool.query(
        `
          INSERT INTO project_images (
            project_id,
            image_path,
            alt_text,
            caption,
            layout_type,
            display_order
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          projectId,
          publicPath,
          altText,
          caption,
          layoutType,
          nextOrder,
        ]
      );

    const insertId = (
      result as {
        insertId: number;
      }
    ).insertId;

    return NextResponse.json(
      {
        success: true,
        message:
          "Image ajoutée à la galerie.",
        image: {
          id: insertId,
          projectId,
          imagePath: publicPath,
          altText,
          caption,
          layoutType,
          displayOrder: nextOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur galerie projet :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue pendant l'ajout de l'image.",
      },
      { status: 500 }
    );
  }
}