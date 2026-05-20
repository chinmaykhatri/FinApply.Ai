-- ═══════════════════════════════════════════════
-- Migration 004: Allow Multiple Simulations Per User
-- Drops UNIQUE constraint on applications.email
-- so the same user can have multiple application rows
-- (each representing one simulation attempt).
-- ═══════════════════════════════════════════════

-- Drop the unique constraint on email
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_email_key;

-- Drop the unique index if it was created separately
DROP INDEX IF EXISTS applications_email_key;

-- Re-create a non-unique index for fast lookups
CREATE INDEX IF NOT EXISTS idx_applications_email_lookup ON applications(email);
