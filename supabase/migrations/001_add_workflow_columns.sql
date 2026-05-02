-- ═══════════════════════════════════════════════
-- FinApply.ai — Workflow Columns Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════

-- 1. Add linkedin_url to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 2. Add PDF URL and override tracking to fiss_reports table
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS loom_url TEXT;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS override_by TEXT;
ALTER TABLE fiss_reports ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ;

-- 3. Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5) NOT NULL,
  usefulness_rating INT CHECK (usefulness_rating BETWEEN 1 AND 5) NOT NULL,
  would_recommend BOOLEAN DEFAULT true,
  open_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to INSERT feedback (candidates don't need auth)
CREATE POLICY "Allow anonymous feedback inserts"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admin) to SELECT all feedback
CREATE POLICY "Allow authenticated users to read feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Create the reports storage bucket (for PDF uploads)
-- NOTE: You need to do this in the Supabase Dashboard:
--   Storage → New Bucket → Name: "reports" → Public: ON → Create

-- 6. Add storage policy for reports bucket
-- Run this AFTER creating the bucket:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;
