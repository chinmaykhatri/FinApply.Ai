import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* GET /api/admin/candidates — List all candidates with their simulations */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, full_name, email, target_role, status,
        college_or_firm, city, current_status,
        created_at, updated_at,
        simulations (id, case_code, word_count, time_taken_seconds, submitted_at, integrity_score, tab_violations, paste_count),
        fiss_reports (id, total_score, percentile, financial_reasoning, structured_thinking, risk_identification, decision_clarity, standout_strength, critical_gap, evaluator_summary, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* PATCH /api/admin/candidates — Update candidate status (send deal room, etc.) */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
