import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const asModule = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const sourceRoot = new URL("../src/modules/recrutement/", import.meta.url);
const fixtureRoot = new URL("../src/lib/blog/write-origin.ts", import.meta.url);

async function load(file, imports, env = {}) {
  let source = await readFile(new URL(file, sourceRoot), "utf8");
  source = `const fixtureEnv = ${JSON.stringify(env)};\n${source.replaceAll("process.env", "fixtureEnv")}`;
  for (const [specifier, target] of Object.entries(imports)) {
    source = source.replaceAll(JSON.stringify(specifier), JSON.stringify(target));
  }
  return asModule(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}

async function setup(handler, env, session) {
  const calls = [];
  const symbol = randomUUID();
  const execute = async (sql, params = []) => {
    calls.push({ sql, params });
    return [await handler(sql, params), []];
  };
  const phases = [];
  globalThis[symbol] = {
    execute,
    getConnection: async () => ({
      execute,
      beginTransaction() { phases.push("begin"); },
      commit() { phases.push("commit"); },
      rollback() { phases.push("rollback"); },
      release() { phases.push("release"); },
    }),
  };
  const db = asModule(`export default globalThis[${JSON.stringify(symbol)}];`);
  const security = await load("server/security.ts", { "@/lib/blog/write-origin": fixtureRoot.href }, env);
  const downloads = await load("server/downloads.ts", {});
  const email = await load("server/email.ts", {
    "./security": security,
    "../admin/settings": asModule("export const resolveRecipients = () => [];"),
    nodemailer: asModule("export default {createTransport() { throw Error('SMTP prohibited in this test'); }};"),
  });
  const backendUrl = await load("admin/applications.ts", {
    "@/lib/db": db, "../server/security": security, "../server/downloads": downloads, "../server/email": email,
    "./settings": asModule("export async function loadRecruitmentSettings() { return { confirmationHours: 24 }; }"),
  }, env);
  const backend = await import(backendUrl);
  async function loadLegacyRoute() {
    const permissions = await load("admin/permissions.ts", {
      "@/lib/auth": asModule(`export const getAdminSession = async () => (${JSON.stringify(session ?? null)});`),
      "@/lib/db": db,
    });
    return import(await load("../../app/api/recrutement/candidatures/documents/[id]/route.ts", {
      "@/modules/recrutement/admin/applications": backendUrl,
      "@/modules/recrutement/admin/permissions": permissions,
      "@/modules/recrutement/server/security": security,
    }));
  }
  async function loadPublicEngine() {
    return import(await load("server/applications.ts", {
      "@/lib/db": db,
      "./security": security,
      "../application/fields": new URL("application/fields.ts", sourceRoot).href,
      "./documents": asModule(`export const maxApplicationBytes = 10 * 1024 * 1024;
        export async function readDocument(file, kind) {
          if (!file) return null;
          return { kind, extension: file.name.split(".").pop(), mimeType: file.type, content: Buffer.from(await file.arrayBuffer()) };
        }`),
      "./jobs": asModule("export const getJob = () => null; export const isOpen = () => false;"),
      "./email": asModule(`export const deliverEmail = async () => true;
        export function getMailer(settings) {
          if (!settings?.confirmationHours) throw new Error("Missing settings");
          return {};
        }
        export const queueEmail = async () => "verification";`),
    }, env));
  }
  delete globalThis[symbol];
  return { backend, calls, phases, loadLegacyRoute, loadPublicEngine };
}

const admin = { id: 1, role: "admin" };
const recruiter = { id: 2, role: "recruiter" };
const spontaneous = "spontaneous_application";
const job = "job_application";
const enabled = {
  RECRUTEMENT_DOCUMENT_ADMIN_IDS: "1",
  RECRUTEMENT_CANDIDATURES_ENABLED: "true",
  RECRUTEMENT_ORIGIN: "https://example.test",
  RECRUTEMENT_TOKEN_KEY: "11".repeat(32),
  RECRUTEMENT_OUTBOX_SECRET: "test-only-secret".repeat(4),
};

test("dashboard omits unconfirmed and spontaneous indicators for recruiters", async () => {
  const { backend, calls } = await setup((sql) => sql.includes("AS validated")
    ? [{ validated: 5, reviewing: 2, shortlisted: 1, today: 1, week: 3 }]
    : []);
  const dashboard = await backend.getApplicationDashboard(recruiter);
  assert.equal(dashboard.validated, 5);
  assert.equal(Object.hasOwn(dashboard, "pending"), false);
  assert.equal(Object.hasOwn(dashboard, "spontaneous"), false);
  assert.doesNotMatch(calls[0].sql, /AS (pending|spontaneous)/);
  for (const { sql, params } of calls) {
    assert.match(sql, /c\.application_type = 'job_application' AND c\.validated_at IS NOT NULL\s+AND EXISTS/);
    assert.deepEqual(params, [recruiter.id]);
  }
});

test("list scopes recruiters to assigned, validated offer applications and excludes pending PII", async () => {
  const { backend, calls } = await setup((sql) => {
    if (sql.includes("GROUP BY status")) return [{ status: "reviewing", total: 100 }, { status: "hired", total: 4 }];
    if (sql.includes("GROUP BY c.job_slug")) return [{ slug: "poste", title: "Intitulé du poste" }];
    return [];
  });
  const result = await backend.listApplications(recruiter, job,
    { q: "a%_", page: "2", status: "reviewing", validation: "validated", offer: "poste" });
  assert.equal(result.page, 2);
  assert.equal(result.total, 100);
  assert.equal(result.allStatuses, 104);
  assert.equal(result.statusCounts.hired, 4);
  assert.deepEqual(result.offers, [{ slug: "poste", title: "Intitulé du poste" }]);
  assert.equal(calls.length, 3);
  for (const { sql, params } of calls) {
    assert.match(sql, /s\.offer_slug = c\.job_slug AND s\.admin_id = \?/);
    assert.match(sql, /c\.application_type = 'job_application' AND c\.validated_at IS NOT NULL/);
    assert.equal(params[0], recruiter.id);
    assert(!sql.includes("a%_"));
  }
  assert(!calls[0].params.includes("reviewing"));
  assert.deepEqual(calls[1].params, [recruiter.id, job]);
  assert.match(calls[2].sql, /IF\(c\.validated_at IS NOT NULL, c\.email, NULL\)/);
  assert(calls[2].params.includes("a%_"));
  assert(calls[2].params.includes("reviewing"));
  await assert.rejects(backend.listApplications(admin, job, { from: "2026-02-30" }), { status: 422 });
  await assert.rejects(backend.listApplications(admin, job, { validation: "other" }), { status: 422 });
});

test("workflow updates preserve email validation and record a change atomically", async () => {
  const id = randomUUID();
  const { backend, calls, phases } = await setup((sql) => sql.includes("FOR UPDATE")
    ? [{ id, applicationType: spontaneous, validatedAt: new Date(), status: "validated" }] : []);
  assert.equal((await backend.mutateApplication(admin, spontaneous, "status", { id, status: "reviewing" })).affected, 1);
  assert.deepEqual(phases, ["begin", "commit", "release"]);
  assert.equal(calls[1].sql, "UPDATE recrutement_candidatures SET workflow_status = ? WHERE id = ?");
  assert.match(calls[2].sql, /INSERT INTO recruitment_admin_application_events/);
  assert.deepEqual(calls[2].params, [id, spontaneous, admin.id, "status", "validated", "reviewing"]);
});

test("an unchanged workflow status produces no update or history event", async () => {
  const id = randomUUID();
  const { backend, calls, phases } = await setup(() => [
    { id, applicationType: spontaneous, validatedAt: new Date(), status: "reviewing" },
  ]);
  const result = await backend.mutateApplication(admin, spontaneous, "status", { id, status: "reviewing" });
  assert.equal(result.affected, 0);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /FOR UPDATE/);
  assert.deepEqual(phases, ["begin", "commit", "release"]);
});

