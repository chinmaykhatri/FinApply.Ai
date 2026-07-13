import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/dealroom/[token] — Validate deal room token and fetch application */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/dealroom' }, request);
      return limited;
    }

    const { token } = await params;

    if (!token || typeof token !== 'string' || token.length > 100) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Find application by deal_room_token — only return safe fields
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        target_role,
        status,
        report_token,
        created_at,
        simulations (id, case_code, submitted_at)
      `)
      .eq('deal_room_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Allow access for registered, approved, submitted, scored, and report_sent users
    // Scored/report_sent users returning to their link should see their score
    const allowedStatuses = ['applied', 'dealroom_sent', 'submitted', 'scored', 'report_sent', 'eval_failed'];
    if (!allowedStatuses.includes(app.status)) {
      return NextResponse.json({ error: 'Deal room access not available' }, { status: 403 });
    }

    // Build safe response — include report_token only for scored users
    const { report_token, ...safeApp } = app;
    const isScoredOrSent = ['scored', 'report_sent'].includes(app.status);

    return NextResponse.json({
      data: {
        ...safeApp,
        // Only expose report_token when the report exists
        report_token: isScoredOrSent ? report_token : undefined,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
