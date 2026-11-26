import type { RowDataPacket } from "mysql2";

export type RecruitmentRole = "admin" | "recruiter" | "manager";
export type Actor = { id: number; role: RecruitmentRole };

export class RecruitmentAdminError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function isRecruitmentRole(role: unknown): role is RecruitmentRole {
  return role === "admin" || role === "recruiter" || role === "manager";
}

export function requireRecruitmentRole(actor: Actor, ...roles: RecruitmentRole[]) {
  if (!roles.includes(actor.role)) {
    throw new RecruitmentAdminError(403, "Vous n’avez pas accès à cette opération.");
  }
}

export async function getRecruitmentActor() {
  const { getAdminSession } = await import("@/lib/auth");
  const session = await getAdminSession();
  if (!session) throw new RecruitmentAdminError(401, "Connectez-vous à l’administration.");

  const { default: pool } = await import("@/lib/db");
  const [[account]] = await pool.execute<(RowDataPacket & {
    name: string;
    email: string;
    role: unknown;
  })[]>(
    `SELECT u.name, u.email, r.role
     FROM admin_users u
     LEFT JOIN recruitment_admin_roles r ON r.admin_id = u.id
     WHERE u.id = ? AND u.is_active = TRUE LIMIT 1`,
    [session.adminId],
  );
  if (!account) throw new RecruitmentAdminError(401, "Cette session administrative n’est plus active.");
  if (!isRecruitmentRole(account.role)) {
    throw new RecruitmentAdminError(403, "Votre compte ne dispose pas d’un accès au recrutement.");
  }
  return {
    admin: { name: account.name, email: account.email },
    actor: { id: session.adminId, role: account.role },
  };
}
