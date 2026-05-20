import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, auditLog } from '@/lib/security';

/* POST /api/admin/generate-report — Return report URL (PDF generated client-side via jsPDF) */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/admin/generate-report' }, request);
      return limited;
    }

    const { application_id } = await request.json();

    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch application
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('id, report_token')
      .eq('id', application_id)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch FISS report
    const { data: report, error: repErr } = await supabase
      .from('fiss_reports')
      .select('id, total_score')
      .eq('application_id', application_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (repErr || !report) {
      return NextResponse.json({ error: 'FISS report not found. Score the candidate first.' }, { status: 404 });
    }

    // Return the interactive report URL — PDF is generated client-side via jsPDF
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app'}/report/${app.report_token}`;

    auditLog('admin.action', {
      action: 'generate_report',
      application_id,
    }, request);

    return NextResponse.json({
      success: true,
      pdf_url: reportUrl,
      report_token: app.report_token,
      message: 'Report available at the interactive URL. PDF can be exported from the report page.',
    });
  } catch (err) {
    console.error('Generate report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
