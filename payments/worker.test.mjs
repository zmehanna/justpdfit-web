import test from "node:test";
import assert from "node:assert/strict";
import worker, { verifyWebhookSignature } from "./worker.js";

const ORIGIN = "https://justpdfit.com";
const ROOT = "https://payments.example.workers.dev";
const ACCOUNT = "acct_JustPDFItOnly123";
const HASH = "a".repeat(64);
const OTHER_HASH = "b".repeat(64);
const SESSION = "cs_test_mock123";
const INTENT = "pi_Test123";
const SECRET = "whsec_testing_private_key_123456789";
const dbData = new Map();
const events = new Map();
const revokedIntents = new Set();
const db = {
  prepare(sql) {
    return {
      async first() {
        if (sql.startsWith("SELECT session_id FROM payment_orders")) return null;
        if (sql.startsWith("SELECT payment_intent_id FROM revoked_payment_intents")) return null;
        throw Error("Unexpected direct SELECT " + sql);
      },
      bind(...args) {
        return {
          async first() {
            if (sql.startsWith("SELECT session_id FROM payment_orders")) return null;
            if (sql.startsWith("SELECT payment_intent_id FROM revoked_payment_intents")) {
              return revokedIntents.has(args[0]) ? {payment_intent_id:args[0]} : null;
            }
            if (!sql.startsWith("SELECT payment_status")) throw Error("Unknown SELECT " + sql);
            const state = dbData.get(args[0]);
            return state ? { payment_status: state.status } : null;
          },
          async run() {
            if (sql.startsWith("INSERT INTO payment_orders")) {
              const [id, hash, kind, amount, currency, status, intent] = args;
              const old = dbData.get(id);
              dbData.set(id, { hash, kind, amount, currency, intent,
                status: old?.status === "revoked" ? "revoked" :
                  old?.status === "paid" || status === "paid" ? "paid" : status });
            } else if (sql.startsWith("INSERT OR IGNORE INTO revoked_payment_intents")) {
              revokedIntents.add(args[0]);
            } else if (sql.startsWith("INSERT OR IGNORE INTO stripe_events")) {
              if (!events.has(args[0])) events.set(args[0], args[1]);
            } else if (sql.startsWith("UPDATE payment_orders")) {
              for (const [id, item] of dbData) {
                if (item.intent === args[0]) dbData.set(id, { ...item, status: "revoked" });
              }
            } else throw Error("Unexpected SQL " + sql);
            return { success: true };
          }
        };
      }
    };
  }
};
const env = {
  STRIPE_RESTRICTED_KEY: "rk_test_mock_for_tests",
  STRIPE_WEBHOOK_SECRET: SECRET,
  STRIPE_EXPECTED_ACCOUNT_ID: ACCOUNT,
  PAYMENTS_MODE: "test",
  PAYMENTS_DB: db
};
let current = {};
let currentAccount = ACCOUNT;
const calls = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (target, options = {}) => {
  const u = String(target);
  calls.push({ url: u, options });
  assert.equal(options.headers.Authorization, "Bearer rk_test_mock_for_tests");
  assert.equal(options.headers["Stripe-Version"], "2026-09-30.endive");
  if (u.endsWith("/account")) return Response.json({ id: currentAccount });
  if (u.endsWith("/checkout/sessions")) {
    const form = options.body;
    assert.equal(form.get("line_items[0][price_data][unit_amount]"), "199");
    assert.equal(form.get("metadata[fingerprint]"), HASH);
    assert.match(form.get("integration_identifier"), /^justpdfit_web_[a-z]{8}$/);
    return Response.json({ id: SESSION, url: "https://checkout.stripe.com/c/pay/justpdfit" });
  }
  if (u.endsWith("/checkout/sessions/" + SESSION)) {
    return Response.json(session(current));
  }
  throw Error("Unexpected mock Stripe request " + u);
};
process.on("exit", () => { globalThis.fetch = originalFetch; });
function session(overrides = {}) {
  return {
    id: SESSION, livemode: false, mode: "payment",
    amount_total: 199, currency: "eur",
    metadata: { kind: "solo-clean", fingerprint: HASH },
    payment_intent: INTENT,
    status: "complete", payment_status: "paid", ...overrides
  };
}
function req(path, body, { origin = ORIGIN, method = "POST", env: e = env, contentType = "application/json" } = {}) {
  const headers = { Origin: origin };
  if (contentType) headers["Content-Type"] = contentType;
  return worker.fetch(new Request(ROOT + path, {
    method, headers, ...(method === "POST" ? { body: JSON.stringify(body) } : {})
  }), e);
}
async function signEvent(event, sec = SECRET, timestamp = Math.floor(Date.now() / 1000)) {
  const raw = JSON.stringify(event);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(sec),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key,
    new TextEncoder().encode(timestamp + "." + raw));
  const sig = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("");
  return { raw, header: "t=" + timestamp + ",v1=" + sig };
}
async function deliver(event, opts = {}) {
  const { raw, header } = await signEvent(event, opts.secret || SECRET, opts.timestamp);
  return worker.fetch(new Request(ROOT + "/webhook", {
    method: "POST", headers: { "Stripe-Signature": opts.invalid ? header.slice(0, -1) + "0" : header },
    body: raw
  }), opts.env || env);
}
function event(id, type, object = session()) {
  return { id, type, livemode: false, data: { object } };
}

