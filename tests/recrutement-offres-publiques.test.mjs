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
  .replaceAll('"../public-visibility"', JSON.stringify(new URL("public-visibility.ts", base).href))
  .replaceAll('"../public-assets"', JSON.stringify(new URL("public-assets.ts", base).href)), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getJobs, getJob, getJobPage, getPublicJobSitemapSlugs } = await import(fromText(program));
const baselineRow = {
  slug: "designer", publishedAt: "2026-11-03T12:00:00Z",
  closed: 0, coverLetterRequired: 1,
};

function setPublicOffers(t, enabled = true) {
  const previous = process.env.RECRUTEMENT_OFFRES_ENABLED;
  process.env.RECRUTEMENT_OFFRES_ENABLED = String(enabled);
  t.after(() => {
    if (previous === undefined) delete process.env.RECRUTEMENT_OFFRES_ENABLED;
    else process.env.RECRUTEMENT_OFFRES_ENABLED = previous;
  });
}

test("disabled public offers never read data for list, direct detail or sitemap", async t => {
  setPublicOffers(t, false);
  pool.execute = async () => assert.fail("disabled public offers must not query the database");
  assert.deepEqual(await getJobs(1), { jobs: [], page: 1, totalPages: 1, total: 0, unavailable: false });
  assert.equal(await getJob("designer"), null);
  assert.deepEqual(await getPublicJobSitemapSlugs(), []);
});

test("offer sitemap only requests open published offers and excludes invalid slugs", async t => {
  setPublicOffers(t);
  pool.execute = async sql => {
    assert.match(sql, /published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP\(\) AND slug <> 'confirmation'/);
    assert.match(sql, /closed = FALSE AND \(deadline IS NULL OR deadline > UTC_TIMESTAMP\(\)\)/);
    return [[{ slug: "designer" }, { slug: "interdit/a" }]];
  };
  assert.deepEqual(await getPublicJobSitemapSlugs(), ["designer"]);
});

test("published media are restricted to explicitly public local paths", async t => {
  setPublicOffers(t);
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

test("public detail and listings preserve JSON sections and recruiter from either SQL representation", async t => {
  setPublicOffers(t);
  const sections = {
    missions: ["Coordination des équipes"],
    profile: ["Expérience en Côte d’Ivoire"],
    skills: ["Écoute et rédaction"],
    benefits: ["Horaires flexibles"],
    process: ["Entretien à Abidjan"],
  };
  const recruiter = { name: "Maëlle Goerig", initials: "MG", role: "Chargée du recrutement", company: "Hopla Groupe" };
  const fields = { ...sections, recruiter, attachments: ["/documents/metier.pdf"] };
  const encodedFields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, JSON.stringify(value)]));

  pool.execute = async (sql, params) => {
    if (sql.includes("SELECT COUNT")) return [[{ total: 2 }]];
    if (params[0] === "designer") return [[{ ...baselineRow, ...encodedFields }]];
    return [[{ ...baselineRow, slug: "developpeur", ...fields }, { ...baselineRow, ...encodedFields }]];
  };

  const detail = await getJob("designer");
  const listings = await getJobs(1);
  assert.equal(listings.unavailable, false);
  assert.equal(listings.jobs.length, 2);
  for (const offer of [detail, ...listings.jobs]) {
    for (const [name, items] of Object.entries(sections)) assert.deepEqual(offer[name], items);
    assert.deepEqual(offer.recruiter, { ...recruiter, email: null, phone: null, linkedin: null, avatar: null });
    assert.deepEqual(offer.attachments, ["/documents/metier.pdf"]);
  }
});

test("malformed or unexpected JSON does not hide the offer or expose unvalidated fields", async t => {
  setPublicOffers(t);
  pool.execute = async () => [[{
    ...baselineRow,
    missions: '["Mission incomplète"',
    profile: '{"unexpected":"Profil"}',
    skills: '[42,"Compétence valide",{"name":"Ignorée"},null]',
    benefits: null,
    process: '"Une chaîne JSON"',
    recruiter: '[{"name":"Non publié"}]',
    attachments: '["/documents/metier.pdf",{"path":"/documents/autre.pdf"},"/api/prive.pdf"]',
  }]];

  const offer = await getJob("designer");
  assert.equal(offer.slug, "designer");
  assert.deepEqual(offer.missions, []);
  assert.deepEqual(offer.profile, []);
  assert.deepEqual(offer.skills, ["Compétence valide"]);
  assert.deepEqual(offer.benefits, []);
  assert.deepEqual(offer.process, []);
  assert.equal(offer.recruiter, null);
  assert.deepEqual(offer.attachments, ["/documents/metier.pdf"]);
});

test("Part 1 schema still serves public listings when media columns are absent", async t => {
  setPublicOffers(t);
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
  setPublicOffers(t);
  pool.execute = async (sql, params) => {
    assert.match(sql, /featured > \? OR \(featured = \? AND/);
    assert.deepEqual(params, [1, 1, "2026-11-03 12:00:00", "2026-11-03 12:00:00", "designer"]);
    return [[{ total: 15 }]];
  };
  assert.equal(await getJobPage({ ...baselineRow, featured: true, demo: false }), 2);
});
