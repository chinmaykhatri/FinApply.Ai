import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, auditLog } from '@/lib/security';

/* POST /api/admin/score — Submit FISS scores for a candidate */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per minute
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/admin/score' }, request);
      return limited;
    }

    const body = await request.json();
    const {
      application_id,
      simulation_id,
      total_score,
      percentile,
      financial_reasoning,
      structured_thinking,
      risk_identification,
      decision_clarity,
      standout_strength,
      critical_gap,
      evaluator_summary,
    } = body;

    if (!application_id || !simulation_id || total_score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numeric score bounds
    const score = Number(total_score);
    if (isNaN(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: 'total_score must be 0-100' }, { status: 400 });
    }

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(application_id) || !uuidRegex.test(simulation_id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('fiss_reports')
      .insert({
        application_id,
        simulation_id,
        total_score: score,
        percentile: sanitizeString(percentile || 'Founding Cohort', 100),
        financial_reasoning,
        structured_thinking,
        risk_identification,
        decision_clarity,
        standout_strength: sanitizeString(standout_strength || '', 500),
        critical_gap: sanitizeString(critical_gap || '', 500),
        evaluator_summary: sanitizeString(evaluator_summary || '', 2000),
      })
      .select()
      .single();

    if (error) {
      console.error('Score insert error:', error);
      return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 });
    }

    // Update application status
    await supabase
      .from('applications')
      .update({ status: 'scored', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    auditLog('admin.action', {
      action: 'score_submitted',
      application_id,
      simulation_id,
      total_score: score,
    }, request);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* PATCH /api/admin/score — Admin override of existing FISS scores */
export async function PATCH(request: NextRequest) {
  try {
    // Rate limit: 10 per minute
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/admin/score/patch' }, request);
      return limited;
    }

    const body = await request.json();
    const {
      report_id,
      total_score,
      financial_reasoning,
      structured_thinking,
      risk_identification,
      decision_clarity,
      standout_strength,
      critical_gap,
      evaluator_summary,
      loom_url,
    } = body;

    if (!report_id) {
      return NextResponse.json({ error: 'Missing report_id' }, { status: 400 });
    }

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(report_id)) {
      return NextResponse.json({ error: 'Invalid report_id format' }, { status: 400 });
    }

    // Validate score if provided
    if (total_score !== undefined) {
      const score = Number(total_score);
      if (isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json({ error: 'total_score must be 0-100' }, { status: 400 });
      }
    }

    // Validate loom_url if provided
    if (loom_url && typeof loom_url === 'string' && !loom_url.startsWith('https://www.loom.com/')) {
      return NextResponse.json({ error: 'Invalid Loom URL' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('fiss_reports')
      .update({
        total_score: total_score !== undefined ? Number(total_score) : undefined,
        financial_reasoning,
        structured_thinking,
        risk_identification,
        decision_clarity,
        standout_strength: standout_strength ? sanitizeString(standout_strength, 500) : undefined,
        critical_gap: critical_gap ? sanitizeString(critical_gap, 500) : undefined,
        evaluator_summary: evaluator_summary ? sanitizeString(evaluator_summary, 2000) : undefined,
        loom_url: loom_url ? sanitizeString(loom_url, 500) : null,
        override_by: 'admin',
        override_at: new Date().toISOString(),
      })
      .eq('id', report_id)
      .select()
      .single();

    if (error) {
      console.error('Score override error:', error);
      return NextResponse.json({ error: 'Failed to update scores' }, { status: 500 });
    }

    auditLog('admin.action', {
      action: 'score_override',
      report_id,
      new_total_score: total_score,
    }, request);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
