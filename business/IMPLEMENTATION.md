# JustPDFit Business — backend implementation contract

Status: pricing page deployed; entitlement backend NOT enabled yet. Do not sell subscriptions until all acceptance tests below pass.

## Commercial catalog (EUR, tax exclusive)
- Starter: 3 seats, 9.90 EUR/month or 99 EUR/year; extra seat 3.90 EUR/month.
- Team: 10 seats, 29.90 EUR/month or 299 EUR/year; extra seat 2.90 EUR/month.
- Pro: 30 seats, 79.90 EUR/month or 799 EUR/year; extra seat 2.50 EUR/month.
- Annual subscriptions: additional seats receive 15% discount.
- Enterprise: negotiated.
- Solo signing included; remote signing, ID verification and metered AI must use separately tracked credits.

## Server and permissions
Use Cloudflare Worker + durable database (D1 or an existing application database) for organizations, seats, invitations, memberships and subscription snapshots. Stripe Live account is JustPDFit only, not FairTaxy.

Tables:
organizations(id, name, owner_user_id, created_at)
memberships(id, organization_id, user_id, role, status, created_at)
invitations(id, organization_id, email_hash, role, token_hash, expires_at, accepted_at)
subscriptions(id, organization_id, stripe_customer_id, stripe_subscription_id, plan, status, included_seats, purchased_seats, current_period_end)
usage(id, organization_id, actor_user_id, kind, units, created_at)
audit_events(id, organization_id, actor_user_id, action, subject_id, occurred_at)

Never trust a client-supplied plan, paid status, seat count or Stripe subscription ID. Verify identity, access and entitlements on the Worker for each premium export or AI call. Reject oversubscription and race conditions transactionally. Membership access must be scoped to organization; only admins may invite/upgrade; prevent cross-tenant leakage. Tokens expire, are single-use, and must be stored hashed.

## Billing
Stripe Checkout subscription mode with separate recurring price objects. Annual seats need correct price intervals and proration policy. Store products/prices as server-side config; never use live secret keys in GitHub Pages. Verify webhook signatures and dedupe event IDs; process subscription.created/updated/deleted and invoice payment lifecycle. Entitlement is active only after verified billing status. Use Stripe Customer Portal for changes and cancellation. Handle grace periods, failed invoices, retries and idempotency.

## i18n
Business page selects from the site's language catalog. EN, FR, AR, ES, DE, IT and PT have dedicated copy. Other language selections currently fall back to English and REQUIRE translations before full multilingual launch. RTL: AR, UR, FA. All visible error messages, emails, invitations, payment success/cancel screens, legal copy and structured SEO metadata must be localized. No automatic hreflang claims until separate localized pages exist.

## Acceptance criteria before charging
1. Create organization / sign in / invite / accept / deactivate / reassign seat.
2. Checkout monthly + annual with Stripe test mode end-to-end.
3. Upgrade/downgrade, seat overage, proration, cancellations, failed payments, refunds.
4. Validate entitlement server-side during no-watermark export and AI usage.
5. Confirm one organization cannot see another's people, documents or usage.
6. iPhone/iPad login and entitlements share the same authorized account.
7. RTL responsive QA and full translation coverage.
8. Production switch explicitly approved after full QA.
