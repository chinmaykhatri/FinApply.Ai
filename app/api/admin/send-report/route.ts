import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReportEmail } from '@/lib/email';

/* POST /api/admin/send-report — Send FISS report email directly via Resend */
export async function POST(request: NextRequest) {
  try {
    const { application_id } = await request.json();

    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch application
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch FISS report
    const { data: report, error: repErr } = await supabase
      .from('fiss_reports')
      .select('*')
      .eq('application_id', application_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (repErr || !report) {
      return NextResponse.json({ error: 'FISS report not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app';

    // Send FISS report email
    const roleTrack = app.target_role || 'Investment Banking';
    await sendReportEmail({
      full_name: app.full_name,
      email: app.email,
      fiss_score: report.total_score,
      percentile: report.percentile || 'Founding Cohort',
      role_track: roleTrack,
      fr_score: report.financial_reasoning?.score || 0,
      fr_grade: report.financial_reasoning?.grade || 'N/A',
      st_score: report.structured_thinking?.score || 0,
      st_grade: report.structured_thinking?.grade || 'N/A',
      ri_score: report.risk_identification?.score || 0,
      ri_grade: report.risk_identification?.grade || 'N/A',
      dc_score: report.decision_clarity?.score || 0,
      dc_grade: report.decision_clarity?.grade || 'N/A',
      one_liner: report.evaluator_summary || '',
      report_url: `${appUrl}/report/${app.report_token}`,
      loom_url: report.loom_url || undefined,
    });

    // Update status
    await supabase
      .from('applications')
      .update({ status: 'report_sent', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    return NextResponse.json({ success: true, message: `Report sent to ${app.email}` });
  } catch (err) {
    console.error('Send report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
