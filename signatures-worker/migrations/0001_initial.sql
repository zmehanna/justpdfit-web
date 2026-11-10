CREATE TABLE IF NOT EXISTS documents (
 id TEXT PRIMARY KEY, plan TEXT NOT NULL CHECK(plan IN ('standard','enhanced')),
 status TEXT NOT NULL CHECK(status IN ('awaiting_payment','invited','completed','cancelled')),
 payer_email TEXT NOT NULL, original_sha TEXT NOT NULL,
 checkout_id TEXT UNIQUE, created_at INTEGER NOT NULL, paid_at INTEGER,
 completed_at INTEGER, final_sha TEXT, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS signers (
 id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id),
 email TEXT NOT NULL, slot INTEGER NOT NULL CHECK(slot IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','signed')),
 invite_hash TEXT UNIQUE, otp_hash TEXT, otp_exp INTEGER, otp_attempts INTEGER NOT NULL DEFAULT 0,
 otp_sent_at INTEGER, otp_sends INTEGER NOT NULL DEFAULT 0,
 session_hash TEXT, session_exp INTEGER, verified_at INTEGER,
 kyc_id TEXT UNIQUE, kyc_status TEXT, signed_at INTEGER,
 page_index INTEGER, sig_x REAL, sig_y REAL, sig_w REAL, sig_h REAL,
 UNIQUE(document_id,slot)
);
CREATE INDEX IF NOT EXISTS idx_signer_doc ON signers(document_id);
CREATE INDEX IF NOT EXISTS idx_expiry ON documents(expires_at);
