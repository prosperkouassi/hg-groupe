import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { authorizePartnerAdmin } from '@/lib/partner-admin';
import { validatePartner } from '@/lib/partner-types';

type Context = { params: Promise<{ id: string }> };
async function mutate(request: Request, context: Context, remove: boolean) {
  if (!await authorizePartnerAdmin(request)) return NextResponse.json({ message: 'Accès administrateur requis.' }, { status: 401 });
  const { id } = await context.params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return NextResponse.json({ message: 'Identifiant invalide.' }, { status: 400 });
  let partner;
  if (!remove) {
    try { partner = validatePartner(await request.json()); }
    catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'Données invalides.' }, { status: 400 }); }
  }
  try {
    const [result] = remove
      ? await pool.execute<ResultSetHeader>('DELETE FROM partners WHERE id = ?', [id])
      : await pool.execute<ResultSetHeader>('UPDATE partners SET name = ?, logo_path = ?, website_url = ?, status = ?, display_order = ? WHERE id = ?', [partner!.name, partner!.logo_path, partner!.website_url, partner!.status, partner!.display_order, id]);
    if (!result.affectedRows) return NextResponse.json({ message: 'Partenaire introuvable.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Modification partenaire :', error);
    return NextResponse.json({ message: 'Impossible de modifier le partenaire.' }, { status: 500 });
  }
}
export async function PUT(request: Request, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: Request, context: Context) { return mutate(request, context, true); }
