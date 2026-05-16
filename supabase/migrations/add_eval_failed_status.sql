-- ═══════════════════════════════════════════════
-- FIX: Add 'eval_failed' to applications status CHECK constraint
-- The retry logic in simulations/route.ts sets status = 'eval_failed'
-- but the original CHECK constraint didn't include this value,
-- causing silent INSERT/UPDATE failures.
-- ═══════════════════════════════════════════════

-- Drop the existing constraint (named by PostgreSQL auto-convention)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- Re-add with eval_failed included
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'dealroom_sent', 'submitted', 'scored', 'report_sent', 'rejected', 'eval_failed'));
