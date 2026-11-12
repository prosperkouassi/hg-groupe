export type WriteOriginResult = { allowed: boolean; reason?: 'missing_origin' | 'cross_site' | 'invalid_origin' | 'invalid_configuration' | 'different_origin' };
/** Use the configured public origin, never untrusted forwarding headers or an internal proxy URL. */
export function checkWriteOrigin(request: Request, siteUrl?: string, production = false): WriteOriginResult {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return { allowed: false, reason: 'missing_origin' };
  if (request.headers.get('sec-fetch-site') === 'cross-site') return { allowed: false, reason: 'cross_site' };
  let supplied: URL;
  try { supplied = new URL(origin); } catch { return { allowed: false, reason: 'invalid_origin' }; }
  if (supplied.origin !== origin || !['http:','https:'].includes(supplied.protocol)) return { allowed: false, reason: 'invalid_origin' };
  const allowed = new Set<string>();
  const configured = siteUrl?.trim() || (production ? 'https://hoplagroupe.com' : '');
  if (configured) {
    try {
      const publicUrl = new URL(configured);
      if (publicUrl.username || publicUrl.password || (production ? publicUrl.protocol !== 'https:' : !['http:','https:'].includes(publicUrl.protocol))) return { allowed: false, reason: 'invalid_configuration' };
      allowed.add(publicUrl.origin);
    } catch { return { allowed: false, reason: 'invalid_configuration' }; }
  }
  // Local development keeps working without making the production proxy's Host authoritative.
  if (!production) allowed.add(new URL(request.url).origin);
  return allowed.has(supplied.origin) ? { allowed: true } : { allowed: false, reason: 'different_origin' };
}
