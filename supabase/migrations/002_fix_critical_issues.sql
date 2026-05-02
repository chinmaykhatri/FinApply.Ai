-- ═══════════════════════════════════════════════
-- Migration: Fix Critical Issues
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Add 'rejected' to status CHECK constraint
-- (DROP old constraint first, then re-add with new values)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'dealroom_sent', 'submitted', 'scored', 'report_sent', 'rejected'));

-- 2. Add case_code column to simulations
ALTER TABLE simulations ADD COLUMN IF NOT EXISTS case_code TEXT;

-- 3. Allow anonymous reads on simulations (for dashboard lookup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow anonymous read simulations'
  ) THEN
    CREATE POLICY "Allow anonymous read simulations" ON simulations
      FOR SELECT TO anon USING (true);
  END IF;
END
$$;

-- Done! Verify with:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'simulations';
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'applications'::regclass;
