-- kwiKBio v4 Database Schema
-- Deploy against Supabase (PostgreSQL + RLS)
-- Run: psql $DATABASE_URL < db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 1. RDF Quad Store — public knowledge graph
-- Quads: (subject, predicate, object, graph_name) + metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS gs_quads (
  id          BIGSERIAL PRIMARY KEY,
  subject     TEXT NOT NULL,
  predicate   TEXT NOT NULL,
  object      TEXT NOT NULL,
  graph_name  TEXT NOT NULL DEFAULT 'public',
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gs_quads_s    ON gs_quads(subject);
CREATE INDEX IF NOT EXISTS idx_gs_quads_p    ON gs_quads(predicate);
CREATE INDEX IF NOT EXISTS idx_gs_quads_o    ON gs_quads(object);
CREATE INDEX IF NOT EXISTS idx_gs_quads_g    ON gs_quads(graph_name);
CREATE INDEX IF NOT EXISTS idx_gs_quads_sp   ON gs_quads(subject, predicate);
CREATE INDEX IF NOT EXISTS idx_gs_quads_po   ON gs_quads(predicate, object);
CREATE INDEX IF NOT EXISTS idx_gs_quads_spog ON gs_quads(subject, predicate, object, graph_name);
CREATE INDEX IF NOT EXISTS idx_gs_quads_meta ON gs_quads USING GIN(metadata);

-- ============================================================
-- 2. Provenance Graph (TRUE P0 from ARS-FS4 spec)
-- GRAPH_AVAILABLE = False until these tables exist
-- ============================================================
CREATE TABLE IF NOT EXISTS gs_nodes (
  id          SERIAL PRIMARY KEY,
  node_id     TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  node_type   TEXT,
  confidence  FLOAT DEFAULT 0.5,
  uncertainty FLOAT DEFAULT 0.5,
  source_type TEXT,
  source_id   TEXT,
  provenance  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS gs_edges (
  id          SERIAL PRIMARY KEY,
  edge_id     TEXT UNIQUE NOT NULL,
  source_node TEXT NOT NULL REFERENCES gs_nodes(node_id),
  target_node TEXT NOT NULL REFERENCES gs_nodes(node_id),
  relation    TEXT NOT NULL,
  confidence  FLOAT DEFAULT 0.5,
  uncertainty FLOAT DEFAULT 0.5,
  source_type TEXT,
  source_id   TEXT,
  provenance  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gs_nodes_type ON gs_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_gs_nodes_conf ON gs_nodes(confidence);
CREATE INDEX IF NOT EXISTS idx_gs_edges_rel  ON gs_edges(relation);
CREATE INDEX IF NOT EXISTS idx_gs_edges_conf ON gs_edges(confidence);

-- ============================================================
-- 3. Knowledge Assertions (created June 17, included for completeness)
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_assertions (
  id            SERIAL PRIMARY KEY,
  subject       TEXT NOT NULL,
  predicate     TEXT NOT NULL,
  object        TEXT NOT NULL,
  confidence    FLOAT,
  evidence_type TEXT,
  source        TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  user_id       TEXT
);

-- ============================================================
-- 4. Hypotheses
-- ============================================================
CREATE TABLE IF NOT EXISTS hypotheses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID REFERENCES auth.users(id),
  query_text  TEXT NOT NULL,
  domain      TEXT NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  statement   TEXT NOT NULL,
  confidence  FLOAT DEFAULT 0,
  voi_score   FLOAT DEFAULT 0,
  relevance   FLOAT DEFAULT 0,
  congruence  FLOAT DEFAULT 0,
  evidence_count INT DEFAULT 0,
  sources     TEXT[],
  graph_nodes TEXT[],
  status      TEXT DEFAULT 'generated',
  ars_response JSONB,
  session_id  TEXT
);
CREATE INDEX IF NOT EXISTS idx_hyp_user   ON hypotheses(user_id);
CREATE INDEX IF NOT EXISTS idx_hyp_voi    ON hypotheses(voi_score DESC);
CREATE INDEX IF NOT EXISTS idx_hyp_domain ON hypotheses(domain);

-- ============================================================
-- 5. LOPE — Library of Possible Experiments
-- ============================================================
CREATE TABLE IF NOT EXISTS lope_experiments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  template_id              TEXT UNIQUE,
  name                     TEXT NOT NULL,
  description              TEXT,
  domain                   TEXT NOT NULL DEFAULT 'general',
  node_types               TEXT[],
  edge_types               TEXT[],
  required_services        TEXT[],
  estimated_cost_usd       NUMERIC DEFAULT 0,
  estimated_days           INT DEFAULT 30,
  complexity               TEXT DEFAULT 'medium',
  expected_confidence_gain FLOAT DEFAULT 0.1,
  information_type         TEXT,
  is_active                BOOLEAN DEFAULT TRUE,
  voi_weight               FLOAT DEFAULT 1.0
);

-- ============================================================
-- 6. SLAM Sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS slam_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  user_id         UUID REFERENCES auth.users(id),
  query_text      TEXT NOT NULL,
  domain          TEXT,
  k_tuples        JSONB,
  causal_nodes    JSONB,
  causal_edges    JSONB,
  pathway_model   JSONB,
  simulation      JSONB,
  ars_session_id  TEXT,
  confidence      FLOAT,
  status          TEXT DEFAULT 'pending'
);

