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
        created_at,
        simulations (id, case_code, submitted_at)
      `)
      .eq('deal_room_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Allow access for registered, approved, or submitted users
    const allowedStatuses = ['applied', 'dealroom_sent', 'submitted'];
    if (!allowedStatuses.includes(app.status)) {
      return NextResponse.json({ error: 'Deal room access not available' }, { status: 403 });
    }

    // SECURITY: never return report_token, deal_room_token, or email in response
    return NextResponse.json({ data: app });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
