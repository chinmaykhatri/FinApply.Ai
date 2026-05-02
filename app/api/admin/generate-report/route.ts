import { NextResponse, NextRequest } from 'next/server';

/* POST /api/admin/generate-report — Return report URL (PDF generated client-side via jsPDF) */
export async function POST(request: NextRequest) {
  try {
    const { application_id } = await request.json();

    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    // Dynamic import supabase to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
      return NextResponse.json({ error: 'FISS report not found. Score the candidate first.' }, { status: 404 });
    }

    // Return the interactive report URL — PDF is generated client-side via jsPDF
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app'}/report/${app.report_token}`;

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
