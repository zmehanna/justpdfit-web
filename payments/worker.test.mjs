import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.js";

const fingerprint = "a".repeat(64);
const otherFingerprint = "b".repeat(64);
const sessionId = "cs_test_123abc";
const accountId = "acct_JustPDFItTestAccount123";
const env = {
  STRIPE_SECRET_KEY: "sk_test_dummy_for_mock",
  STRIPE_EXPECTED_ACCOUNT_ID: accountId,
  PAYMENTS_MODE: "test",
};
const origin = "https://justpdfit.com";
const url = "https://payments.example.workers.dev";
const mockCalls = [];
let currentPayment = "paid";
let currentAccount = accountId;
let currentAmount = 199;

const realFetch = globalThis.fetch;
globalThis.fetch = async (u, options = {}) => {
  mockCalls.push({ url: String(u), options });
  assert.equal(options.headers.Authorization, "Bearer sk_test_dummy_for_mock");
  if (String(u).endsWith("/account")) return Response.json({ id: currentAccount });
  if (String(u).endsWith("/checkout/sessions")) {
    const params = options.body;
    assert.equal(params.get("line_items[0][price_data][unit_amount]"), "199");
    assert.equal(params.get("metadata[fingerprint]"), fingerprint);
    return Response.json({ id: sessionId, url: "https://checkout.stripe.com/c/pay/mock" });
  }
  if (String(u).endsWith("/checkout/sessions/" + sessionId)) {
    return Response.json({
      id: sessionId,
      mode: "payment",
      status: "complete",
      payment_status: currentPayment,
      currency: "eur",
      amount_total: currentAmount,
      metadata: { kind: "solo-clean", fingerprint },
    });
  }
  throw Error("Unexpected Stripe URL: " + u);
};
process.on("exit", () => { globalThis.fetch = realFetch; });

async function call(path, body, { mode = "POST", e = env, o = origin, contentType = "application/json" } = {}) {
  const headers = { Origin: o };
  if (contentType) headers["Content-Type"] = contentType;
  return worker.fetch(new Request(url + path, {
    method: mode, headers,
    ...(mode === "POST" ? { body: JSON.stringify(body) } : {}),
  }), e);
}

test("health is explicit and never requires a real charge", async () => {
  const r = await call("/health", null, { mode: "GET" });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { service: "justpdfit-payments", status: "configured", mode: "test" });
});

test("server returns a Checkout URL for the exact 199-cent solo option", async () => {
  mockCalls.length = 0;
  const r = await call("/checkout", { kind: "solo-clean", fingerprint });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { sessionId, checkoutUrl: "https://checkout.stripe.com/c/pay/mock" });
  assert.equal(mockCalls.length, 2);
});

test("other premium flows are not charged until fulfilment exists", async () => {
  mockCalls.length = 0;
  const r = await call("/checkout", { kind: "duo-otp", fingerprint });
  assert.equal(r.status, 422);
  assert.equal(mockCalls.length, 0);
});

test("paid session with matching fingerprint unlocks", async () => {
  currentPayment = "paid";
  currentAmount = 199;
  assert.deepEqual(await (await call("/verify", { sessionId, fingerprint })).json(), { paid: true });
});

test("another document cannot reuse the paid session", async () => {
  assert.deepEqual(await (await call("/verify", { sessionId, fingerprint: otherFingerprint })).json(), { paid: false });
});

test("unpaid and wrong-amount sessions cannot unlock", async () => {
  currentPayment = "unpaid";
  assert.deepEqual(await (await call("/verify", { sessionId, fingerprint })).json(), { paid: false });
  currentPayment = "paid";
  currentAmount = 398;
  assert.deepEqual(await (await call("/verify", { sessionId, fingerprint })).json(), { paid: false });
  currentAmount = 199;
});

test("wrong account cannot charge", async () => {
  currentAccount = "acct_not_JustPDFit";
  const r = await call("/checkout", { kind: "solo-clean", fingerprint });
  assert.equal(r.status, 502);
  currentAccount = accountId;
});

test("wrong Stripe key mode fails closed", async () => {
  const r = await call("/checkout", { kind: "solo-clean", fingerprint }, {
    e: { ...env, PAYMENTS_MODE: "live" },
  });
  assert.equal(r.status, 503);
});

test("unknown origin is forbidden with no allow-origin header", async () => {
  const r = await call("/checkout", { kind: "solo-clean", fingerprint }, { o: "https://evil.example" });
  assert.equal(r.status, 403);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), null);
});

test("rejects invalid input and does not call Stripe", async () => {
  mockCalls.length = 0;
  const r = await call("/checkout", { kind: "solo-clean", fingerprint: "not-a-hash" });
  assert.equal(r.status, 400);
  assert.equal(mockCalls.length, 0);
});

test("preflight CORS responds to JustPDFit origin", async () => {
  const r = await worker.fetch(new Request(url + "/checkout", { method: "OPTIONS", headers: { Origin: origin } }), env);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), origin);
});