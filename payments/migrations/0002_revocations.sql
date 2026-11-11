-- Stripe may deliver refund/dispute webhooks before the checkout completion event.
-- A durable denylist prevents late "paid" events from restoring entitlement.
-- One row per PaymentIntent. Keep independent of payment_orders lifecycle.
CREATE TABLE IF NOT EXISTS revoked_payment_intents (
  payment_intent_id TEXT PRIMARY KEY,
  stripe_event_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
