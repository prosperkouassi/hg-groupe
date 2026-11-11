import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { isIP } from 'node:net';
import { load } from 'cheerio';

// HTTPS, public IPv4 only; DNS is pinned to the checked address for the request.
export function isPublicIPv4(address: string) {
  if (isIP(address) !== 4) return false;
  const [a,b,c] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
}
export function referenceURL(value: string) {
  let url: URL; try { url = new URL(value); } catch { throw new Error('Lien de référence invalide.'); }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || isIP(url.hostname) || !url.hostname.includes('.') || url.hostname.endsWith('.local') || url.hostname.endsWith('.internal')) throw new Error('Utilisez le lien HTTPS d’un article sur un site public.');
  url.hash = ''; return url;
}
async function fetchHTML(url: URL, redirects = 0): Promise<{ html: string; url: string }> {
  const addresses = await lookup(url.hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some(a => !isPublicIPv4(a.address))) throw new Error('Ce lien ne pointe pas vers un site public autorisé.');
  const address = addresses[0].address;
  const result = await new Promise<{ html?: string; redirect?: string }>((resolve,reject) => {
    const req = request(url, { method: 'GET', family: 4, headers: { 'User-Agent': 'HoplaBlog/1.0 (editorial structure preview)', Accept: 'text/html', 'Accept-Encoding': 'identity' }, lookup: (_hostname, _options, callback) => { callback(null, address, 4); } }, res => {
      if ([301,302,303,307,308].includes(res.statusCode || 0) && res.headers.location) { res.resume(); resolve({ redirect: res.headers.location }); return; }
      if (res.statusCode !== 200 || !String(res.headers['content-type']).includes('text/html')) { res.resume(); reject(new Error('Cet article n’est pas accessible en HTML. Collez son plan manuellement.')); return; }
      const chunks: Buffer[] = []; let size = 0;
      res.on('data', (chunk: Buffer) => { size += chunk.length; if (size > 1000000) { req.destroy(new Error('Page de référence trop volumineuse. Collez son plan manuellement.')); return; } chunks.push(chunk); });
      res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') })); res.on('error',reject);
    });
    const timer = setTimeout(() => req.destroy(new Error('La lecture du lien a expiré. Collez le plan manuellement.')), 12000);
    req.on('close',() => clearTimeout(timer)); req.on('error',reject); req.end();
  });
  if (result.redirect) { if (redirects >= 3) throw new Error('Trop de redirections. Collez le plan manuellement.'); return fetchHTML(referenceURL(new URL(result.redirect,url).href), redirects + 1); }
  return { html: result.html!, url: url.href };
}
export function extractStructure(html: string, url: string) {
  const $ = load(html); $('script,style,nav,header,footer,aside,form,noscript').remove();
  const container = $('article').first().length ? $('article').first() : $('main').first().length ? $('main').first() : $('body');
  const clean = (text: string) => text.replace(/\s+/g,' ').trim().slice(0,240);
  const title = clean(container.find('h1').first().text() || $('title').text());
  const outline = container.find('h2,h3').toArray().slice(0,30).map(el => `${el.tagName.toUpperCase()} — ${clean($(el).text())}`).filter(s => s.length > 6);
  if (!title && !outline.length) throw new Error('Aucune structure lisible dans cet article. Collez le plan manuellement.');
  return { url, title, outline, paragraphs: container.find('p').length, lists: container.find('ul,ol').length };
}
export async function readReference(value: string) { try { const result = await fetchHTML(referenceURL(value)); return extractStructure(result.html,result.url); } catch (error) { if ((error as { code?: string }).code) throw new Error('Le lien de référence est inaccessible. Retirez le lien et collez le plan manuellement.'); throw error; } }
