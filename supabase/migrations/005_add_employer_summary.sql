-- ═══════════════════════════════════════════════
-- Migration 005: Add employer_summary to fiss_reports
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

ALTER TABLE fiss_reports
  ADD COLUMN IF NOT EXISTS employer_summary TEXT;

COMMENT ON COLUMN fiss_reports.employer_summary IS 'AI-generated 2-sentence summary written for hiring managers, not the candidate';
