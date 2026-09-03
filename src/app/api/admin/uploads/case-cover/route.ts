import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

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

    if (!allowedMimeTypes.has(file.type)) {
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
          message:
            "L'image est trop volumineuse. La taille maximale est de 8 Mo.",
        },
        { status: 400 }
      );
    }

    const extension = allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message: "Format d'image invalide.",
        },
        { status: 400 }
      );
    }

    const originalBaseName =
      sanitizeBaseName(file.name) || "image";

    const fileName = `${originalBaseName}-${randomUUID()}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "images",
      "cas-etudes",
      "covers"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    const publicPath = `/images/cas-etudes/covers/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "Image téléversée.",
        path: publicPath,
        fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur upload image cas d'étude :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue pendant l'envoi de l'image.",
      },
      { status: 500 }
    );
  }
}