-- ═══════════════════════════════════════════════
-- FinApply.ai — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  college_or_firm TEXT NOT NULL,
  city TEXT NOT NULL,
  current_status TEXT NOT NULL,
  target_role TEXT NOT NULL,
  essay TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'dealroom_sent', 'submitted', 'scored', 'report_sent', 'rejected', 'eval_failed')),
  deal_room_token TEXT UNIQUE,
  report_token TEXT UNIQUE,
  share_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Simulations Table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  case_code TEXT,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  tab_violations INTEGER DEFAULT 0,
  violation_log TEXT,
  paste_count INTEGER DEFAULT 0,
  large_paste_count INTEGER DEFAULT 0,
  typing_bursts INTEGER DEFAULT 0,
  integrity_score INTEGER DEFAULT 100 CHECK (integrity_score >= 0 AND integrity_score <= 100)
);

-- FISS Reports Table
CREATE TABLE IF NOT EXISTS fiss_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  simulation_id UUID REFERENCES simulations(id),
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  percentile TEXT,
  financial_reasoning JSONB,
  structured_thinking JSONB,
  risk_identification JSONB,
  decision_clarity JSONB,
  standout_strength TEXT,
  critical_gap TEXT,
  evaluator_summary TEXT,
  employer_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deal_room_token ON applications(deal_room_token);
CREATE INDEX IF NOT EXISTS idx_applications_report_token ON applications(report_token);
CREATE INDEX IF NOT EXISTS idx_applications_share_id ON applications(share_id);
CREATE INDEX IF NOT EXISTS idx_simulations_application ON simulations(application_id);
CREATE INDEX IF NOT EXISTS idx_fiss_reports_application ON fiss_reports(application_id);

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiss_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for applications (beta form)
CREATE POLICY "Allow anonymous insert" ON applications
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Admin full access on applications" ON applications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access on simulations" ON simulations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anonymous inserts for simulations (deal room)
CREATE POLICY "Allow anonymous simulation insert" ON simulations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Admin full access on fiss_reports" ON fiss_reports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anonymous reads: RESTRICTED
-- All data access goes through server-side API routes using createAdminClient()
-- which bypasses RLS entirely. No anon SELECT policies needed.
-- This prevents anyone with the Supabase anon key from querying all data.
