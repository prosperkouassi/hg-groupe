import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const stub = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const directory = new URL("../src/modules/recrutement/admin/", import.meta.url);

async function moduleUrl(file, imports = {}) {
  let source = await readFile(new URL(file, directory), "utf8");
  for (const [name, target] of Object.entries(imports)) {
    source = source.replaceAll(JSON.stringify(name), JSON.stringify(target));
  }
  return stub(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}

function permissions(session, account) {
  return moduleUrl("permissions.ts", {
    "@/lib/auth": stub(`export async function getAdminSession() { return ${JSON.stringify(session)}; }`),
    "@/lib/db": stub(account === undefined
      ? "throw new Error('Unauthorized requests must not read the database');"
      : `export default { execute: async (query, args) => {
        if (!query.includes("u.is_active = TRUE") || args[0] !== 42) throw new Error("Incorrect scope");
        return [[${account ? JSON.stringify(account) : ""}]];
      } };`),
  });
}

test("recruitment session and module roles fail closed", async () => {
  for (const [session, account, expected] of [
    [null, undefined, 401],
    [{ adminId: 42 }, null, 401],
    [{ adminId: 42 }, { role: null }, 403],
    [{ adminId: 42 }, { role: "unknown" }, 403],
  ]) {
    const { getRecruitmentActor } = await import(await permissions(session, account));
    await assert.rejects(getRecruitmentActor(), { status: expected });
  }
});

test("active administrative sessions receive only their explicit recruitment role", async () => {
  const session = { adminId: 42 };
  const { getRecruitmentActor, requireRecruitmentRole } = await import(await permissions(
    session, { name: "Profil Test", email: "admin@example.test", role: "recruiter" },
  ));
  const { actor } = await getRecruitmentActor();
  assert.deepEqual(actor, { id: 42, role: "recruiter" });
  assert.throws(() => requireRecruitmentRole(actor, "admin"), { status: 403 });
});

const settingsUrl = await moduleUrl("settings.ts", {
  "./permissions": await permissions(null),
  "@/lib/db": stub("throw new Error('Non-admin settings requests must not access storage');"),
});
const { parseSettings, readSettings, resolveRecipients, updateSettingsCategory, saveSettings } = await import(settingsUrl);
const settings = {
  administratorEmail: "admin@example.test", sender: "sender@example.test", additionalRecipient: "admin@example.test",
  verificationSubject: "Validation", recruiterSubject: "Une candidature", candidateSubject: "Confirmation",
  verificationBody: "Validez", recruiterBody: "Nouvelle candidature", candidateBody: "Dossier reçu",
  signature: "Hopla Groupe", confirmationHours: 48, allowedFormats: ["pdf"], maxFileMiB: 5,
  consentText: "Consentement", retentionDays: 30, ipLimit: 12, emailLimit: 3,
};

test("settings cannot relax limits, add unsupported formats or inject mail headers", async () => {
  await assert.rejects(readSettings({ id: 42, role: "manager" }), { status: 403 });
  for (const override of [
    { ipLimit: 13 }, { maxFileMiB: 6 }, { confirmationHours: 49 }, { allowedFormats: ["zip"] },
    { honeypot: false }, { anonymize: true, automaticDeletion: true }, { recruiterSubject: "Subject\nCc: x@example.test" },
  ]) {
    assert.throws(() => parseSettings({ ...settings, ...override }), { status: 422 });
  }
});

test("recipient resolution permits only the server administrator and the independently approved additional address", () => {
  const administrator = "original@example.test";
  const additionalRecipient = "new@example.test";
  const configured = parseSettings({ ...settings, administratorEmail: "untrusted@example.test", additionalRecipient });
  assert.deepEqual(resolveRecipients({ ...configured, additionalRecipientConfirmed: true }, administrator, ""), [administrator]);
  assert.deepEqual(resolveRecipients(configured, administrator, " NEW@example.test "), [administrator, "NEW@example.test"]);
  assert.deepEqual(resolveRecipients({ ...configured, additionalRecipient: "changed@example.test" }, administrator, additionalRecipient),
    [administrator]);
  assert.deepEqual(resolveRecipients({ ...configured, additionalRecipient: "ORIGINAL@example.test" }, administrator, administrator),
    [administrator]);
});

test("saving a category ignores values outside its scope and cannot self-confirm a recipient", async () => {
  const previous = parseSettings({ ...settings, additionalRecipientConfirmed: true });
  const quotas = updateSettingsCategory(previous, {
    category: "securite", ipLimit: 6, emailLimit: 2, signature: "Unexpected", additionalRecipientConfirmed: false,
  });
  assert.deepEqual(quotas, { ...previous, ipLimit: 6, emailLimit: 2 });
  const messaging = updateSettingsCategory(quotas, {
    category: "messagerie", administratorEmail: "untrusted@example.test", sender: previous.sender, signature: previous.signature,
    additionalRecipient: "additional@example.test", additionalRecipientConfirmed: true,
  });
  assert.equal(messaging.additionalRecipientConfirmed, false);
  assert.equal(messaging.administratorEmail, previous.administratorEmail);
  assert.equal(messaging.ipLimit, 6);
  assert.throws(() => updateSettingsCategory(messaging, { category: "__proto__" }), { status: 422 });
  await assert.rejects(saveSettings({ id: 42, role: "manager" }, { category: "securite" }), { status: 403 });
});

test("partial settings saves lock the stored configuration and preserve other categories", async () => {
  const key = Symbol.for("hopla-recruitment-settings-test");
  let configuration = parseSettings(settings);
  const steps = [];
  globalThis[key] = {
    async getConnection() {
      return {
        async beginTransaction() { steps.push("begin"); },
        async execute(sql, args) {
          if (sql.startsWith("INSERT INTO recruitment_admin_settings")) steps.push("upsert");
          else if (sql.endsWith("FOR UPDATE")) {
            steps.push("read locked");
            return [[{ configuration }]];
          } else if (sql.startsWith("UPDATE recruitment_admin_settings")) {
            steps.push("update");
            configuration = JSON.parse(args[0]);
          } else if (sql.startsWith("INSERT INTO recruitment_admin_audit")) steps.push("audit");
        },
        async commit() { steps.push("commit"); },
        async rollback() { steps.push("rollback"); },
        release() { steps.push("release"); },
      };
    },
  };
  try {
    const url = await moduleUrl("settings.ts", {
      "./permissions": await permissions(null),
      "@/lib/db": stub('export default globalThis[Symbol.for("hopla-recruitment-settings-test")];'),
    });
    const { saveSettings } = await import(url);
    const actor = { id: 42, role: "admin" };
    await saveSettings(actor, { category: "securite", ipLimit: 8, emailLimit: 2 });
    await saveSettings(actor, { category: "conservation", retentionDays: 90, anonymize: true, automaticDeletion: false });
    assert.deepEqual(configuration, { ...parseSettings(settings), ipLimit: 8, emailLimit: 2, retentionDays: 90, anonymize: true });
    const transaction = ["begin", "upsert", "read locked", "update", "audit", "commit", "release"];
    assert.deepEqual(steps, [...transaction, ...transaction]);
  } finally {
    delete globalThis[key];
  }
});

const security = stub("export const sealQueuedToken = () => ''; export const tokenHash = () => ''; export const unsealQueuedToken = () => '';");
const emailUrl = await moduleUrl("../server/email.ts", {
  "./security": security,
  "../admin/settings": settingsUrl,
  nodemailer: stub("export default { createTransport() { throw new Error('Live SMTP is forbidden in tests'); } };"),
});
const { deliverEmail, getMailer } = await import(emailUrl);
const emailFixture = {
  application_id: "fixture-id", kind: "recruiter", token: null, attempts: 0,
  email: "candidate@example.test", first_name: "Prénom", last_name: "Nom",
  application_type: "spontaneous_application", job_title: null,
  desired_position: "Designer", created_at_iso: "2026-11-25T12:00:00Z",
};
const deliveryConfig = { origin: "https://example.test", key: Buffer.alloc(32) };

test("the existing outbox sends validated applications through the supplied mail transport", async () => {
  const messages = [];
  const queries = [];
  const db = {
    async execute(sql) {
      queries.push(sql);
      if (/SELECT e\.application_id/.test(sql)) return [[emailFixture]];
      return [{ affectedRows: 1 }];
    },
  };
  const mailer = {
    admin: "admin@example.test", from: "sender@example.test",
    transporter: { async sendMail(message) { messages.push(message); return { accepted: [mailer.admin] }; } },
  };
  assert.equal(await deliverEmail(db, deliveryConfig, mailer, "outbox-id"), true);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to.address, mailer.admin);
  assert.equal(messages[0].attachments, undefined);
  assert.match(messages[0].text, /Prénom Nom/);
  assert.match(messages[0].text, /Designer/);
  assert.match(queries.at(-1), /sent_at = UTC_TIMESTAMP/);
});