-- ============================================================
-- 7. DAE Sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS dae_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  experiment_id       UUID,
  user_id             UUID REFERENCES auth.users(id),
  raw_results         TEXT,
  extracted_triples   JSONB,
  confidence_summary  JSONB,
  anomalies           JSONB,
  sskm_update         JSONB,
  voi_delta           FLOAT,
  status              TEXT DEFAULT 'pending'
);

-- ============================================================
-- 8. CRO Vendor Marketplace
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  vendor_type     TEXT NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  website         TEXT,
  geography       TEXT,
  online_capable  BOOLEAN DEFAULT TRUE,
  specializations TEXT[],
  service_tags    TEXT[],
  certifications  TEXT[],
  turnaround_days INT,
  min_order_usd   NUMERIC,
  trust_score     NUMERIC DEFAULT 0.5,
  review_count    INT DEFAULT 0,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  kbkg_node_id    TEXT UNIQUE,
  contact_email   TEXT,
  contact_name    TEXT
);
CREATE INDEX IF NOT EXISTS vendors_fts ON vendors
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(description,'') || ' ' || array_to_string(COALESCE(specializations, '{}'),' ')));
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);

CREATE TABLE IF NOT EXISTS experiments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  user_id             UUID REFERENCES auth.users(id),
  hypothesis_id       UUID REFERENCES hypotheses(id),
  title               TEXT NOT NULL,
  hypothesis_text     TEXT,
  experimental_design JSONB,
  required_services   TEXT[],
  priority_score      NUMERIC,
  status              TEXT DEFAULT 'draft',
  chooser_version     TEXT,
  ars_session_id      TEXT,
  slam_session_id     UUID REFERENCES slam_sessions(id)
);
CREATE INDEX IF NOT EXISTS idx_exp_user   ON experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_exp_status ON experiments(status);

CREATE TABLE IF NOT EXISTS vendor_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  vendor_id     UUID REFERENCES vendors(id) ON DELETE CASCADE,
  match_score   NUMERIC,
  match_reasons TEXT[],
  rank          INT,
  status        TEXT DEFAULT 'suggested'
);

CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  experiment_id   UUID REFERENCES experiments(id),
  vendor_id       UUID REFERENCES vendors(id),
  user_id         UUID REFERENCES auth.users(id),
  status          TEXT DEFAULT 'inquiry',
  quote_usd       NUMERIC,
  notes           TEXT,
  vendor_response TEXT,
  outcome_data    JSONB,
  dae_session_id  UUID
);

