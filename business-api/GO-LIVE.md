# JustPDFit Business — Go-live readiness (2026-11-13)

## Delivered and verified
- Business pricing live at https://justpdfit.com/business/ (Starter / Team / Pro / Enterprise).
- Shared JustPDFit navigation and footer, with pricing page translated in 27 languages.
- Business dashboard at https://justpdfit.com/business/dashboard/ with 27-language copy and RTL support for AR/FA/UR.
- Company membership, email magic links, organization invitations, paid-seat limit checking, role-based access and account logout implemented in staged Worker.
- Cloudflare Worker staging deployed: justpdfit-business-staging.zmehanna.workers.dev
- Separate Cloudflare D1 database `justpdfit-business-staging` with migrations 0001 and 0002 applied.
- Proposed Stripe Checkout subscriptions, plan & seat changes, invoice retrieval, customer portal, idempotent signed webhook implementation staged; all billing actions disabled.
- PDF signing engine checks a Business entitlement via Worker on each clean export *only if* Business API is explicitly enabled; currently the public config endpoint is null.
- Resend sender domain justpdfit.com verified, 27-language login/invite templates staged.
- 19 automated tests passed on VPS including origin checks, no-auth checks, billing disabled, and locale-key completeness.

## Remaining critical launch blockers
1. **Stripe tax:** Stripe Tax settings status active; no tax registrations have been recorded. The owner must confirm where KL-MEHANNA LLC is legally registered for VAT/GST/sales tax and whether prices are tax-exclusive. Do not fabricate registrations or tax obligations.
2. **Live products and prices:** Stripe account JustPDFit (acct_1UaLHoEQp3CN3XtA) has not had the new Business recurring prices created. `stripe-catalog.staged.json` specifies 12 prices in EUR cents. Confirm tax, create them only in the JustPDFit account and populate PRICE_* Worker secrets/config.
3. **Email credentials:** Resend domain-restricted sending key was created but could not safely be installed automatically; it must be stored using Cloudflare Secrets `RESEND_API_KEY`. Never put it in GitHub or plaintext logs. MAIL_FROM is JustPDFit <no-reply@justpdfit.com>.
4. **Stripe secrets:** Populate dedicated restricted JustPDFit Stripe API key and matching webhook signing secret in Cloudflare, configure webhook subscriptions and Stripe Customer Portal.
5. **End-to-end security QA:** Magic link redemption, token storage and revocation, concurrent seat acceptance, role escalation checks, tenant isolation, invalid/duplicate Stripe events, failed billing, paid-to-unpaid transitions. A passing unit test suite alone is not certification.
6. **PDF entitlement enforcement:** Current local-browser checks request signed-in subscription status server-side, but browser-only PDF processing can be modified by end users. For tamper-resistant enforcement, choose either secure server-side export with consent and privacy tradeoff, or accept client-side licensing as a commercial access control (not DRM).
7. **Usage metering:** Tables and views are staged; actual PDF and AI events must be wired to trusted execution paths. Do not show placeholder counts as factual metrics.
8. **iOS/iPadOS:** Native subscription entitlement sync and App Store purchase rules require separate implementation and review.
9. **Email and dashboard localization QA:** 27 languages added; conduct native-speaker review and RTL mobile screenshots for production.
10. **Activation:** After all checks, set Business API endpoint in `business/business-api-config.js` to the *tested* HTTPS Worker URL, and set BUSINESS_BILLING_ENABLED=true only after Stripe Live is verified. No accidental activation.

## Deployment safety
- Avoid modifying the existing `justpdfit-payments-live` Worker used for individual PDF purchases.
- Do not reuse FairTaxy credentials, database or customer objects.
- Leave the current solo free-with-watermark and €1.99 clean export behavior unchanged until Business subscriptions have verified entitlements.
- Keep preview-stage Worker billing disabled even while continuing API tests.
