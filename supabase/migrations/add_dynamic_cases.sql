-- ═══════════════════════════════════════════════
-- Add dynamic case variables to simulations
-- Each candidate gets unique financial figures;
-- stored here for evaluation reference.
-- ═══════════════════════════════════════════════

ALTER TABLE simulations ADD COLUMN IF NOT EXISTS case_instance_id TEXT;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS case_variables JSONB;

-- Add analytics fields to fiss_reports
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS non_obvious_found BOOLEAN DEFAULT false;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS non_obvious_note TEXT;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS loom_url TEXT;

-- Case metadata for library management
CREATE TABLE IF NOT EXISTS case_metadata (
  case_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  role_track TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Intermediate',
  last_updated TIMESTAMPTZ DEFAULT now(),
  market_context_updated_at TIMESTAMPTZ DEFAULT now(),
  total_uses INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'review_needed', 'retiring_soon', 'retired')),
  updated_by TEXT,
  market_context_override TEXT,
  financial_data_override JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for case_metadata — admin only
ALTER TABLE case_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on case_metadata" ON case_metadata
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for quick lookups by track
CREATE INDEX IF NOT EXISTS idx_case_metadata_track ON case_metadata(role_track);
CREATE INDEX IF NOT EXISTS idx_case_metadata_status ON case_metadata(status);
