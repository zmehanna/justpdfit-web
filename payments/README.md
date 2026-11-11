# JustPDFit — Stripe Checkout backend (staged)

## Status

The site [justpdfit.com](https://justpdfit.com) is hosted on **GitHub Pages**, separate from the payment backend. The default `payment-config.js` has `endpoint: null`, so **no payment can currently be started**.

This backend supports **only** a **one-time €1.99 purchase per original document** to remove the clickable JustPDFit watermark from a solo-signed PDF. The PDF and signature stay in the browser. The backend receives a SHA-256 document fingerprint; Stripe session metadata includes that fingerprint.

All paid duo-signature options (email OTP, Didit, optional watermark removal) remain disabled until remote signing, consent capture, evidence retention and fulfillment are complete. Do **not** create Stripe Checkout links for unfinished features.

**Never use FairTaxy credentials, account IDs, products, webhooks, databases or Cloudflare services for JustPDFit.**

## Account verification required before activation

The official JustPDFit Live account ID (`acct_...`) has **not** been independently confirmed in this implementation. Obtain it from the JustPDFit Stripe Dashboard or authenticated Stripe connector in a session that can actually access it.

Set `STRIPE_EXPECTED_ACCOUNT_ID` only after matching the ID to the **JustPDFit** business identity. The Worker requests `GET /v1/account` with the configured API key and refuses checkout/verification if the returned ID does not match. It does not infer the account from the presence of any other Stripe account. Never guess the account ID.

Prefer a **restricted Stripe API key** (`STRIPE_RESTRICTED_KEY`) scoped to Checkout Sessions read/write and Account read, with permissions verified by sandbox testing. `STRIPE_SECRET_KEY` is supported as a backward-compatible fallback. Keys and webhook secrets belong only in **Cloudflare Worker Secrets**, never GitHub Pages, source files, build logs, or browser JavaScript.

## Dedicated backend and database

Create separate Cloudflare Worker and **D1** database resources in sandbox and production. `payments/wrangler.toml.example` is a **sandbox-only example**; copy to a private working `payments/wrangler.toml`, fill the new sandbox D1 database ID and run:

```bash
npx wrangler d1 migrations apply justpdfit-payments-sandbox --remote --config payments/wrangler.toml
npx wrangler secret put STRIPE_RESTRICTED_KEY --config payments/wrangler.toml
npx wrangler secret put STRIPE_WEBHOOK_SECRET --config payments/wrangler.toml
npx wrangler secret put STRIPE_EXPECTED_ACCOUNT_ID --config payments/wrangler.toml
npx wrangler deploy --config payments/wrangler.toml
```

Use the secure input prompts for secret values, not shell arguments or pasted commands. Create the database first with Wrangler/Cloudflare Dashboard and keep its real ID out of the example. Create a **distinct production Worker, production D1 database, webhook destination and production restricted key** before switching `PAYMENTS_MODE = "live"`. Use explicit separate Worker configuration files; never promote test credentials to production.

The Worker refuses to create any Checkout Session if a required secret, webhook signing secret, account ID, mode or D1 binding is missing.

### Stripe webhooks (required)

Add the dedicated JustPDFit webhook endpoint `https://<your-worker-domain>/webhook` in the **same Stripe account and environment**. Subscribe at minimum to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`
- `charge.dispute.created`

The handler verifies the raw-body `Stripe-Signature` HMAC-SHA256 with a timestamp tolerance, checks `livemode` and any account reference, and persists transaction outcomes in D1. D1 stores session IDs, payment intent IDs, document SHA-256 fingerprints, status and Stripe event IDs. It does not receive PDF files. Repeated signed events are idempotent.

The `/verify` endpoint also independently requests the Checkout Session server-side (it does not trust the success URL), requires the correct paid amount / currency / kind / document fingerprint, writes the confirmed paid status and refuses orders already revoked in D1. Payment amounts come only from the server.

For the public site, after successful sandbox and real JustPDFit production tests, set in `payment-config.js`:
```js
window.JustPDFitPaymentConfig = { endpoint: "https://<your-verified-worker-domain>" };
```

Keep `endpoint:null` until **all** prerequisites pass.

### Operational hardening checklist

1. Configure Cloudflare rate limiting / bot protection on `POST /checkout` (CORS is not rate limiting or authentication).
2. Verify sandbox transactions: successful checkout, cancel, repeated requests, delayed payment success, failed payment, refund, wrong account ID, altered PDF fingerprint and failed webhook signature.
3. Verify the Live Stripe account identity, applicable tax treatment, business and consumer refund policies, receipt and support details before the first live charge. Do not assume Stripe Tax collects VAT without appropriate tax registration.
4. Review retention and GDPR disclosures for payment metadata, SHA-256 fingerprints, D1 events and Stripe records. Define retention/deletion procedures.
5. Ensure the signing page preserves its original browser tab while Checkout opens in another tab, then test payment verification and watermark-free export on desktop/mobile.
6. The public iPhone/iPad apps require their **own App Store compliance assessment** before adding digital purchases to those apps. This backend is for the **website only**.

### Tests

Run `cd payments && npm test` (Node.js with built-in test runner). These are **mock Stripe tests**, not live Stripe confirmations. Real sandbox payment and webhook deliveries must be verified separately.

The free solo-signing flow and JustPDFit watermark remain available when the backend is disabled.