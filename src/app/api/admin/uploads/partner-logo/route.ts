
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Aucune image reçue.",
        },
        { status: 400 }
      );
    }

    const extension = allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Format non autorisé. Utilisez une image JPG, PNG ou WebP.",
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
          message: "Le logo ne doit pas dépasser 4 Mo.",
        },
        { status: 400 }
      );
    }

    const originalBaseName =
      sanitizeBaseName(file.name) || "partenaire";

    const fileName =
      `${originalBaseName}-${randomUUID()}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "images",
      "partners"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(uploadDirectory, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    const publicPath = `/images/partners/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "Logo téléversé avec succès.",
        path: publicPath,
        fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur upload logo partenaire :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue pendant l'envoi du logo.",
      },
      { status: 500 }
    );
  }
}