test("mailer fails closed without an administrator authorized by the server", (t) => {
  const original = process.env.RECRUTEMENT_EMAIL_ADMIN;
  delete process.env.RECRUTEMENT_EMAIL_ADMIN;
  t.after(() => { if (original !== undefined) process.env.RECRUTEMENT_EMAIL_ADMIN = original; });
  assert.throws(() => getMailer(parseSettings(settings)), /Recruitment email configuration is incomplete/);
});

test("retry sends only to approved recipients who did not previously accept the notification", async (t) => {
  const policyKey = "RECRUTEMENT_EMAIL_VERIFIED_ADDITIONAL_RECIPIENT";
  const original = process.env[policyKey];
  process.env[policyKey] = "second@example.test";
  t.after(() => {
    if (original === undefined) delete process.env[policyKey];
    else process.env[policyKey] = original;
  });
  const messages = [];
  const receipts = [];
  let rejectedOnce = false;
  const db = {
    async execute(sql, parameters) {
      if (/SELECT e\.application_id/.test(sql)) return [[emailFixture]];
      if (/SELECT LOWER\(HEX/.test(sql)) return [receipts];
      if (/INSERT INTO recruitment_admin_mail_receipts/.test(sql)) receipts.push({ digest: parameters[0] });
      return [{ affectedRows: 1 }];
    },
  };
  const mailer = {
    admin: "admin@example.test", from: "sender@example.test",
    settings: parseSettings({ ...settings, administratorEmail: "untrusted@example.test", additionalRecipient: "second@example.test" }),
    transporter: {
      async sendMail(message) {
        messages.push(message);
        if (message.to.address === "second@example.test" && !rejectedOnce) {
          rejectedOnce = true;
          return { accepted: [] };
        }
        return { accepted: [message.to.address] };
      },
    },
  };
  assert.equal(await deliverEmail(db, deliveryConfig, mailer, "outbox-id"), false);
  assert.equal(await deliverEmail(db, deliveryConfig, mailer, "outbox-id"), true);
  assert.deepEqual(messages.map(({ to }) => to.address), ["admin@example.test", "second@example.test", "second@example.test"]);
  assert.equal(messages[1].messageId, messages[2].messageId);
  assert.match(messages[2].text, /\/admin\/recrutement\/spontanees\?id=fixture-id/);
  assert.equal(receipts.length, 2);
});
