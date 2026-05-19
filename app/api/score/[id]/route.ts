import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* GET /api/score/[id] — Public FISS Score data by share_id */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string' || id.length > 80) {
      return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 });
    }

    // Validate share ID format: alphanumeric + hyphens only
    if (!/^[a-z0-9-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid share ID format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: app, error } = await supabase
      .from('applications')
      .select(`
        full_name,
        target_role,
        created_at,
        status,
        fiss_reports (
          total_score,
          percentile,
          financial_reasoning,
          structured_thinking,
          risk_identification,
          decision_clarity,
          evaluator_summary,
          created_at
        )
      `)
      .eq('share_id', id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 });
    }

    // Only serve if scored or report_sent
    const allowedStatuses = ['scored', 'report_sent'];
    if (!allowedStatuses.includes(app.status)) {
      return NextResponse.json({ error: 'Score not yet available' }, { status: 403 });
    }

    const reports = app.fiss_reports as Record<string, unknown>[];
    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: 'No report found' }, { status: 404 });
    }

    // Return only public-safe data (no email, no tokens, no internal IDs)
    return NextResponse.json({
      data: {
        full_name: app.full_name,
        target_role: app.target_role,
        registered_at: app.created_at,
        report: reports[0],
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
