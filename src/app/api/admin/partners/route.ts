import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { authorizePartnerAdmin } from '@/lib/partner-admin';
import { validatePartner } from '@/lib/partner-types';

export async function POST(request: Request) {
  if (!await authorizePartnerAdmin(request)) return NextResponse.json({ message: 'Accès administrateur requis.' }, { status: 401 });
  let partner;
  try { partner = validatePartner(await request.json()); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'Données invalides.' }, { status: 400 }); }
  try {
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO partners (name, logo_path, website_url, status, display_order) VALUES (?, ?, ?, ?, ?)', [partner.name, partner.logo_path, partner.website_url, partner.status, partner.display_order]);
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Création partenaire :', error);
    return NextResponse.json({ message: 'Impossible d’enregistrer le partenaire.' }, { status: 500 });
  }
}
