-- kwiKBio M-AUTH — accounts, sessions, entitlement tiers, consent of record
-- Run: psql $DATABASE_URL < db/auth.sql
--
-- Two deliberately SEPARATE axes live on users:
--   role — staff/internal RBAC (mirrors hydrojoule: SUBSCRIBER/RESEARCHER/ADMIN)
--   tier — the CONSUMER entitlement that governs Level depth (anon/freemium/
--          subscriber/enterprise). An ADMIN is not automatically entitled to
--          Pro as a product matter, and a paying Pro subscriber is not staff.
-- Conflating them is how paywalls leak, so they are kept apart.

-- ============================================================
-- 1. Auth.js (NextAuth v5) core tables — @auth/pg-adapter contract
--    Column names are fixed by the adapter; do not rename.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(255),
  email          VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image          TEXT,

  -- ── kwiKBio extensions (safe to add; adapter ignores unknown columns) ──
  role           TEXT NOT NULL DEFAULT 'SUBSCRIBER'
                 CHECK (role IN ('SUBSCRIBER','RESEARCHER','ADMIN')),
  tier           TEXT NOT NULL DEFAULT 'freemium'
                 CHECK (tier IN ('freemium','subscriber','enterprise')),

  -- Consent of record (R2). Authoritative once an account exists; the
  -- localStorage values are only a pre-account affordance.
  age_band       TEXT CHECK (age_band IN ('adult','minor')),
  age_confirmed_at TIMESTAMPTZ,
  tou_version    TEXT,
  tou_accepted_at TIMESTAMPTZ,

  -- Minors cannot contract (Terms §2). A minor seat is payable only by the
  -- guardian or institution recorded here; NULL means no seat may be sold.
  guardian_email VARCHAR(255),
  guardian_kind  TEXT CHECK (guardian_kind IN ('parent','institution')),
  guardian_confirmed_at TIMESTAMPTZ,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                VARCHAR(255) NOT NULL,
  provider            VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          BIGINT,
  id_token            TEXT,
  scope               TEXT,
  session_state       TEXT,
  token_type          TEXT,
  UNIQUE (provider, "providerAccountId")
);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId");

CREATE TABLE IF NOT EXISTS sessions (
  id             SERIAL PRIMARY KEY,
  "userId"       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId");

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================
-- 2. Consent audit log — append-only.
--    Terms §16 needs a record of WHO accepted WHICH version WHEN,
--    not just the current state, so re-acceptance history survives.
-- ============================================================
CREATE TABLE IF NOT EXISTS consent_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('tou','age','guardian')),
  value       TEXT NOT NULL,       -- tou version, age band, or guardian kind
  source      TEXT NOT NULL DEFAULT 'web'
              CHECK (source IN ('web','migrated-local','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_events(user_id, kind, created_at DESC);
