import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const fromText = text => `data:text/javascript;base64,${Buffer.from(text).toString("base64")}`;
const fixtureKey = Symbol.for("hopla-recruitment-offers-test-pool");
const pool = {};
globalThis[fixtureKey] = pool;
const fakePool = fromText(`export default globalThis[Symbol.for(${JSON.stringify(Symbol.keyFor(fixtureKey))})];`);
const source = await readFile(new URL("../src/modules/recrutement/admin/offers.ts", import.meta.url), "utf8");
const program = ts.transpileModule(source.replaceAll('"@/lib/db"', JSON.stringify(fakePool))
  .replaceAll('"../application/fields"', JSON.stringify(new URL("../src/modules/recrutement/application/fields.ts", import.meta.url).href))
  .replaceAll('"../public-assets"', JSON.stringify(new URL("../src/modules/recrutement/public-assets.ts", import.meta.url).href)), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;

function scriptedPool(responder) {
  const events = [];
  let sqlCount = 0;
  const execute = async (sql, params) => {
    events.push({ sql, params });
    return responder(sql, params, sqlCount++);
  };
  Object.assign(pool, {
    execute,
    getConnection: async () => ({
      execute,
      beginTransaction: async () => { events.push("begin"); },
      commit: async () => { events.push("commit"); },
      rollback: async () => { events.push("rollback"); },
      release: () => { events.push("release"); },
    }),
  });
  return events;
}

const admin = { id: 1, role: "admin" };
const manager = { id: 2, role: "manager" };
const recruiter = { id: 3, role: "recruiter" };
const profileId = "bfb67ac0-8301-48a9-bf8b-2479c4903675";
const draft = {
  slug: "responsable", title: "Responsable", city: "Abidjan", country: "Côte d’Ivoire",
  countryCode: "CI", contract: "CDI", workMode: "Hybride", positions: 1,
  experience: "5 ans", education: "Bac + 3", description: "Piloter l’activité.",
};

test("the recruiter query restricts offers to the assigned scope and uses bound filters", async () => {
  const calls = scriptedPool((_sql, _params, index) => index === 0
    ? [[{ status: "open", total: 1 }, { status: "draft", total: 2 }]]
    : [[{ slug: "responsable", validatedApplications: 4 }]]);
  const { listOffers } = await import(fromText(program));
  const result = await listOffers(recruiter, { q: "%_", status: "open", sort: "constructor" });
  assert.equal(result.items[0].slug, "responsable");
  assert.equal(result.items[0].validatedApplications, 4);
  assert.equal(result.total, 1);
  assert.deepEqual(result.counts, { all: 3, active: 1, open: 1, closing: 0, scheduled: 0, draft: 2, closed: 0 });
  assert.match(calls[0].sql, /p.offer_slug = j.slug AND p.admin_id = \?/);
  assert.match(calls[0].sql, /j.deleted_at IS NULL/);
  assert.deepEqual(calls[0].params, [3, "%!%!_%", "%!%!_%", "%!%!_%"]);
  assert.match(calls[1].sql, /p.offer_slug = j.slug AND p.admin_id = \?/);
  assert.match(calls[1].sql, /c.job_slug = j.slug AND c.application_type = 'job_application'\s+AND c.validated_at IS NOT NULL/);
  assert.deepEqual(calls[1].params, [3, "%!%!_%", "%!%!_%", "%!%!_%", "open", 20, 0]);
  assert.match(calls[1].sql, /ORDER BY j.published_at DESC/);
});

test("the active filter counts and queries both open and closing offers", async () => {
  const calls = scriptedPool((_sql, _params, index) => index === 0
    ? [[{ status: "open", total: 1 }, { status: "closing", total: 2 }, { status: "draft", total: 5 }]]
    : [[{ slug: "responsable" }]]);
  const { listOffers } = await import(fromText(program));
  const result = await listOffers(recruiter, { status: "active" });
  assert.equal(result.counts.active, 3);
  assert.equal(result.total, 3);
  assert.match(calls[1].sql, /IN \('open', 'closing'\)/);
  assert.deepEqual(calls[1].params, [3, 20, 0]);
});

test("scheduled offers are separate from drafts and active offers", async () => {
  const calls = scriptedPool((_sql, _params, index) => index === 0
    ? [[{ status: "scheduled", total: 2 }, { status: "draft", total: 1 }, { status: "open", total: 1 }]]
    : [[]]);
  const { listOffers } = await import(fromText(program));
  const result = await listOffers(admin, { status: "scheduled" });
  assert.equal(result.total, 2);
  assert.equal(result.counts.draft, 1);
  assert.equal(result.counts.active, 1);
  assert.match(calls[0].sql, /WHEN j\.published_at IS NULL THEN 'draft'\s+WHEN j\.published_at > UTC_TIMESTAMP\(\) THEN 'scheduled'/);
  assert.deepEqual(calls[1].params, ["scheduled", 20, 0]);
});

test("duplication generates a distinct valid slug and leaves the source publication intact", async () => {
  const source = { ...draft, slug: "a".repeat(95) + "-suite", publishedAt: "2026-11-26T12:30:00Z", featured: 1, closed: 1 };
  const calls = scriptedPool(sql => sql.startsWith("SELECT") ? [[source]] : [[]]);
  const { mutateOffer } = await import(fromText(program));
  const first = await mutateOffer(admin, { action: "duplicate", slug: source.slug });
  const second = await mutateOffer(admin, { action: "duplicate", slug: source.slug });
  assert.match(first.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(first.slug.length <= 140);
  assert.notEqual(first.slug, second.slug);
  const inserts = calls.filter(call => call.sql?.startsWith("INSERT INTO recruitment_jobs"));
  assert.deepEqual(inserts.map(({ params }) => [params[0], params[8], params[10]]), [
    [first.slug, null, false], [second.slug, null, false],
  ]);
  assert.equal(calls.some(call => call.sql?.startsWith("UPDATE recruitment_jobs")), false);
});

test("updating content without publishing preserves the locked offer publication date", async () => {
  const publishedAt = "2027-01-03T12:30:00Z";
  const calls = scriptedPool(sql => sql.startsWith("SELECT") ? [[{ ...draft, publishedAt }]] : [[]]);
  const { mutateOffer } = await import(fromText(program));
  await mutateOffer(admin, { action: "update", ...draft });
  assert.match(calls[1].sql, /FOR UPDATE/);
  assert.match(calls[2].sql, /UPDATE recruitment_jobs SET .*published_at = \?/);
  assert(calls[2].params.includes("2027-01-03 12:30:00"));
  await assert.rejects(mutateOffer(admin, { action: "update", ...draft, deadline: "2027-01-02T12:30" }), { status: 422 });
});

test("offer save locks the profile and fixes the public company and privacy-sensitive fields", async () => {
  const calls = scriptedPool(sql => sql.startsWith("SELECT id")
    ? [[{ id: profileId, firstName: "Camille", lastName: "Koné", role: "Recrutement" }]] : [[]]);
  const { mutateOffer } = await import(fromText(program));
  const result = await mutateOffer(admin, { action: "create", ...draft });
  assert.deepEqual(result, { slug: "responsable" });
  assert.match(calls[1].sql, /LIMIT 2 FOR UPDATE/);
  const snapshot = calls[2].params.find(value => typeof value === "string" && value.includes("Camille"));
  assert.deepEqual(JSON.parse(snapshot), {
    name: "Camille Koné", role: "Recrutement", company: "Hopla Groupe", initials: "CK",
    avatar: null, email: null, phone: null, linkedin: null,
  });
  assert.deepEqual(calls[3].params, [1, "offer.create"]);
  assert.deepEqual(calls.slice(4), ["commit", "release"]);
});

test("mutation rejects unauthorized publishing and recruiter deletion before opening a transaction", async () => {
  const { mutateOffer, mutateRecruiter } = await import(fromText(program));
  await assert.rejects(mutateOffer(recruiter, { action: "publish", slug: draft.slug }), { status: 403 });
  await assert.rejects(mutateOffer(recruiter, { action: "update", slug: draft.slug }), { status: 403 });
  await assert.rejects(mutateRecruiter(manager, { action: "delete", id: profileId }), { status: 403 });
  await assert.rejects(mutateRecruiter(admin, { action: "initialize" }), { status: 422 });
});

test("deletion keeps an offer linked to application records and rolls back", async () => {
  const calls = scriptedPool(sql => sql.includes("recrutement_candidatures")
    ? [[{ found: 1 }]] : [[{ ...draft, publishedAt: null }]]);
  const { mutateOffer } = await import(fromText(program));
  await assert.rejects(mutateOffer(admin, { action: "delete", slug: draft.slug, confirmation: draft.slug }), { status: 409 });
  assert.match(calls[1].sql, /FOR UPDATE/);
  assert.deepEqual(calls.slice(3), ["rollback", "release"]);
});

test("publication uses the existing public timestamp and a publishable deadline", async () => {
  const calls = scriptedPool(sql => sql.startsWith("SELECT") ? [[{ ...draft, publishedAt: null,
    deadline: "2027-01-04T00:00:00Z" }]] : [[]]);
  const { mutateOffer } = await import(fromText(program));
  await mutateOffer(admin, { action: "publish", slug: draft.slug, publishedAt: "2027-01-03T12:30" });
  assert.match(calls[2].sql, /published_at = \?, closed = FALSE/);
  assert.deepEqual(calls[2].params, ["2027-01-03 12:30:00", draft.slug]);
  await assert.rejects(
    mutateOffer(admin, { action: "publish", slug: draft.slug, publishedAt: "2027-01-05T00:00" }),
    { status: 422 },
  );
});

test("updating a recruiter writes the profile and associated public snapshots in one transaction", async () => {
  const calls = scriptedPool(sql => sql.startsWith("SELECT") ? [[{ id: profileId }]] : [[]]);
  const { mutateRecruiter } = await import(fromText(program));
  await mutateRecruiter(admin, { action: "update", id: profileId, firstName: "Camille", lastName: "Koné",
    role: "Responsable", company: "Autre entreprise", avatar: "/images/photo.jpg" });
  assert.deepEqual(calls[2].params, ["Camille", "Koné", "Responsable", profileId]);
  assert.match(calls[3].sql, /WHERE recruiter_id = \?/);
  assert.equal(JSON.parse(calls[3].params[0]).company, "Hopla Groupe");
  assert.equal(JSON.parse(calls[3].params[0]).avatar, null);
  assert.deepEqual(calls.slice(5), ["commit", "release"]);
});
