-- ═══════════════════════════════════════════════
-- Migration: Add share_id column to applications
-- Purpose: Public shareable FISS Score URL (e.g., /score/arjun-74-ib)
-- ═══════════════════════════════════════════════

-- Add the share_id column
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE;

-- Index for fast lookups by share_id
CREATE INDEX IF NOT EXISTS idx_applications_share_id ON applications(share_id);