test("notes and workflow require a validated address and scoped batch mutations roll back", async () => {
  const id = randomUUID();
  const { backend, calls, phases } = await setup(() => [{ id, validatedAt: null, status: "pending" }]);
  await assert.rejects(backend.mutateApplication(admin, spontaneous, "note", { id, note: "À contacter" }), { status: 409 });
  await assert.rejects(backend.mutateApplication(recruiter, job, "status", { ids: [id, randomUUID()], status: "hired" }), { status: 404 });
  await assert.rejects(backend.mutateApplication(recruiter, job, "delete", { id, confirm: true }), { status: 404 });
  assert.equal(calls.length, 2);
  assert.deepEqual(phases, ["begin", "rollback", "release", "begin", "rollback", "release"]);
});

test("CSV export selects only validated applications and neutralizes spreadsheet formulas", async () => {
  const { backend, calls } = await setup(() => [{
    lastName: "=1+1", firstName: 'Nom "civil"', email: "candidate@example.test", phone: "+225000000000",
    jobTitle: null, city: "Abidjan", nationality: "CI", desiredPosition: "Architecte",
    createdAt: "2026-11-25T12:00:00Z", validatedAt: "2026-11-25T12:05:00Z", status: "reviewing",
  }]);
  const response = await backend.exportApplications(admin, spontaneous, {});
  await assert.rejects(backend.exportApplications(recruiter, job, {}), { status: 404 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /c\.validated_at IS NOT NULL/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  const csv = await response.text();
  assert.match(csv, /"'=1\+1";"Nom ""civil"""/);
  assert.match(csv, /"'\+225000000000"/);
});

test("private downloads stay authorized with public intake disabled, require an actor-bound ticket and log reads", async (t) => {
  t.mock.method(Date, "now", () => 1_800_000_000_000);
  const id = randomUUID();
  const applicationId = randomUUID();
  const { backend, calls, phases } = await setup((sql) => {
    if (sql.includes("FOR UPDATE")) return [{
      id: applicationId, applicationType: job, status: "reviewing", extension: "pdf", content: Buffer.from("private"),
    }];
    return [{ authorized: 1 }];
  }, {
    RECRUTEMENT_CANDIDATURES_ENABLED: "false",
    RECRUTEMENT_DOCUMENT_ADMIN_IDS: "1",
    RECRUTEMENT_TOKEN_KEY: enabled.RECRUTEMENT_TOKEN_KEY,
  });
  const { ticket } = await backend.issueAdminDocument(recruiter, id);
  await assert.rejects(backend.readAdminDocument(admin, id, ticket), { status: 404 });
  const response = await backend.readAdminDocument(recruiter, id, ticket);
  assert.equal(await response.text(), "private");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(calls[1].sql, /s\.offer_slug = c\.job_slug/);
  assert.deepEqual(calls[2].params, [applicationId, job, recruiter.id, "download", "reviewing", null]);
  assert.deepEqual(phases, ["begin", "commit", "release"]);
});

test("legacy downloads require the current session, role and document scope and log successful reads", async () => {
  const id = randomUUID();
  const applicationId = randomUUID();
  const context = { params: Promise.resolve({ id }) };
  const url = `https://example.test/api/recrutement/candidatures/documents/${id}`;
  const requestTicket = (origin = "https://example.test") => new Request(url, { method: "POST", headers: { Origin: origin } });
  const download = ticket => new Request(url, { headers: { Authorization: `Bearer ${ticket}` } });
  let role = "recruiter";
  let inScope = true;
  const { loadLegacyRoute, calls, phases } = await setup((sql, params) => {
    if (sql.includes("FROM admin_users u")) {
      assert.match(sql, /u\.is_active = TRUE/);
      return [{ role }];
    }
    if (sql.includes("FROM recrutement_documents")) {
      assert.match(sql, /c\.validated_at IS NOT NULL/);
      assert.match(sql, /s\.offer_slug = c\.job_slug AND s\.admin_id = \?/);
      assert.deepEqual(params, [id, recruiter.id]);
      if (!inScope) return [];
      return sql.includes("FOR UPDATE") ? [{
        id: applicationId, applicationType: job, status: "reviewing", extension: "pdf", content: Buffer.from("private"),
      }] : [{ authorized: 1 }];
    }
    return [];
  }, { ...enabled, RECRUTEMENT_CANDIDATURES_ENABLED: "false" }, { adminId: recruiter.id });
  const { GET, POST } = await loadLegacyRoute();
  assert.equal((await POST(requestTicket("https://unrelated.test"), context)).status, 403);
  assert.equal(calls.length, 0);
  const issued = await POST(requestTicket(), context);
  assert.equal(issued.status, 200);
  assert.equal(issued.headers.get("cache-control"), "private, no-store");
  const body = await issued.json();
  assert.equal(body.expiresIn, 300);
  const [path, ticket] = body.url.split("#ticket=");
  assert.equal(path, new URL(url).pathname);
  assert.ok(ticket);

  const noSession = await setup(() => assert.fail("No session must not access the database"), enabled);
  assert.equal((await (await noSession.loadLegacyRoute()).GET(download(ticket), context)).status, 404);
  role = null;
  assert.equal((await GET(download(ticket), context)).status, 404);
  role = "admin";
  assert.equal((await POST(requestTicket(), context)).status, 404);
  role = "recruiter";
  inScope = false;
  assert.equal((await POST(requestTicket(), context)).status, 404);
  assert.equal((await GET(download(ticket), context)).status, 404);
  assert.ok(calls.every(({ sql }) => !sql.includes("INSERT INTO recruitment_admin_application_events")));

  inScope = true;
  const response = await GET(download(ticket), context);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "private");
  assert.match(response.headers.get("content-disposition"), /^attachment;/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(calls.at(-1).params, [applicationId, job, recruiter.id, "download", "reviewing", null]);
  assert.deepEqual(phases, ["begin", "rollback", "release", "begin", "commit", "release"]);
});

test("manual resend queues only a single replacement for an expired link", async () => {
  const id = randomUUID();
  let current = "expired";
  const { backend, calls } = await setup((sql) => {
    if (sql.startsWith("SELECT hits")) return [{ hits: 1 }];
    if (sql.includes("FOR UPDATE")) return [{ id, applicationType: spontaneous, status: current }];
    if (sql.startsWith("UPDATE recrutement_candidatures SET token_hash")) current = "pending";
    return [];
  }, enabled);
  assert.equal((await backend.mutateApplication(admin, spontaneous, "resend", { id })).affected, 1);
  await assert.rejects(backend.mutateApplication(admin, spontaneous, "resend", { id }), { status: 409 });
  const queued = calls.filter(({ sql }) => sql.startsWith("INSERT INTO recrutement_emails"));
  assert.equal(queued.length, 1);
  assert.equal(queued[0].params[1], id);
  assert.equal(queued[0].params[2], "verification");
  assert.equal(queued[0].params[4].byteLength, 32);
  const replacement = calls.find(({ sql }) => sql.includes("TIMESTAMPADD"));
  assert.equal(replacement.params[1], 24);
  assert.equal(replacement.params[2], id);
});

function publicApplication(filename = "cv.pdf", size = 100) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    applicationType: spontaneous, firstName: "Awa", lastName: "Kouamé", email: "awa@example.test",
    phone: "+2250712345678", city: "Abidjan", nationality: "CI", desiredPosition: "Architecte", consent: "on",
  })) form.set(key, value);
  form.set("cv", new File([Buffer.alloc(size)], filename, { type: "application/pdf" }));
  return new Request("https://example.test/api/recrutement/candidatures", {
    method: "POST", headers: { Origin: "https://example.test" }, body: form,
  });
}

