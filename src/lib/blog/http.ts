export type BlogApiResult = { id: number; version: number; src: string };
/** Read empty/HTML/error responses without hiding the useful HTTP status. */
export async function readBlogResponse(response: Response, operation: 'create' | 'update' | 'upload'): Promise<BlogApiResult> {
  const status = `HTTP ${response.status}`;
  if (response.redirected) throw new Error(`La requête a été redirigée (${status}). Vérifiez votre session administrateur avant de réessayer.`);
  const text = await response.text();
  let data: Record<string, unknown> | undefined;
  try { const parsed: unknown = JSON.parse(text); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed as Record<string, unknown>; } catch { /* Show a safe diagnostic, never a raw server HTML page. */ }
  if (!response.ok) {
    if (typeof data?.message === 'string' && data.message) throw new Error(`${data.message} (${status})`);
    if (response.status === 401 || response.status === 403) throw new Error(`Session expirée ou accès refusé (${status}). Reconnectez-vous après avoir conservé votre texte.`);
    throw new Error(`Le serveur n’a pas pu traiter la demande (${status}${!text.trim() ? ', réponse vide' : ', réponse non JSON'}). Consultez le terminal où npm run dev est lancé.`);
  }
  if (!data) throw new Error(`Réponse du serveur invalide (${status}${!text.trim() ? ', réponse vide' : ', réponse non JSON'}). L’enregistrement n’a pas pu être confirmé.`);
  if (operation === 'create' && (!Number.isSafeInteger(data.id) || Number(data.id) < 1)) throw new Error('Le serveur n’a pas confirmé l’identifiant de l’article.');
  if (operation !== 'upload' && (!Number.isSafeInteger(data.version) || Number(data.version) < 1)) throw new Error('Le serveur n’a pas confirmé la version enregistrée.');
  if (operation === 'upload' && (typeof data.src !== 'string' || !data.src.startsWith('/api/blog/media/'))) throw new Error('Le serveur n’a pas confirmé le téléversement de l’image.');
  return data as BlogApiResult;
}