test("health reports readiness for correctly configured isolated JustPDFit Worker", async () => {
  const r = await req("/health", null, { method: "GET" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { service: "justpdfit-payments", status: "configured", mode: "test" });
});

test("€1.99 Checkout session uses server amount and checks account identity", async () => {
  calls.length = 0;
  const r = await req("/checkout", { fingerprint: HASH, kind: "solo-clean", amount: 1 });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(),
    { sessionId: SESSION, checkoutUrl: "https://checkout.stripe.com/c/pay/justpdfit" });
  assert.equal(calls.length, 2);
});

test("Checkout follows the website locale and localizes its product title", async () => {
  const cases = [
    ["en", "en", "JustPDFit - Signed PDF without watermark"],
    ["fr", "fr", "JustPDFit - PDF signé sans filigrane"],
    ["es", "es", "JustPDFit - PDF firmado sin marca de agua"],
    ["de", "de", "JustPDFit - Signiertes PDF ohne Wasserzeichen"],
    ["pt", "pt", "JustPDFit - PDF assinado sem marca d'água"],
    ["fil", "fil", "JustPDFit - Nilagdaang PDF na walang watermark"],
    ["ar", "en", "JustPDFit - Signed PDF without watermark"],
    ["hi", "en", "JustPDFit - Signed PDF without watermark"],
    ["ur", "en", "JustPDFit - Signed PDF without watermark"],
    ["fa", "en", "JustPDFit - Signed PDF without watermark"],
    ["<script>", "en", "JustPDFit - Signed PDF without watermark"],
    [undefined, "en", "JustPDFit - Signed PDF without watermark"]
  ];
  for (const [locale, expected, title] of cases) {
    calls.length = 0;
    const response = await req("/checkout", { fingerprint: HASH, kind: "solo-clean", locale });
    assert.equal(response.status, 200, "checkout success for " + locale);
    const stripeRequest = calls.find(call => call.url.endsWith("/checkout/sessions"));
    assert.ok(stripeRequest, "Stripe Checkout called for " + locale);
    assert.equal(stripeRequest.options.body.get("locale"), expected);
    assert.equal(stripeRequest.options.body.get("line_items[0][price_data][product_data][name]"), title);
    assert.equal(stripeRequest.options.body.get("line_items[0][price_data][unit_amount]"), "199");
  }
});

test("wrong account aborts without creating Checkout session", async () => {
  calls.length = 0;
  currentAccount = "acct_NotJustPDFIt";
  assert.equal((await req("/checkout", { fingerprint: HASH, kind: "solo-clean" })).status, 502);
  assert.equal(calls.length, 1);
  currentAccount = ACCOUNT;
});

test("unfinished services cannot charge", async () => {
  calls.length = 0;
  assert.equal((await req("/checkout", { fingerprint: HASH, kind: "duo-otp" })).status, 422);
  assert.equal(calls.length, 0);
});

test("a paid session unlocks only the same document and stores server-side proof", async () => {
  dbData.clear();
  current = {};
  assert.deepEqual(await (await req("/verify", { fingerprint: OTHER_HASH, sessionId: SESSION })).json(), { paid: false });
  assert.deepEqual(await (await req("/verify", { fingerprint: HASH, sessionId: SESSION })).json(), { paid: true });
  assert.equal(dbData.get(SESSION).status, "paid");
});

test("unpaid/wrong-amount sessions do not unlock", async () => {
  current = { payment_status: "unpaid" };
  assert.deepEqual(await (await req("/verify", { fingerprint: HASH, sessionId: SESSION })).json(), { paid: false });
  current = { amount_total: 398 };
  assert.deepEqual(await (await req("/verify", { fingerprint: HASH, sessionId: SESSION })).json(), { paid: false });
  current = {};
});

test("invalid, wrong mode, unconfigured and cross-origin requests fail closed", async () => {
  assert.equal((await req("/checkout", { fingerprint: "invalid", kind: "solo-clean" })).status, 400);
  assert.equal((await req("/verify", { fingerprint: HASH, sessionId: "cs_live_wrong" })).status, 400);
  assert.equal((await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { env: { ...env, PAYMENTS_MODE: "live" } })).status, 503);
  assert.equal((await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { env: { ...env, PAYMENTS_DB: undefined } })).status, 503);
  assert.equal((await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { env: { ...env, STRIPE_WEBHOOK_SECRET: undefined } })).status, 503);
  const cross = await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { origin: "https://hostile.example" });
  assert.equal(cross.status, 403);
  assert.equal(cross.headers.get("Access-Control-Allow-Origin"), null);
});

