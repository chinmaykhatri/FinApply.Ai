import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/* GET /api/verify/[id] — Public FISS Score verification by share_id
   Returns a minimal JSON confirmation for employer verification.
   No auth required — the share_id is already a public slug. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string' || id.length > 80) {
      return NextResponse.json({ verified: false, error: 'Invalid share ID' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(id)) {
      return NextResponse.json({ verified: false, error: 'Invalid share ID format' }, { status: 400 });
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
          created_at
        )
      `)
      .eq('share_id', id)
      .single();

    if (error || !app) {
      return NextResponse.json({ verified: false, error: 'Score not found' }, { status: 404 });
    }

    const allowedStatuses = ['scored', 'report_sent'];
    if (!allowedStatuses.includes(app.status)) {
      return NextResponse.json({ verified: false, error: 'Score not yet available' }, { status: 403 });
    }

    const reports = app.fiss_reports as Array<{ total_score: number; percentile: string; created_at: string }>;
    if (!reports || reports.length === 0) {
      return NextResponse.json({ verified: false, error: 'No report found' }, { status: 404 });
    }

    const report = reports[0];

    return NextResponse.json({
      verified: true,
      candidate_name: app.full_name,
      target_role: app.target_role,
      total_score: report.total_score,
      percentile: report.percentile,
      simulation_date: report.created_at,
      verification_timestamp: new Date().toISOString(),
      platform: 'FinApply.ai',
      verification_url: `https://finapply.ai/verify/${id}`,
    });
  } catch {
    return NextResponse.json({ verified: false, error: 'Internal server error' }, { status: 500 });
  }
}
