-- ═══════════════════════════════════════════════
-- FIX: Tighten RLS policies for anonymous reads
-- PROBLEM: USING(true) on anon SELECT lets anyone 
--          read ALL applications and FISS reports
-- SOLUTION: Since all API routes use createAdminClient()
--           (which bypasses RLS), we can safely restrict
--           anon reads. No client-side queries hit these
--           tables directly — everything goes through 
--           server-side API routes.
-- ═══════════════════════════════════════════════

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow anonymous read by report_token" ON applications;
DROP POLICY IF EXISTS "Allow anonymous read fiss_reports" ON fiss_reports;

-- Replace with token-scoped read policies
-- Applications: anon can only read their own record via report_token or deal_room_token
CREATE POLICY "Anon read own application by report_token" ON applications
  FOR SELECT TO anon
  USING (
    report_token IS NOT NULL 
    AND report_token = current_setting('request.headers'::text, true)::json->>'x-report-token'
  );

-- FISS Reports: anon cannot read directly (all reads go through /api/report/[token] which uses admin client)
-- No anon SELECT policy = no anonymous access

-- Simulations: anon can insert but not read (reads go through admin API)
-- Already correct — no anon SELECT policy exists

-- Verify: Admin authenticated access remains unchanged (existing policies cover this)
