import { NextResponse } from "next/server";

import pool from "@/lib/db";
import {
  setAdminSession,
  verifyPassword,
} from "@/lib/auth";

type AdminUserRow = {
  id: number;
  email: string;
  password_hash: string;
  is_active: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email et mot de passe requis.",
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `
        SELECT
          id,
          email,
          password_hash,
          is_active
        FROM admin_users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );

    const users = rows as AdminUserRow[];

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiants incorrects.",
        },
        { status: 401 }
      );
    }

    const admin = users[0];

    if (!admin.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Compte administrateur désactivé.",
        },
        { status: 403 }
      );
    }

    const passwordIsValid = await verifyPassword(
      password,
      admin.password_hash
    );

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiants incorrects.",
        },
        { status: 401 }
      );
    }

    await setAdminSession(admin.id);

    await pool.execute(
      `
        UPDATE admin_users
        SET last_login_at = NOW()
        WHERE id = ?
      `,
      [admin.id]
    );

    return NextResponse.json({
      success: true,
      message: "Connexion réussie.",
    });
  } catch (error) {
    console.error(
      "Erreur connexion administrateur :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue lors de la connexion.",
      },
      { status: 500 }
    );
  }
}