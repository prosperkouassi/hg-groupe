import { load } from 'cheerio';
import sharp from 'sharp';
const value = process.argv[2];
if (!value) {
  console.error('Usage : node scripts/check-blog-sharing.mjs https://votre-domaine/blog/article');
  process.exitCode = 1;
} else {
  try {
    const url = new URL(value);
    if (!['http:','https:'].includes(url.protocol)) throw new Error('Adresse HTTP/HTTPS requise.');
    const headers = { 'User-Agent': 'LinkedInBot/1.0', Accept: 'text/html' };
    const response = await fetch(url,{ headers,signal: AbortSignal.timeout(20000) });
    console.log('Page :',response.url,'— HTTP',response.status);
    if (!response.ok) throw new Error('La page ne peut pas être partagée ou indexée correctement tant qu’elle ne répond pas en HTTP 200.');
    const $ = load(await response.text());
    console.log('Canonical :',$('link[rel="canonical"]').attr('href') || 'absente');
    console.log('Robots :',$('meta[name="robots"]').map((_i,el) => $(el).attr('content')).get().join(' | ') || 'non précisé');
    for (const key of ['og:title','og:description','og:url','og:image']) console.log(`${key} :`,$(`head meta[property="${key}"]`).attr('content') || 'absent du head');
    const image = $('meta[property="og:image"]').first().attr('content');
    if (!image) throw new Error('Aucune image Open Graph détectée.');
    const file = await fetch(new URL(image,response.url),{ headers: { 'User-Agent': headers['User-Agent'] },signal: AbortSignal.timeout(20000) });
    console.log('Image : HTTP',file.status,'—',file.headers.get('content-type'));
    if (!file.ok) throw new Error('Image inaccessible sans session. Vérifiez le déploiement et BLOG_MEDIA_DIR.');
    const bytes = Buffer.from(await file.arrayBuffer());
    const info = await sharp(bytes).metadata();
    console.log('Dimensions :',info.width,'×',info.height,'—',Math.round(bytes.length / 1024),'Ko —',info.format);
    if (info.width < 1200 || info.height < 627 || bytes.length > 5*1024*1024) console.warn('Vérifiez les dimensions et le poids attendus pour le partage.');
    console.log('Après déploiement, rafraîchissez cette URL dans https://www.linkedin.com/post-inspector/');
  } catch (error) { console.error('Diagnostic :',error.message); process.exitCode = 1; }
}
