-- Dedicated JustPDFit D1 database. Apply to sandbox first, then production.
-- This database contains payment references and original-document SHA-256
-- fingerprints, but never PDF bytes, signer names or signature images.

CREATE TABLE IF NOT EXISTS payment_orders (
  session_id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL CHECK(length(fingerprint) = 64),
  kind TEXT NOT NULL CHECK(kind IN ('solo-clean')),
  amount_cents INTEGER NOT NULL CHECK(amount_cents = 199),
  currency TEXT NOT NULL CHECK(currency = 'eur'),
  payment_status TEXT NOT NULL CHECK(payment_status IN ('pending', 'failed', 'paid', 'revoked')),
  payment_intent_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS payment_orders_intent
  ON payment_orders(payment_intent_id);

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
