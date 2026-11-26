import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("../scripts/recruitment-outbox.mjs", import.meta.url));
const secret = "fake-outbox-token-for-tests-only-0000";
const privateBody = "fictional-candidate-email-content";

function run(scenario, env) {
  const setup = `
    import assert from "node:assert/strict";
    const scenario = ${JSON.stringify(scenario)};
    const privateBody = ${JSON.stringify(privateBody)};
    const secret = ${JSON.stringify(secret)};
    const controller = new AbortController();
    let timeoutConfigured = false;
    AbortSignal.timeout = ms => {
      if (ms !== 90_000) process.exit(91);
      timeoutConfigured = true;
      return controller.signal;
    };
    globalThis.fetch = async (url, options) => {
      if (scenario === "no-call") process.exit(92);
      try {
        assert.equal(url, "https://hoplagroupe.com/api/recrutement/candidatures/notifications");
        assert.equal(options.method, "POST");
        assert.deepEqual(options.headers, { Authorization: "Bearer " + secret });
        assert.equal(options.redirect, "error");
        assert.equal(options.signal, controller.signal);
        assert.equal(timeoutConfigured, true);
      } catch {
        process.exit(93);
      }
      if (scenario === "redirect") throw new TypeError("Redirect: " + secret + privateBody);
      if (scenario === "timeout") {
        controller.abort(new DOMException(secret + privateBody, "TimeoutError"));
        throw options.signal.reason;
      }
      return new Response(privateBody, { status: scenario === "http-error" ? 503 : 200 });
    };
  `;
  const preload = `data:text/javascript;base64,${Buffer.from(setup).toString("base64")}`;
  const result = spawnSync(process.execPath, ["--import", preload, script], { env, encoding: "utf8", timeout: 10_000 });
  if (result.error) throw result.error;
  const output = result.stdout + result.stderr;
  assert(!output.includes(secret));
  assert(!output.includes(privateBody));
  return { status: result.status, output };
}

const enabled = { RECRUTEMENT_CANDIDATURES_ENABLED: "true" };
const configured = { ...enabled, RECRUTEMENT_OUTBOX_SECRET: secret };

test("cron skips without fetch when applications are disabled or the flag is absent", () => {
  for (const env of [{ RECRUTEMENT_CANDIDATURES_ENABLED: "false" }, {}]) {
    const { status, output } = run("no-call", env);
    assert.equal(status, 0);
    assert.match(output, /Aucun appel/);
  }
});

test("cron refuses a missing secret without fetch", () => {
  const { status, output } = run("no-call", enabled);
  assert.equal(status, 1);
  assert.match(output, /absent ou invalide/);
});

test("cron refuses short, malformed and whitespace-padded secrets without fetch", () => {
  for (const value of ["short", `${secret}\ninvalid`, ` ${secret}`]) {
    const { status, output } = run("no-call", { ...enabled, RECRUTEMENT_OUTBOX_SECRET: value });
    assert.equal(status, 1);
    assert.match(output, /absent ou invalide/);
  }
});

test("cron accepts HTTP 200 without logging the response body", () => {
  const { status, output } = run("success", configured);
  assert.equal(status, 0);
  assert.match(output, /planificateur Recrutement terminé/);
});

test("cron refuses to transmit the secret if TLS verification is disabled", () => {
  const { status, output } = run("no-call", { ...configured, NODE_TLS_REJECT_UNAUTHORIZED: "0" });
  assert.equal(status, 1);
  assert.match(output, /vérification du certificat TLS/);
});

test("cron reports HTTP errors using only their status code", () => {
  const { status, output } = run("http-error", configured);
  assert.equal(status, 1);
  assert.match(output, /HTTP 503/);
});

test("cron disallows redirects and logs no raw fetch error", () => {
  const { status, output } = run("redirect", configured);
  assert.equal(status, 1);
  assert.match(output, /interrompu/);
});

test("cron passes a bounded signal to fetch and handles its expiration", () => {
  const { status, output } = run("timeout", configured);
  assert.equal(status, 1);
  assert.match(output, /interrompu/);
});
