import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/my-score?token=xxx — Fetch full dashboard data for the candidate */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/my-score' }, request);
      return limited;
    }

    const token = request.nextUrl.searchParams.get('token');

    if (!token || typeof token !== 'string' || token.length > 100) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find application by report_token — return everything needed for the dashboard
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        email,
        college_or_firm,
        city,
        target_role,
        status,
        share_id,
        created_at,
        simulations (
          id,
          case_code,
          word_count,
          time_taken_seconds,
          started_at,
          submitted_at
        ),
        fiss_reports (*)
      `)
      .eq('report_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Only serve when report exists
    const reportReadyStatuses = ['scored', 'report_sent'];
    if (!reportReadyStatuses.includes(app.status)) {
      return NextResponse.json({ error: 'Report not yet available' }, { status: 403 });
    }

    // Strip email from response (privacy — this is the candidate's own page
    // but the token is the auth, no need to leak email in API response)
    const { email: _email, ...safeApp } = app;

    return NextResponse.json({ data: safeApp });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
