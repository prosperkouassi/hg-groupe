import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';
import { emptyDraft } from '../src/lib/blog/content.ts';
import { blogMetadata,articleMetadata,shareImageURL } from '../src/lib/blog/seo.ts';
let source = await readFile(new URL('../src/lib/blog/share-image.ts',import.meta.url),'utf8');
source = source.replace("'./content'",JSON.stringify(new URL('../src/lib/blog/content.ts',import.meta.url).href)).replace("'./media'",JSON.stringify(new URL('../src/lib/blog/media.ts',import.meta.url).href)).replace("'sharp'",JSON.stringify(new URL('../node_modules/sharp/dist/index.mjs',import.meta.url).href));
// Resolve Sharp using the installed export rather than hardcoding its internal layout.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
source = source.replace(JSON.stringify(new URL('../node_modules/sharp/dist/index.mjs',import.meta.url).href),JSON.stringify(pathToFileURL(require.resolve('sharp')).href));
const js = ts.transpileModule(source,{ compilerOptions: { module: ts.ModuleKind.ESNext,target: ts.ScriptTarget.ES2022 } }).outputText;
const { buildShareImage,shareImageResponse } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const article = { id: 1,slug: 'article-test',published: { ...emptyDraft,title: 'Titre publié',excerpt: 'Résumé publié',author: 'Hopla Groupe' },draft: { ...emptyDraft,title: 'Titre brouillon confidentiel' },version: 2,firstPublishedAt: '2026-11-11T10:00:00Z',publishedAt: '2026-11-11T11:00:00Z',updatedAt: '2026-11-11T12:00:00Z' };
test('public archive has absolute canonical, JPEG OG dimensions and matching Twitter metadata', () => {
 const m = blogMetadata({}); assert.equal(m.alternates.canonical,'https://hoplagroupe.com/blog'); assert.equal(m.robots.index,true);
 assert.equal(m.openGraph.images[0].width,1200); assert.equal(m.openGraph.images[0].height,630); assert.equal(m.openGraph.images[0].type,'image/jpeg');
 assert.equal(m.twitter.images[0].url,m.openGraph.images[0].url);
});
test('search/filter archives stay noindex; pagination keeps a separate canonical', () => {
 assert.equal(blogMetadata({ q: 'RH' }).robots.index,false); assert.equal(blogMetadata({ categorie: 'RH' }).robots.index,false);
 assert.equal(blogMetadata({ page: '2' }).alternates.canonical,'https://hoplagroupe.com/blog?page=2'); assert.equal(blogMetadata({ page: '2' }).robots.index,true);
});
test('article metadata reads only the published snapshot and changes the image URL after publication', () => {
 const m = articleMetadata(article); assert.equal(m.title,'Titre publié'); assert.equal(m.robots.index,true);
 assert.ok(!JSON.stringify(m).includes('confidentiel')); assert.equal(m.openGraph.images[0].url,shareImageURL(article.slug,article.publishedAt));
 assert.notEqual(shareImageURL(article.slug,article.publishedAt),shareImageURL(article.slug,'2026-11-12T10:00:00Z'));
});
test('draft-only article is not indexable and gets no share image', () => {
 const m = articleMetadata({ ...article,published: null }); assert.equal(m.robots.index,false); assert.equal(m.openGraph,undefined);
});
test('share endpoint produces a public JPEG 1200x630 under LinkedIn’s size limit', async () => {
 const bytes = await buildShareImage(); const info = await sharp(bytes).metadata();
 assert.equal(info.format,'jpeg'); assert.equal(info.width,1200); assert.equal(info.height,630); assert.ok(bytes.length < 5*1024*1024);
 const response = shareImageResponse(bytes); assert.equal(response.status,200); assert.equal(response.headers.get('content-type'),'image/jpeg'); assert.equal(response.headers.get('content-length'),String(bytes.length)); assert.ok(response.headers.get('cache-control').startsWith('public'));
});
test('missing cover falls back to the brand image instead of breaking the thumbnail', async () => {
 const bytes = await buildShareImage('/api/blog/media/00000000-0000-0000-0000-000000000000.webp');
 assert.equal((await sharp(bytes).metadata()).width,1200);
});
