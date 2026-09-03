import pool from "@/lib/db";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

type AdminUserRow = {
  id: number;
  name: string;
  email: string;
};

export async function getAdminUserById(
  adminId: number
): Promise<AdminUser | null> {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        email
      FROM admin_users
      WHERE id = ?
        AND is_active = TRUE
      LIMIT 1
    `,
    [adminId]
  );

  const users = rows as AdminUserRow[];

  if (users.length === 0) {
    return null;
  }

  return users[0];
}