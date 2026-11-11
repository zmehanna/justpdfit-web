/**
 * JustPDFit Stripe Checkout Worker. This is a STAGED integration, not deployed.
 * Only the solo watermark-free PDF (€1.99) can be charged. No PDF is uploaded.
 *
 * REQUIRED SECRETS (Cloudflare, never commit values):
 *   STRIPE_RESTRICTED_KEY (preferred rk_*; STRIPE_SECRET_KEY also accepted)
 *   STRIPE_WEBHOOK_SECRET (whsec_*)
 *   STRIPE_EXPECTED_ACCOUNT_ID (acct_* of JustPDFit ONLY)
 * REQUIRED VAR/BINDINGS:
 *   PAYMENTS_MODE = "test" | "live"
 *   PAYMENTS_DB = dedicated D1 database migrated with migrations/0001_orders.sql
 */
const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2026-09-30.endive";
const ORIGINS = new Set(["https://justpdfit.com", "https://www.justpdfit.com"]);
const HASH = /^[0-9a-f]{64}$/i;
const SESSION_ID = /^cs_(?:test_|live_)[A-Za-z0-9]+$/;
const PAID_KIND = "solo-clean";
const PRICE_CENTS = 199;
const ENCODER = new TextEncoder();

function cors(origin) {
  const h = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
  if (ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return h;
}
function respond(origin, data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors(origin) });
}
const accountPattern = /^acct_[A-Za-z0-9]+$/;
function credential(env) {
  return env?.STRIPE_RESTRICTED_KEY || env?.STRIPE_SECRET_KEY || "";
}
function ready(env) {
  const mode = env?.PAYMENTS_MODE;
  const prefix = mode === "test" ? /^(rk|sk)_test_/ : mode === "live" ? /^(rk|sk)_live_/ : null;
  return !!(prefix && prefix.test(credential(env)) &&
    accountPattern.test(env.STRIPE_EXPECTED_ACCOUNT_ID || "") &&
    /^whsec_[A-Za-z0-9_-]{16,}$/.test(env.STRIPE_WEBHOOK_SECRET || "") &&
    env.PAYMENTS_DB && typeof env.PAYMENTS_DB.prepare === "function");
}
async function stripe(env, path, options = {}) {
  const result = await fetch(STRIPE_API + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + credential(env),
      "Stripe-Version": STRIPE_VERSION,
      ...(options.headers || {})
    }
  });
  const json = await result.json().catch(() => ({}));
  if (!result.ok) throw Error("stripe_api_error");
  return json;
}
async function checkAccount(env) {
  const account = await stripe(env, "/account");
  if (account.id !== env.STRIPE_EXPECTED_ACCOUNT_ID) throw Error("stripe_account_mismatch");
}
function correctSession(session, env) {
  return !!(SESSION_ID.test(session?.id || "") &&
    session.id.startsWith(env.PAYMENTS_MODE === "live" ? "cs_live_" : "cs_test_") &&
    session.livemode === (env.PAYMENTS_MODE === "live") &&
    session.mode === "payment" &&
    session.amount_total === PRICE_CENTS &&
    session.currency === "eur" &&
    session.metadata?.kind === PAID_KIND &&
    HASH.test(session.metadata?.fingerprint || ""));
}
function paid(session) {
  return session.status === "complete" && session.payment_status === "paid";
}
async function saveOrder(env, session, state) {
  const sql = [
    "INSERT INTO payment_orders",
    "(session_id, fingerprint, kind, amount_cents, currency, payment_status, payment_intent_id)",
    "VALUES (?, ?, ?, ?, ?, ?, ?)",
    "ON CONFLICT(session_id) DO UPDATE SET",
    "payment_status = CASE",
    "WHEN payment_orders.payment_status = 'revoked' THEN 'revoked'",
    "WHEN excluded.payment_status = 'paid' THEN 'paid'",
    "WHEN payment_orders.payment_status = 'paid' THEN 'paid'",
    "ELSE excluded.payment_status END,",
    "payment_intent_id = COALESCE(payment_orders.payment_intent_id, excluded.payment_intent_id),",
    "updated_at = CURRENT_TIMESTAMP"
  ].join(" ");
  await env.PAYMENTS_DB.prepare(sql).bind(
    session.id, session.metadata.fingerprint.toLowerCase(), PAID_KIND,
    PRICE_CENTS, "eur", state, session.payment_intent || null
  ).run();
}
async function currentState(env, id) {
  return env.PAYMENTS_DB.prepare(
    "SELECT payment_status FROM payment_orders WHERE session_id = ?"
  ).bind(id).first();
}
function randomLabel() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "justpdfit_web_" + [...bytes].map(x => String.fromCharCode(97 + x % 26)).join("");
}
async function checkout(env, body) {
  if (body.kind !== PAID_KIND) return { error: "Service payant non disponible.", status: 422 };
  await checkAccount(env);
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "eur");
  form.set("line_items[0][price_data][unit_amount]", String(PRICE_CENTS));
  form.set("line_items[0][price_data][product_data][name]", "JustPDFit - PDF signé sans filigrane");
  form.set("line_items[0][quantity]", "1");
  form.set("metadata[kind]", PAID_KIND);
  form.set("metadata[fingerprint]", body.fingerprint.toLowerCase());
  form.set("client_reference_id", crypto.randomUUID());
  form.set("integration_identifier", randomLabel());
  form.set("success_url", "https://justpdfit.com/sign/?payment=success&session_id={CHECKOUT_SESSION_ID}");
  form.set("cancel_url", "https://justpdfit.com/sign/?payment=cancelled");
  const s = await stripe(env, "/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });
  if (!SESSION_ID.test(s.id || "") ||
      !s.id.startsWith(env.PAYMENTS_MODE === "live" ? "cs_live_" : "cs_test_") ||
      !/^https:\/\/checkout\.stripe\.com\//.test(s.url || "")) {
    throw Error("stripe_checkout_response_invalid");
  }
  return { sessionId: s.id, checkoutUrl: s.url };
}
async function verify(env, body) {
  if (!SESSION_ID.test(body.sessionId || "") ||
      !body.sessionId.startsWith(env.PAYMENTS_MODE === "live" ? "cs_live_" : "cs_test_")) {
    return { error: "Identifiant de paiement invalide.", status: 400 };
  }
  await checkAccount(env);
  const existing = await currentState(env, body.sessionId);
  if (existing?.payment_status === "revoked") return { paid: false };
  const s = await stripe(env, "/checkout/sessions/" + encodeURIComponent(body.sessionId));
  if (!correctSession(s, env) || s.metadata.fingerprint.toLowerCase() !== body.fingerprint.toLowerCase()) {
    return { paid: false };
  }
  if (!paid(s)) return { paid: false };
  await saveOrder(env, s, "paid"); // Server-verified fallback; webhook also fulfills independently.
  return { paid: true };
}
function toBytes(hex) {
  if (!/^[a-f0-9]{64}$/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return out;
}
async function verifyWebhookSignature(raw, signature, secret, nowSeconds = Date.now() / 1000) {
  if (!signature || !secret || !secret.startsWith("whsec_")) return false;
  const entries = signature.split(",").map(part => part.trim().split("="));
  const timestamp = entries.find(([k]) => k === "t")?.[1];
  const candidates = entries.filter(([k]) => k === "v1").map(([,v]) => v);
  if (!/^\d+$/.test(timestamp || "") || Math.abs(nowSeconds - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey(
    "raw", ENCODER.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const data = ENCODER.encode(timestamp + "." + raw);
  for (const hex of candidates) {
    const sig = toBytes(hex);
    if (sig && await crypto.subtle.verify("HMAC", key, sig, data)) return true;
  }
  return false;
}
async function recordEvent(env, event) {
  const type = event.type;
  const s = event.data?.object;
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed"].includes(type) &&
    correctSession(s, env)) {
    const state = type === "checkout.session.async_payment_failed" ? "failed" :
      paid(s) ? "paid" : "pending";
    await saveOrder(env, s, state);
  }
  if (["charge.refunded", "charge.dispute.created"].includes(type)) {
    const intent = s?.payment_intent;
    if (typeof intent === "string" && intent.startsWith("pi_")) {
      await env.PAYMENTS_DB.prepare(
        "UPDATE payment_orders SET payment_status = 'revoked', updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?"
      ).bind(intent).run();
    }
  }
  await env.PAYMENTS_DB.prepare(
    "INSERT OR IGNORE INTO stripe_events (event_id, event_type) VALUES (?, ?)"
  ).bind(event.id, type).run();
}
async function webhook(request, env) {
  if (!ready(env)) return respond("", { error: "Webhook non configuré." }, 503);
  const raw = await request.text();
  if (raw.length > 200000) return respond("", { error: "Payload trop volumineux." }, 413);
  const verified = await verifyWebhookSignature(
    raw, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET
  );
  if (!verified) return respond("", { error: "Signature Stripe invalide." }, 400);
  let event;
  try { event = JSON.parse(raw); } catch { return respond("", { error: "JSON invalide." }, 400); }
  if (!/^evt_[A-Za-z0-9]+$/.test(event?.id || "") || typeof event.type !== "string" ||
      event.livemode !== (env.PAYMENTS_MODE === "live") ||
      (event.account && event.account !== env.STRIPE_EXPECTED_ACCOUNT_ID)) {
    return respond("", { error: "Événement Stripe inattendu." }, 400);
  }
  try {
    await recordEvent(env, event);
    return respond("", { received: true });
  } catch {
    // Non-2xx => Stripe retries webhook delivery.
    return respond("", { error: "Webhook non enregistré." }, 503);
  }
}
export { verifyWebhookSignature };
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Stripe webhooks never provide a browser Origin header.
    if (request.method === "POST" && url.pathname === "/webhook") {
      return webhook(request, env);
    }
    const origin = request.headers.get("Origin") || "";
    if (!ORIGINS.has(origin)) return respond(origin, { error: "Origine non autorisée." }, 403);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        ...cors(origin), "Access-Control-Max-Age": "7200"
      } });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return respond(origin, { service: "justpdfit-payments", status: ready(env) ? "configured" : "disabled",
        mode: ["test","live"].includes(env?.PAYMENTS_MODE) ? env.PAYMENTS_MODE : null });
    }
    if (request.method !== "POST" || !["/checkout", "/verify"].includes(url.pathname)) {
      return respond(origin, { error: "Route inconnue." }, 404);
    }
    if (!ready(env)) return respond(origin, { error: "Paiement non activé." }, 503);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") || "")) {
      return respond(origin, { error: "JSON requis." }, 415);
    }
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 2048) return respond(origin, { error: "Requête trop volumineuse." }, 413);
    let body;
    try {
      const raw = await request.text();
      if (raw.length > 2048) return respond(origin, { error: "Requête trop volumineuse." }, 413);
      body = JSON.parse(raw);
    } catch { return respond(origin, { error: "JSON invalide." }, 400); }
    if (!body || typeof body !== "object" || !HASH.test(body.fingerprint || "")) {
      return respond(origin, { error: "Empreinte de document invalide." }, 400);
    }
    try {
      const result = url.pathname === "/checkout" ? await checkout(env, body) : await verify(env, body);
      return "error" in result ? respond(origin, { error: result.error }, result.status) : respond(origin, result);
    } catch {
      return respond(origin, { error: "Service de paiement temporairement indisponible." }, 502);
    }
  }
};