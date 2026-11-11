export type Partner = {
  id: number;
  name: string;
  logo_path: string;
  website_url: string | null;
  status: 'draft' | 'published';
  display_order: number;
};

export function partnerColumns(count: number) {
  return count > 10 ? 5 : 4;
}

export function validatePartner(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const logo = typeof body.logo_path === 'string' ? body.logo_path : '';
  const website = typeof body.website_url === 'string' ? body.website_url.trim() : '';
  const order = Number(body.display_order ?? 0);
  if (!name || name.length > 150) throw new Error('Indiquez un nom de 1 à 150 caractères.');
  if (!/^\/images\/partners\/[a-zA-Z0-9-]+\.(png|jpg|webp)$/.test(logo)) throw new Error('Téléversez un logo PNG, JPG ou WebP.');
  if (website) {
    let url: URL;
    try { url = new URL(website); } catch { throw new Error('Le lien doit être une adresse HTTP ou HTTPS valide.'); }
    if (!['http:', 'https:'].includes(url.protocol) || website.length > 500 || url.username || url.password) throw new Error('Le lien doit être une adresse HTTP ou HTTPS valide.');
  }
  if (!Number.isInteger(order) || order < 0 || order > 2147483647) throw new Error('L’ordre doit être un entier positif ou nul.');
  if (body.status !== 'draft' && body.status !== 'published') throw new Error('Statut invalide.');
  return { name, logo_path: logo, website_url: website || null, display_order: order, status: body.status };
}
