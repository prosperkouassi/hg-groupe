import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const fromText = text => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
const fixtureKey = Symbol.for("hopla-public-offers-test-pool");
const pool = {};
globalThis[fixtureKey] = pool;
const fakeDb = fromText(`export default globalThis[Symbol.for(${JSON.stringify(Symbol.keyFor(fixtureKey))})];`);
const base = new URL("../src/modules/recrutement/", import.meta.url);
const source = await readFile(new URL("server/jobs.ts", base), "utf8");
const program = ts.transpileModule(source.replaceAll('"@/lib/db"', JSON.stringify(fakeDb))
  .replaceAll('"../public-assets"', JSON.stringify(new URL("public-assets.ts", base).href)), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getJobs, getJob, getJobPage } = await import(fromText(program));
const baselineRow = {
  slug: "designer", publishedAt: "2026-11-03T12:00:00Z",
  closed: 0, coverLetterRequired: 1,
};

function allowPublicReads(t) {
  const previous = process.env.RECRUTEMENT_OFFRES_ENABLED;
  process.env.RECRUTEMENT_OFFRES_ENABLED = "true";
  t.after(() => {
    if (previous === undefined) delete process.env.RECRUTEMENT_OFFRES_ENABLED;
    else process.env.RECRUTEMENT_OFFRES_ENABLED = previous;
  });
}

test("published media are restricted to explicitly public local paths", async t => {
  allowPublicReads(t);
  pool.execute = async (sql, params) => {
    assert.match(sql, /published_at <= UTC_TIMESTAMP\(\)/);
    assert.match(sql, /image_url AS imageUrl/);
    assert.deepEqual(params, ["designer"]);
    return [[{
      ...baselineRow, featured: 1, imageUrl: "/images/recrutement/equipe.webp",
      attachments: JSON.stringify(["/documents/metier.pdf", "/documents/metier.pdf", "/api/recrutement/documents/1",
        "/documents/../secret.pdf", "//bad.example/fiche.pdf", "https://bad.example/fiche.pdf"]),
    }]];
  };
  const offer = await getJob("designer");
  assert.equal(offer.featured, true);
  assert.equal(offer.imageUrl, "/images/recrutement/equipe.webp");
  assert.deepEqual(offer.attachments, ["/documents/metier.pdf"]);
});

test("Part 1 schema still serves public listings when media columns are absent", async t => {
  allowPublicReads(t);
  const statements = [];
  pool.execute = async sql => {
    statements.push(sql);
    if (sql.includes("SELECT COUNT")) return [[{ total: 1 }]];
    if (sql.includes("image_url")) throw Object.assign(new Error("column unavailable"), { code: "ER_BAD_FIELD_ERROR" });
    return [[baselineRow]];
  };
  const listings = await getJobs(1);
  assert.equal(listings.unavailable, false);
  assert.equal(listings.jobs[0].slug, "designer");
  assert.equal(listings.jobs[0].imageUrl, null);
  assert.equal(listings.jobs[0].featured, false);
  assert.match(statements[1], /ORDER BY featured DESC, published_at DESC, slug ASC/);
  assert.match(statements[2], /ORDER BY published_at DESC, slug ASC/);
});

test("featured offers have the same ordering in list and selected-page computation", async t => {
  allowPublicReads(t);
  pool.execute = async (sql, params) => {
    assert.match(sql, /featured > \? OR \(featured = \? AND/);
    assert.deepEqual(params, [1, 1, "2026-11-03 12:00:00", "2026-11-03 12:00:00", "designer"]);
    return [[{ total: 15 }]];
  };
  assert.equal(await getJobPage({ ...baselineRow, featured: true, demo: false }), 2);
});
