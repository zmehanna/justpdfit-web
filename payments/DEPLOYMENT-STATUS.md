# JustPDFit Stripe deployment — 2026-11-11

## Infrastructure created and verified

Cloudflare account: `Zmehanna@gmail.com's Account` (authenticated through the authorized Windows VPS).

| Environment | Worker | D1 database | Payments |
| --- | --- | --- | --- |
| Test | https://justpdfit-payments-sandbox.zmehanna.workers.dev | `justpdfit-payments-sandbox` | Disabled (Stripe credentials not configured) |
| Live | https://justpdfit-payments-live.zmehanna.workers.dev | `justpdfit-payments-live` | Disabled (Stripe credentials not configured) |

**Live Stripe account allowlist: `acct_1UaLHoEQp3CN3XtA` — JustPDFit.com ONLY.**

FairTaxy (`acct_1UWgA3L7h2qjW2we`) is refused in Live mode. No FairTaxy Cloudflare service, D1 database or Stripe account was modified.

Both remote D1 databases have the `0001_orders.sql` and `0002_revocations.sql` migrations applied, and the tables `payment_orders`, `stripe_events`, `revoked_payment_intents` were verified via remote D1 SQL. Both Workers are deployed under isolated workers.dev hostnames, without changing DNS, GitHub Pages, or iOS deployment.

External smoke tests with `Origin: https://justpdfit.com`:
- `GET /health` -> HTTP 200, `status: disabled` (expected until secrets are configured).
- `POST /checkout` -> HTTP 503 (fail closed, no payment is created).
- `POST /webhook` without signature -> HTTP 503 (cannot fulfill without webhook secret).

Local Node mocked tests: **18/18 pass**. Local Wrangler D1 migrations and runtime smoke tests passed. GitHub Actions has succeeded on this branch. **No real Stripe Checkout/paid transaction has yet been validated.**

## Remaining secure setup (do not put keys in GitHub or chat)

### 1. Stripe JustPDFit test sandbox

In Stripe Dashboard, switch to **JustPDFit.com**, not FairTaxy. Create/use a separate Stripe sandbox, and create a restricted sandbox API key that allows reading account details and reading/creating Checkout Sessions (plus any additional necessary product/price permissions when using inline `price_data`). Record the sandbox account ID `acct_...`.

In Cloudflare -> Workers & Pages -> `justpdfit-payments-sandbox` -> Settings -> Variables and Secrets:
- Set `STRIPE_EXPECTED_ACCOUNT_ID` to the sandbox account ID, as a non-secret variable or secret (the sandbox Wrangler config deliberately does not include it).
- Set `STRIPE_RESTRICTED_KEY` as an encrypted **Secret** (prefix `rk_test_`, never commit it).
- Create a Stripe webhook destination for `https://justpdfit-payments-sandbox.zmehanna.workers.dev/webhook`; set its supplied `whsec_...` as the Worker **Secret** `STRIPE_WEBHOOK_SECRET`.

Subscribe the webhook destination to:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`
- `charge.dispute.created`

Test all paths with Stripe's sandbox Checkout, including a successful 1.99 EUR purchase, a cancelled Checkout, a wrong-fingerprint verification, webhook delivery and refund. Confirm both the signed webhook and the D1 order status. Never use FairTaxy test credentials.

### 2. JustPDFit Live Stripe account

In Stripe Dashboard, switch to JustPDFit.com (`acct_1UaLHoEQp3CN3XtA`). Create a dedicated restricted LIVE API key for Checkout, with account-read and required Checkout read/write permissions. Store it ONLY in the `justpdfit-payments-live` Worker's encrypted Secret `STRIPE_RESTRICTED_KEY`.

Create a **Live** Stripe webhook destination for:
`https://justpdfit-payments-live.zmehanna.workers.dev/webhook`
Subscribe to the same 5 events listed above and save the Stripe-provided `whsec_...` as the **encrypted** Secret `STRIPE_WEBHOOK_SECRET` on the **Live** Worker.

The publicly known `STRIPE_EXPECTED_ACCOUNT_ID = acct_1UaLHoEQp3CN3XtA` is already present in the Live Worker configuration and hard-pinned in the Worker source. The Worker fails closed if `GET /v1/account` reports another account, even if a Live key exists.

Review tax settings/registrations, the legal merchant's details, refund rights, receipts and consumer disclosures before the first Live charge.

### 3. Verify, then activate the website

After secrets have been configured, request `GET /health` with `Origin: https://justpdfit.com`:
```json
{"service":"justpdfit-payments","status":"configured","mode":"live"}
```
Then verify a real test/Live Checkout session can be created with the correct merchant and amount, receipt and signed webhook are delivered, and the matching original PDF can be downloaded without a watermark.

Only after that, edit **the public root** `payment-config.js` to:
```js
window.JustPDFitPaymentConfig = {
  endpoint: "https://justpdfit-payments-live.zmehanna.workers.dev"
};
```
The current public `payment-config.js` has `endpoint: null` and therefore checkout remains disabled. The free PDF service remains fully available.

Production Web checkout is **not** Apple iOS in-app purchase compliance. Do not enable the paid native app path without reviewing Apple requirements.

## Maintenance

Production configuration: `payments/wrangler.live.toml` (non-secret account and D1 IDs).
Sandbox configuration: `payments/wrangler.sandbox.toml`.
Worker source: `payments/worker.js`.
DB migrations: `payments/migrations/`.
Local/CI tests: `npm test --prefix payments`.

The code repository is `zmehanna/justpdfit-web`, deployed on GitHub Pages; the payment Workers are separate Cloudflare projects. Never replace the GitHub Pages domain's IONOS DNS records to deploy the payment Worker.