-- ============================================================
-- 9. Citizen Subjects (SciCrush layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS citizen_subjects (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES auth.users(id) UNIQUE,
  display_name         TEXT,
  bio                  TEXT,
  public_kbkg          BOOLEAN DEFAULT FALSE,
  audience_type        TEXT DEFAULT 'private',
  fiverr_active        BOOLEAN DEFAULT FALSE,
  subscriber_price_usd NUMERIC,
  total_subscribers    INT DEFAULT 0,
  consent_version      TEXT,
  consent_at           TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS subject_journey_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  subject_id    UUID REFERENCES citizen_subjects(id),
  experiment_id UUID REFERENCES experiments(id),
  post_type     TEXT,
  content       TEXT,
  graph_snapshot JSONB,
  visibility    TEXT DEFAULT 'subscribers',
  likes         INT DEFAULT 0,
  cohort_joins  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cohort_enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrolled_at   TIMESTAMPTZ DEFAULT NOW(),
  subject_id    UUID REFERENCES citizen_subjects(id),
  follower_id   UUID REFERENCES auth.users(id),
  experiment_id UUID REFERENCES experiments(id),
  status        TEXT DEFAULT 'running'
);

-- ============================================================
-- 10. Discover Kit Subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS kit_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  tier          TEXT,
  stripe_sub_id TEXT,
  status        TEXT DEFAULT 'active',
  kit_count     INT DEFAULT 0,
  next_kit_date DATE
);

CREATE TABLE IF NOT EXISTS kits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES kit_subscriptions(id),
  user_id         UUID REFERENCES auth.users(id),
  experiment_id   UUID REFERENCES experiments(id),
  kit_type        TEXT,
  month           DATE,
  qr_token        TEXT UNIQUE,
  status          TEXT DEFAULT 'shipped',
  tracking_code   TEXT,
  results_url     TEXT
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE gs_quads ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "public read" ON gs_quads FOR SELECT USING (graph_name = 'public');
CREATE POLICY IF NOT EXISTS "auth insert"  ON gs_quads FOR INSERT WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner" ON hypotheses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "public read vendors"  ON vendors FOR SELECT USING (is_active = TRUE);
CREATE POLICY IF NOT EXISTS "admin manage vendors" ON vendors FOR ALL USING ((auth.jwt() ->> 'role') = 'admin');

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner experiments" ON experiments FOR ALL USING (auth.uid() = user_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "owner bookings" ON bookings FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO vendors (name,slug,vendor_type,description,specializations,service_tags,certifications,geography,online_capable,turnaround_days,trust_score,is_verified,is_active,website,contact_email,kbkg_node_id)
VALUES ('BioNana Storage','bionana','storage','Freeze-dried biological archiving. Room-temperature stable DNA, cord blood, and specimen storage. One-time fee. Founded by the scientist who preserved sperm for 36 years.',ARRAY['dna-storage','cord-blood','sperm-banking','freeze-drying','specimen-archiving'],ARRAY['lyophilization','family-storage','parental-portal','one-time-fee'],ARRAY['pending'],'Online-only',TRUE,5,1.0,TRUE,TRUE,'https://bionana.com','storage@bionana.com','kbkg-vendor-bionana-001')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lope_experiments (template_id,name,description,domain,node_types,edge_types,required_services,estimated_cost_usd,estimated_days,complexity,expected_confidence_gain,information_type)
VALUES ('EXP-GMOPS-2026','Global Multi-Omic Perturbation Study','Systematic perturbation of multi-omic networks to identify causal drivers across genomic, proteomic, and metabolomic layers.','biomedical',ARRAY['Gene','Variant','Protein','Pathway','Perturbation','Phenotype'],ARRAY['Causal','Associative','Regulatory','Intervention'],ARRAY['genomic-sequencing','proteomics','metabolomics','bioinformatics'],15000,90,'high',0.35,'causal')
ON CONFLICT (template_id) DO NOTHING;
