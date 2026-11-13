-- JustPDFit Business usage analytics: metadata only, never PDF content.
CREATE TABLE IF NOT EXISTS business_usage_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id TEXT NOT NULL REFERENCES business_users(id),
  kind TEXT NOT NULL CHECK(kind IN ('pdf_export','ai_request','remote_signature','id_verification')),
  quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10000),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS business_usage_org_kind_idx
ON business_usage_events(organization_id,kind,created_at);

CREATE TABLE IF NOT EXISTS business_credit_pools (
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  kind TEXT NOT NULL CHECK(kind IN ('ai_request','remote_signature','id_verification')),
  allowance INTEGER NOT NULL DEFAULT 0 CHECK(allowance>=0),
  used INTEGER NOT NULL DEFAULT 0 CHECK(used>=0),
  reset_at INTEGER,
  PRIMARY KEY(organization_id,kind)
);
