/**
 * JustPDFit.com - Stripe Checkout backend for the solo watermark-free upgrade.
 *
 * Cloudflare Worker secrets:
 *  STRIPE_SECRET_KEY          sk_test_... or sk_live_... (NEVER client-side)
 *  STRIPE_EXPECTED_ACCOUNT_ID acct_... (MUST belong to JustPDFit, not FairTaxy)
 * Cloudflare Worker variable:
 *  PAYMENTS_MODE              test or live, matching the key
 *
 * Other services (remote signature, OTP, Didit) deliberately cannot charge
 * until their document/order fulfillment systems are operational.
 *
 * The PDF and signature stay in the browser. Only a SHA-256 document
 * fingerprint is sent to the payment backend and Stripe metadata.
 */
const STRIPE_API = "https://api.stripe.com/v1";
const ORIGINS = new Set(["https://justpdfit.com", "https://www.justpdfit.com"]);
const DOCUMENT_HASH = /^[0-9a-f]{64}$/i;
const SESSION_ID = /^cs_(?:test_|live_)[a-zA-Z0-9]+$/;
const SOLO_AMOUNT_CENTS = 199;

function headers(origin) {
  const h = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
  if (ORIGINS.has(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return h;
}
function reply(origin, payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: headers(origin) });
}

function isConfigured(env) {
  if (!env || !["test", "live"].includes(env.PAYMENTS_MODE)) return false;
  const key = env.STRIPE_SECRET_KEY || "";
  const expectedPrefix = env.PAYMENTS_MODE === "live" ? "sk_live_" : "sk_test_";
  return key.startsWith(expectedPrefix) &&
    /^acct_[A-Za-z0-9]+$/.test(env.STRIPE_EXPECTED_ACCOUNT_ID || "");
}

async function stripe(env, path, options = {}) {
  const response = await fetch(STRIPE_API + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("stripe_request_failed");
  return data;
}

/** Stop immediately if credentials point to an unexpected Stripe account. */
async function ensureJustPDFitAccount(env) {
  const account = await stripe(env, "/account");
  if (account.id !== env.STRIPE_EXPECTED_ACCOUNT_ID) {
    throw new Error("stripe_account_mismatch");
  }
}

async function checkout(env, body) {
  if (body.kind !== "solo-clean") {
    return { error: "Ce service payant n'est pas encore disponible.", status: 422 };
  }
  await ensureJustPDFitAccount(env);
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "eur");
  form.set("line_items[0][price_data][unit_amount]", String(SOLO_AMOUNT_CENTS));
  form.set("line_items[0][price_data][product_data][name]", "JustPDFit - PDF signé sans filigrane");
  form.set("line_items[0][quantity]", "1");
  form.set("metadata[kind]", "solo-clean");
  form.set("metadata[fingerprint]", body.fingerprint.toLowerCase());
  form.set("client_reference_id", crypto.randomUUID());
  form.set("success_url", "https://justpdfit.com/sign/?payment=success&session_id={CHECKOUT_SESSION_ID}");
  form.set("cancel_url", "https://justpdfit.com/sign/?payment=cancelled");
  const session = await stripe(env, "/checkout/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!SESSION_ID.test(session.id || "") || !/^https:\/\/checkout\.stripe\.com\//.test(session.url || "")) {
    throw new Error("stripe_checkout_invalid");
  }
  return { sessionId: session.id, checkoutUrl: session.url };
}

async function verify(env, body) {
  if (!SESSION_ID.test(body.sessionId || "")) {
    return { error: "Identifiant de paiement invalide.", status: 400 };
  }
  // A test key must never verify a live checkout (and vice versa).
  const sessionMode = body.sessionId.startsWith("cs_live_") ? "live" : "test";
  if (sessionMode !== env.PAYMENTS_MODE) {
    return { error: "Paiement issu d'un autre environnement.", status: 400 };
  }
  await ensureJustPDFitAccount(env);
  const session = await stripe(env, "/checkout/sessions/" + encodeURIComponent(body.sessionId));
  const paid =
    session.id === body.sessionId &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    session.currency === "eur" &&
    session.amount_total === SOLO_AMOUNT_CENTS &&
    session.metadata?.kind === "solo-clean" &&
    session.metadata?.fingerprint === body.fingerprint.toLowerCase();
  return { paid: !!paid };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (!ORIGINS.has(origin)) return reply(origin, { error: "Origine non autorisée." }, 403);
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        ...headers(origin), "Access-Control-Max-Age": "7200",
      } });
    }
    if (request.method === "GET" && url.pathname === "/health") {
      return reply(origin, {
        service: "justpdfit-payments",
        status: isConfigured(env) ? "configured" : "disabled",
        mode: ["test", "live"].includes(env?.PAYMENTS_MODE) ? env.PAYMENTS_MODE : null,
      });
    }
    if (request.method !== "POST" || !["/checkout", "/verify"].includes(url.pathname)) {
      return reply(origin, { error: "Route inconnue." }, 404);
    }
    if (!isConfigured(env)) return reply(origin, { error: "Paiement non activé." }, 503);
    if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") || "")) {
      return reply(origin, { error: "Contenu JSON requis." }, 415);
    }
    if (Number(request.headers.get("Content-Length") || 0) > 2048) {
      return reply(origin, { error: "Requête trop volumineuse." }, 413);
    }
    let body;
    try {
      const raw = await request.text();
      if (raw.length > 2048) return reply(origin, { error: "Requête trop volumineuse." }, 413);
      body = JSON.parse(raw);
    } catch {
      return reply(origin, { error: "Requête JSON invalide." }, 400);
    }
    if (!body || typeof body !== "object" || !DOCUMENT_HASH.test(body.fingerprint || "")) {
      return reply(origin, { error: "Empreinte de document invalide." }, 400);
    }
    try {
      const result = url.pathname === "/checkout"
        ? await checkout(env, body)
        : await verify(env, body);
      if ("error" in result) return reply(origin, { error: result.error }, result.status);
      return reply(origin, result);
    } catch {
      // Do not expose Stripe credentials, account IDs, or Stripe's raw API errors.
      return reply(origin, { error: "Service de paiement temporairement indisponible." }, 502);
    }
  }
};