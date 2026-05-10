import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/report/[token] — Fetch FISS report by report token */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/report' }, request);
      return limited;
    }

    const { token } = await params;

    if (!token || typeof token !== 'string' || token.length > 100) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find application by report token — exclude sensitive fields
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        target_role,
        status,
        college_or_firm,
        created_at,
        fiss_reports (*)
      `)
      .eq('report_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // SECURITY: strip email, deal_room_token, report_token from response
    return NextResponse.json({ data: app });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
