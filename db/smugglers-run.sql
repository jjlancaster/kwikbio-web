-- Smuggler's Run — ephemeral match records keyed to challenge token.
-- Run once on Jewel's Supabase/Postgres alongside db/schema.sql.
-- Score writes go to the existing gs_nodes / gs_edges provenance graph.

CREATE TABLE IF NOT EXISTS sr_matches (
  token       TEXT PRIMARY KEY,
  status      TEXT NOT NULL DEFAULT 'open',   -- open | lobby | racing | finished | expired
  data        JSONB NOT NULL,                 -- full MatchRecord (lib/smugglers-run/types.ts)
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sr_matches_status  ON sr_matches(status);
CREATE INDEX IF NOT EXISTS idx_sr_matches_created ON sr_matches(created_at);
