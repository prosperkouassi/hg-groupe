import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { parseScheduledAt, formatSchedule } from '../src/lib/blog/schedule.ts';
import { isPublicIPv4, referenceURL, extractStructure } from '../src/lib/blog/reference.ts';
import ts from 'typescript';
// Resolve the app's extensionless TS content import for Node's native test runner.
const source = (await readFile(new URL('../src/lib/blog/ai-types.ts',import.meta.url),'utf8')).replace("'./content'",JSON.stringify(new URL('../src/lib/blog/content.ts',import.meta.url).href));
const js = ts.transpileModule(source,{ compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { validateAIBrief, proposalFromAI } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const brief = { subject: 'Structurer une entreprise', tone: 'Pédagogique', length: 900, audience: 'PME', facts: '', structure: '', referenceUrl: '', category: 'Organisation et structuration' };
const proposal = { title: 'Mieux organiser son entreprise', excerpt: 'Des conseils pour clarifier les rôles et faire avancer les projets.', seoTitle: 'Organisation des entreprises', seoDescription: 'Des conseils pratiques.', sections: [{ kind: 'heading2',text: 'Clarifier les rôles',items: [] },{ kind: 'paragraph',text: 'Échangez avec votre équipe.',items: [] },{ kind: 'bullets',text: '',items: ['Définir les responsabilités','Partager les priorités'] }], checkpoints: ['Vérifier les exemples internes'] };
test('Abidjan scheduling stores UTC and rejects dates that normalize or occur too soon', () => {
 const now = Date.parse('2026-11-11T10:00:00Z');
 assert.deepEqual(parseScheduledAt('2026-11-11T11:30',now),{ iso: '2026-11-11T11:30:00.000Z', sql: '2026-11-11 11:30:00' });
 for (const v of ['2026-11-11T10:00','2026-11-10T11:00','2026-02-30T12:00','2026-11-11T25:00','2026-11-11T11:00+01:00']) assert.throws(() => parseScheduledAt(v,now));
 assert.match(formatSchedule('2026-11-11T11:30:00Z'),/11:30/);
});
test('public reference requests reject local and private networks', () => {
 for (const ip of ['127.0.0.1','10.0.0.2','172.16.0.1','192.168.1.1','169.254.169.254','100.64.0.1','0.0.0.0','224.1.1.1','::1','::ffff:127.0.0.1']) assert.equal(isPublicIPv4(ip),false,ip);
 assert.equal(isPublicIPv4('8.8.8.8'),true);
 for (const u of ['http://example.com/x','https://localhost/x','https://127.0.0.1/x','https://example.com:444/x','https://user:pass@example.com/x','https://api.internal/x']) assert.throws(() => referenceURL(u));
 assert.equal(referenceURL('https://example.com/article#section').href,'https://example.com/article');
});
test('only editorial structure is extracted, not the reference article body or navigation', () => {
 const reference = extractStructure('<title>Site</title><nav><h2>Menu</h2></nav><article><h1>Article de référence</h1><h2>Premier axe</h2><p>Un long texte original qui ne doit pas être envoyé au modèle.</p><h3>Un détail</h3><ul><li>Exemple</li></ul><script>private script</script></article>','https://example.com/article');
 assert.deepEqual(reference.outline,['H2 — Premier axe','H3 — Un détail']); assert.equal(reference.paragraphs,1); assert.equal(reference.lists,1);
 assert.ok(!JSON.stringify(reference).includes('long texte')); assert.ok(!JSON.stringify(reference).includes('Menu'));
});
test('AI brief rejects invalid tone, unbounded input and unsupported length', () => {
 assert.equal(validateAIBrief(brief).tone,'Pédagogique');
 assert.throws(() => validateAIBrief({ ...brief,tone: 'autre' })); assert.throws(() => validateAIBrief({ ...brief,length: 999999 })); assert.throws(() => validateAIBrief({ ...brief,facts: 'x'.repeat(6001) }));
});
test('AI output becomes controlled Tiptap content with heading hierarchy and checkpoints', () => {
 const p = proposalFromAI(proposal,brief.category);
 assert.equal(p.content.type,'doc'); assert.equal(p.content.content[0].attrs.level,2); assert.equal(p.content.content[2].type,'bulletList'); assert.equal(p.checkpoints.length,1);
});
test('untrusted AI nodes, incomplete fields and oversized output are rejected', () => {
 assert.throws(() => proposalFromAI({ ...proposal,title: '' },brief.category));
 assert.throws(() => proposalFromAI({ ...proposal,sections: [{ kind: 'iframe',text:'x',items:[] }] },brief.category));
 assert.throws(() => proposalFromAI({ ...proposal,sections: [{ kind: 'paragraph',text:'x'.repeat(12001),items:[] }] },brief.category));
 assert.throws(() => proposalFromAI({ ...proposal,checkpoints: [42] },brief.category));
});
