# JustPDFit Business staging backend
The public pricing page is live; this backend is a **staged implementation**, not a production subscription system.

Components:
- `business/index.html`: pricing, seat calculator, language picker.
- `business/dashboard/index.html`: administrator UI. Requires configured API.
- `business/business-api-config.js`: disabled endpoint by default.
- `business-api/worker.js`: Cloudflare Worker API skeleton.
- `business-api/migrations/0001_business.sql`: dedicated D1 organization and entitlement tables.

**Do not activate payments yet.** Required:
1. Review security (session cookies across workers.dev origin, CSRF and invitation acceptance, race-safe licence limits, webhook event ordering and subscription price validation).
2. Configure separate production custom domain or approved auth transport, rate limiting, Resend sender authentication, D1 and secrets.
3. Confirm sales-tax/VAT/GST treatment and legal terms before creating Stripe Live products.
4. Configure real recurring Stripe price IDs in secrets, verify JustPDFit account ID, Stripe webhook signature and subscription lifecycle.
5. Run login/invitation/billing/seat/tenant isolation test suite and mobile RTL browser QA.
6. Translate all languages; current dashboard is fully localized in EN/FR/AR and falls back to English for other languages.
7. Confirm no-watermark export entitlement by server verification before allowing any premium download.

Never use FairTaxy credentials or create paid subscriptions until the entire entitlement workflow is validated.
