import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* POST /api/admin/score — Submit FISS scores for a candidate */
export async function POST(request: NextRequest) {
  try {
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

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('fiss_reports')
      .insert({
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

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* PATCH /api/admin/score — Admin override of existing FISS scores */
export async function PATCH(request: NextRequest) {
  try {
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

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('fiss_reports')
      .update({
        total_score,
        financial_reasoning,
        structured_thinking,
        risk_identification,
        decision_clarity,
        standout_strength,
        critical_gap,
        evaluator_summary,
        loom_url: loom_url || null,
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

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