test("production refuses a FairTaxy account ID even if a live Stripe key is configured", async () => {
  const badLiveEnv = {
    ...env,
    STRIPE_RESTRICTED_KEY: "rk_live_test_only_mock_credential",
    PAYMENTS_MODE: "live",
    STRIPE_EXPECTED_ACCOUNT_ID: "acct_1UWgA3L7h2qjW2we"
  };
  const validJustPDFitEnv = {
    ...badLiveEnv,
    STRIPE_EXPECTED_ACCOUNT_ID: "acct_1UaLHoEQp3CN3XtA"
  };
  calls.length = 0;
  const refused = await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { env: badLiveEnv });
  assert.equal(refused.status, 503);
  assert.equal(calls.length, 0);
  const health = await req("/health", null, { method: "GET", env: validJustPDFitEnv });
  assert.equal((await health.json()).status, "configured");
});

test("missing D1 schema blocks checkout before Stripe is called", async () => {
  calls.length = 0;
  const emptyDb = { prepare() { return { first: async () => { throw Error("no such table: payment_orders"); } }; } };
  const r = await req("/checkout", { fingerprint: HASH, kind: "solo-clean" },
    { env: { ...env, PAYMENTS_DB: emptyDb } });
  assert.equal(r.status, 502);
  assert.equal(calls.length, 0);
});

test("browser preflight CORS permits only origin and the JSON endpoint", async () => {
  const r = await worker.fetch(new Request(ROOT + "/checkout",
    { method: "OPTIONS", headers: { Origin: ORIGIN } }), env);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("webhook HMAC rejects tampering and expired timestamps", async () => {
  const payload = JSON.stringify(event("evt_valid1", "checkout.session.completed"));
  const signed = await signEvent(JSON.parse(payload));
  assert.equal(await verifyWebhookSignature(signed.raw, signed.header, SECRET), true);
  assert.equal(await verifyWebhookSignature(signed.raw + " ", signed.header, SECRET), false);
  assert.equal(await verifyWebhookSignature(signed.raw, signed.header, "whsec_othersecret123456789"), false);
  const expired = await signEvent(JSON.parse(payload), SECRET, Math.floor(Date.now() / 1000) - 1000);
  assert.equal(await verifyWebhookSignature(expired.raw, expired.header, SECRET), false);
});

test("webhook registers paid session independently of browser return", async () => {
  dbData.clear();
  events.clear();
  const r = await deliver(event("evt_paid1", "checkout.session.completed"));
  assert.equal(r.status, 200);
  assert.equal(dbData.get(SESSION).status, "paid");
  assert.equal(events.get("evt_paid1"), "checkout.session.completed");
});

test("duplicate signed webhook is idempotent", async () => {
  assert.equal((await deliver(event("evt_paid1", "checkout.session.completed"))).status, 200);
  assert.equal(events.size, 1);
});

test("delayed payment does not unlock until async success", async () => {
  dbData.clear();
  const pending = session({ status: "complete", payment_status: "unpaid" });
  assert.equal((await deliver(event("evt_pending", "checkout.session.completed", pending))).status, 200);
  assert.equal(dbData.get(SESSION).status, "pending");
  assert.equal((await deliver(event("evt_asyncpaid", "checkout.session.async_payment_succeeded"))).status, 200);
  assert.equal(dbData.get(SESSION).status, "paid");
});

test("refund webhook revokes future verification", async () => {
  assert.equal((await deliver(event("evt_refund", "charge.refunded",
    { payment_intent: INTENT }))).status, 200);
  assert.equal(dbData.get(SESSION).status, "revoked");
  assert.deepEqual(await (await req("/verify", { fingerprint: HASH, sessionId: SESSION })).json(), { paid: false });
});

test("refund arriving before payment completion remains revoked", async () => {
  dbData.clear();
  revokedIntents.clear();
  assert.equal((await deliver(event("evt_earlyRefund", "charge.refunded",
    { payment_intent: INTENT }))).status, 200);
  assert.equal(revokedIntents.has(INTENT), true);
  assert.equal((await deliver(event("evt_paidLater", "checkout.session.completed"))).status, 200);
  assert.equal(dbData.get(SESSION).status, "revoked");
  assert.deepEqual(await (await req("/verify", { fingerprint: HASH, sessionId: SESSION })).json(), { paid: false });
  revokedIntents.clear();
  dbData.clear();
});

test("webhook rejects invalid signature, wrong account, wrong mode", async () => {
  assert.equal((await deliver(event("evt_bad1", "checkout.session.completed"), { invalid: true })).status, 400);
  assert.equal((await deliver({ ...event("evt_bad2", "checkout.session.completed"), livemode: true })).status, 400);
  assert.equal((await deliver({ ...event("evt_bad3", "checkout.session.completed"), account: "acct_FairTaxy" })).status, 400);
});

test("wrong session currency and metadata are not fulfilled by webhook", async () => {
  dbData.clear();
  assert.equal((await deliver(event("evt_wrongproduct", "checkout.session.completed",
    session({ currency: "usd" })))).status, 200);
  assert.equal(dbData.has(SESSION), false);
});