// Called once a minute by the hosting scheduler, or manually for local verification.
const base = process.env.BLOG_SITE_URL;
const secret = process.env.BLOG_CRON_SECRET;
if (!base || !secret || secret.length < 32) {
  console.error('Définissez BLOG_SITE_URL et BLOG_CRON_SECRET (32 caractères minimum).');
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(new URL('/api/internal/blog/publish-due',base), { method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(55000), redirect: 'error' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || `HTTP ${response.status}`);
    console.log(JSON.stringify(body));
  } catch (error) { console.error('Échec du passage programmé :', error.message); process.exitCode = 1; }
}
