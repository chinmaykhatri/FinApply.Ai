import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateFissReportBuffer } from '@/lib/generatePdfBuffer';
import { applyRateLimit, auditLog } from '@/lib/security';

/* GET /api/report/[token]/pdf — Download the full FISS Report as PDF */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/report/pdf' }, request);
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

    // Find application by report token
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        full_name,
        college_or_firm,
        status,
        fiss_reports (*)
      `)
      .eq('report_token', token)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Only serve when report exists
    const reportReadyStatuses = ['scored', 'report_sent'];
    if (!reportReadyStatuses.includes(app.status)) {
      return NextResponse.json({ error: 'Report not yet available' }, { status: 403 });
    }

    const reports = app.fiss_reports as Array<Record<string, unknown>>;
    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: 'FISS report not found' }, { status: 404 });
    }

    const r = reports[0];

    // Generate PDF buffer
    const pdfBuffer = generateFissReportBuffer({
      candidateName: app.full_name,
      candidateCollege: app.college_or_firm,
      report: {
        total_score: r.total_score as number,
        percentile: (r.percentile as string) || 'Founding Cohort — Batch 1',
        financial_reasoning: r.financial_reasoning as { score: number; grade: 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap'; rationale: string; evidence: string; improvement: string },
        structured_thinking: r.structured_thinking as { score: number; grade: 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap'; rationale: string; evidence: string; improvement: string },
        risk_identification: r.risk_identification as { score: number; grade: 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap'; rationale: string; evidence: string; improvement: string },
        decision_clarity: r.decision_clarity as { score: number; grade: 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap'; rationale: string; evidence: string; improvement: string },
        standout_strength: (r.standout_strength as string) || '',
        critical_gap: (r.critical_gap as string) || '',
        evaluator_summary: (r.evaluator_summary as string) || '',
      },
    });

    const safeName = (app.full_name || 'Candidate').replace(/\s+/g, '_');

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="FISS_Report_${safeName}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