test("public settings tighten rate and document restrictions and bind the configured token duration", async () => {
  let hits = 1;
  const { loadPublicEngine, calls } = await setup((sql) => sql.startsWith("SELECT hits") ? [{ hits }] : [], enabled);
  const { submitApplication } = await loadPublicEngine();
  const settings = async () => ({ confirmationHours: 24, allowedFormats: ["pdf"], maxFileMiB: 1, ipLimit: 1, emailLimit: 1 });
  await assert.rejects(submitApplication(publicApplication("cv.doc"), settings), { status: 422 });
  await assert.rejects(submitApplication(publicApplication("cv.pdf", 1024 * 1024 + 1), settings), { status: 422 });
  assert(!calls.some(({ sql }) => sql.startsWith("INSERT INTO recrutement_candidatures")));
  hits = 2;
  await assert.rejects(submitApplication(publicApplication(), settings), { status: 429 });
  hits = 1;
  const response = await submitApplication(publicApplication(), settings);
  assert.equal(response.status, 201);
  const insert = calls.find(({ sql }) => sql.startsWith("INSERT INTO recrutement_candidatures"));
  assert.match(insert.sql, /TIMESTAMPADD\(HOUR, \?, UTC_TIMESTAMP\(\)\)/);
  assert.equal(insert.params.at(-2), 24);
});

test("disabled public submissions do not load operational settings", async () => {
  const { loadPublicEngine, calls } = await setup(() => undefined, { RECRUTEMENT_ORIGIN: "https://example.test" });
  const { submitApplication } = await loadPublicEngine();
  await assert.rejects(submitApplication(publicApplication(), () => {
    throw new Error("Settings must not load while disabled");
  }), { status: 503 });
  assert.equal(calls.length, 0);
});
