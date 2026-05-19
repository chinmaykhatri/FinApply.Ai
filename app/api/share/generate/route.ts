import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateShareId, addCollisionSuffix } from '@/lib/share';

/* POST /api/share/generate — Generate a public share ID for a candidate's FISS score */
export async function POST(request: NextRequest) {
  try {
    const { application_id, report_token } = await request.json();

    if (!application_id && !report_token) {
      return NextResponse.json(
        { error: 'application_id or report_token required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find the application
    let query = supabase
      .from('applications')
      .select('id, full_name, target_role, share_id, fiss_reports(total_score)');

    if (application_id) {
      query = query.eq('id', application_id);
    } else {
      query = query.eq('report_token', report_token);
    }

    const { data: app, error } = await query.single();
    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // If share_id already exists, return it
    if (app.share_id) {
      return NextResponse.json({ share_id: app.share_id });
    }

    // Need a FISS report to generate share ID
    const reports = app.fiss_reports as { total_score: number }[] | null;
    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: 'No FISS report found' }, { status: 400 });
    }

    const score = reports[0].total_score;
    let shareId = generateShareId(app.full_name, score, app.target_role);

    // Check for collision
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('share_id', shareId)
      .maybeSingle();

    if (existing) {
      shareId = addCollisionSuffix(shareId);
    }

    // Store the share ID
    await supabase
      .from('applications')
      .update({ share_id: shareId })
      .eq('id', app.id);

    return NextResponse.json({ share_id: shareId });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
