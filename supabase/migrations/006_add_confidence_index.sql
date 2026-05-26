-- ═══════════════════════════════════════════════
-- Migration 006: Add confidence_level to fiss_reports
-- Supports the new Confidence Index badge on reports
-- ═══════════════════════════════════════════════

-- Add confidence level (HIGH/MEDIUM/LOW) scored by the AI evaluator
ALTER TABLE fiss_reports
ADD COLUMN IF NOT EXISTS confidence_level TEXT DEFAULT 'HIGH';

-- Add the reason string for transparency
ALTER TABLE fiss_reports
ADD COLUMN IF NOT EXISTS confidence_reason TEXT;

COMMENT ON COLUMN fiss_reports.confidence_level IS 'AI-assessed confidence in scoring accuracy: HIGH, MEDIUM, or LOW';
COMMENT ON COLUMN fiss_reports.confidence_reason IS 'One-sentence explanation of the confidence level assessment';
