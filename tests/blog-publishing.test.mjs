import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { emptyDraft } from '../src/lib/blog/content.ts';
const source = (await readFile(new URL('../src/lib/blog/publish-due.ts',import.meta.url),'utf8')).replace("import pool from '@/lib/db';", "const pool = { getConnection() { throw new Error('Test must inject its connection'); } };").replace("'./content'",JSON.stringify(new URL('../src/lib/blog/content.ts',import.meta.url).href));
const js = ts.transpileModule(source,{ compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { publishDue } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const revision = { ...emptyDraft,title: 'Version validée',excerpt: 'Résumé validé',content: { type: 'doc',content: [{ type: 'paragraph',content: [{ type: 'text',text: 'Texte validé' }] }] } };
function database({ cancelled = false, fail = false } = {}) {
 const state = { status: 'pending',published: null,draft: { ...revision,title: 'Nouveau brouillon non validé' },commits: 0,rolledBack: false,released: false,articleLocked: false };
 let backup;
 const connection = {
  async query(sql) { return sql.includes('GET_LOCK') ? [[{ acquired: 1 }]] : [[{ released: 1 }]]; },
  async beginTransaction() { backup = { status: state.status,published: state.published }; },
  async commit() { state.commits++; },
  async rollback() { Object.assign(state,backup); state.rolledBack = true; },
  release() { state.released = true; }, destroy() { state.released = true; },
  async execute(sql,params) {
   if (sql.startsWith('SELECT id, article_id')) return [state.status === 'pending' ? [{ id: 7,article_id: 42 }] : []];
   if (sql.startsWith('SELECT id FROM blog_articles')) { state.articleLocked = true; return [[{ id: 42 }]]; }
   if (sql.startsWith('SELECT revision')) { assert.equal(state.articleLocked,true); return [cancelled ? [] : [{ revision: JSON.stringify(revision) }]]; }
   if (sql.startsWith('UPDATE blog_articles')) { state.published = JSON.parse(params[0]); return [{ affectedRows: 1 }]; }
   if (sql.startsWith('UPDATE blog_publication_jobs')) { if (fail) throw new Error('simulated failure'); state.status = 'completed'; return [{ affectedRows: 1 }]; }
   throw new Error('Unexpected SQL');
  },
 };
 return { state,getConnection: async () => connection };
}
test('scheduled publishing uses approved snapshot, preserves draft and is idempotent', async () => {
 const db = database(); const first = await publishDue(db);
 assert.equal(first.published,1); assert.equal(db.state.published.title,'Version validée'); assert.equal(db.state.draft.title,'Nouveau brouillon non validé');
 assert.equal((await publishDue(db)).published,0); assert.equal(db.state.released,true);
});
test('a job cancelled after candidate selection is not published', async () => {
 const db = database({ cancelled: true }); assert.equal((await publishDue(db)).published,0); assert.equal(db.state.published,null);
});
test('publication and job completion roll back together on failure', async () => {
 const db = database({ fail: true }); await assert.rejects(publishDue(db),/simulated failure/);
 assert.equal(db.state.published,null); assert.equal(db.state.status,'pending'); assert.equal(db.state.rolledBack,true); assert.equal(db.state.released,true);
});
