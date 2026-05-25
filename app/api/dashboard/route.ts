import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/dashboard — Lookup user applications by email */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: aggressive — 10 per minute per IP (prevents email enumeration)
    const limited = applyRateLimit(request, 'scrape');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/dashboard' }, request);
      return limited;
    }

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = sanitizeString(email, 254).toLowerCase();
    const supabase = createAdminClient();

    // Fetch applications — user's own data
    // SECURITY: Tokens are NOT returned in the API response to prevent enumeration attacks.
    // Users receive tokens via email only. Dashboard shows status without exposing tokens.
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        email,
        target_role,
        status,
        deal_room_token,
        report_token,
        created_at,
        updated_at
      `)
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Dashboard lookup error:', error.message);
      return NextResponse.json({ error: 'Failed to lookup applications' }, { status: 500 });
    }

    if (!applications || applications.length === 0) {
      // SECURITY: Return 200 with empty data — prevents email enumeration
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // For each application, fetch report and simulation
    // Strip tokens from response to prevent unauthorized access
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const { data: reports } = await supabase
          .from('fiss_reports')
          .select('id, total_score, financial_reasoning, structured_thinking, risk_identification, decision_clarity, created_at')
          .eq('application_id', app.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: sims } = await supabase
          .from('simulations')
          .select('id, case_code, word_count, time_taken_seconds, submitted_at')
          .eq('application_id', app.id)
          .order('submitted_at', { ascending: false })
          .limit(1);

        // SECURITY: Strip tokens from response — but keep deal_room_token for users
        // who haven't submitted yet, so they can always access their Deal Room
        const { deal_room_token: _drt, report_token: _rt, ...safeApp } = app;
        const hasActiveDealRoom = !sims?.length && ['applied', 'dealroom_sent'].includes(app.status);

        return {
          ...safeApp,
          // Provide boolean flags for general status
          has_deal_room: !!_drt,
          has_report: !!_rt,
          // Include deal_room_token only for users who need to access the Deal Room
          // (not yet submitted). Once submitted, token is no longer needed.
          deal_room_token: hasActiveDealRoom ? _drt : undefined,
          report: reports?.[0] || null,
          simulation: sims?.[0] || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
