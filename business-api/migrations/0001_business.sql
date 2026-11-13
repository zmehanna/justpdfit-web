-- JustPDFit Business: isolated organizations and subscription entitlements.
CREATE TABLE IF NOT EXISTS organizations(
  id TEXT PRIMARY KEY, name TEXT NOT NULL,
  owner_id TEXT NOT NULL, stripe_customer_id TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS business_users(
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS email_logins(
  token_hash TEXT PRIMARY KEY, email TEXT NOT NULL,
  expires_at INTEGER NOT NULL, consumed_at INTEGER
);
CREATE TABLE IF NOT EXISTS business_sessions(
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES business_users(id),
  expires_at INTEGER NOT NULL, revoked_at INTEGER
);
CREATE TABLE IF NOT EXISTS memberships(
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id TEXT NOT NULL REFERENCES business_users(id),
  role TEXT NOT NULL CHECK(role IN ('owner','admin','member')),
  active INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY(organization_id,user_id)
);
CREATE TABLE IF NOT EXISTS invitations(
  token_hash TEXT PRIMARY KEY, organization_id TEXT NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','member')),
  expires_at INTEGER NOT NULL, accepted_at INTEGER, invited_by TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_subscriptions(
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id),
  stripe_subscription_id TEXT UNIQUE, plan TEXT NOT NULL CHECK(plan IN ('starter','team','pro','enterprise')),
  state TEXT NOT NULL DEFAULT 'incomplete',
  included_seats INTEGER NOT NULL DEFAULT 0,
  extra_seats INTEGER NOT NULL DEFAULT 0,
  current_period_end INTEGER,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stripe_events(
  event_id TEXT PRIMARY KEY, received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rate_limits(
  token TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS business_audit(
  id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, actor_id TEXT,
  action TEXT NOT NULL, detail TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS membership_user_idx ON memberships(user_id,active);
CREATE INDEX IF NOT EXISTS invitations_org_idx ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS business_audit_org_idx ON business_audit(organization_id,created_at);
