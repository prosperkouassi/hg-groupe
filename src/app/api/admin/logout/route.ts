import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json({
      success: true,
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la déconnexion administrateur :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue lors de la déconnexion.",
      },
      { status: 500 }
    );
  }
}