import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/dealroom/[token]/score — Lightweight score check for polling
   Returns FISS score + dimensions if evaluation is complete, or { status: 'pending' }.
   Used by the Deal Room submitted screen to show the score in real time. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit: 30 per minute per IP (same as token validation)
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/dealroom/score' }, request);
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

    const supabase = createAdminClient();

    // Find application by deal_room_token
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id, status, report_token')
      .eq('deal_room_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    // If not yet scored, return pending
    if (!['scored', 'report_sent'].includes(app.status)) {
      return NextResponse.json({
        status: 'pending',
        app_status: app.status,
      });
    }

    // Fetch the FISS report
    const { data: report } = await supabase
      .from('fiss_reports')
      .select('id, total_score, financial_reasoning, structured_thinking, risk_identification, decision_clarity, evaluator_summary, standout_strength, critical_gap, created_at')
      .eq('application_id', app.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!report) {
      return NextResponse.json({ status: 'pending', app_status: app.status });
    }

    // Return score data
    return NextResponse.json({
      status: 'scored',
      report_token: app.report_token || null,
      score: {
        total: report.total_score,
        financial_reasoning: report.financial_reasoning,
        structured_thinking: report.structured_thinking,
        risk_identification: report.risk_identification,
        decision_clarity: report.decision_clarity,
        evaluator_summary: report.evaluator_summary,
        standout_strength: report.standout_strength,
        critical_gap: report.critical_gap,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
