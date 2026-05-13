-- ═══════════════════════════════════════════════
-- Migration: Add integrity tracking columns to simulations
-- Run this in Supabase SQL Editor if you have existing data
-- ═══════════════════════════════════════════════

ALTER TABLE simulations ADD COLUMN IF NOT EXISTS tab_violations INTEGER DEFAULT 0;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS violation_log TEXT;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS paste_count INTEGER DEFAULT 0;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS large_paste_count INTEGER DEFAULT 0;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS typing_bursts INTEGER DEFAULT 0;
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100;
