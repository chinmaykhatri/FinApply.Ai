import { NextResponse, NextRequest } from 'next/server';
import React from 'react';

/* POST /api/admin/generate-report — Generate a PDF and return/upload it */
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

    const reportDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Dynamic import @react-pdf/renderer to avoid build issues
    let pdfBuffer: Buffer;
    try {
      const { renderToBuffer } = await import('@react-pdf/renderer');
      const FissReportPdf = (await import('@/lib/report/pdf-template')).default;

      const pdfElement = React.createElement(FissReportPdf as any, {
        candidateName: app.full_name,
        college: app.college_or_firm || 'N/A',
        totalScore: report.total_score,
        percentile: report.percentile || 'Founding Cohort',
        evaluatorSummary: report.evaluator_summary || '',
        financialReasoning: report.financial_reasoning || { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
        structuredThinking: report.structured_thinking || { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
        riskIdentification: report.risk_identification || { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
        decisionClarity: report.decision_clarity || { score: 0, grade: 'Adequate', rationale: '', evidence: '', improvement: '' },
        standoutStrength: report.standout_strength || '',
        criticalGap: report.critical_gap || '',
        reportDate,
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app'}/report/${app.report_token}`,
      });

      pdfBuffer = await renderToBuffer(pdfElement as any);
    } catch (renderErr) {
      console.error('PDF render error:', renderErr);
      // Fallback: return the interactive report URL instead
      const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://finapply.vercel.app'}/report/${app.report_token}`;
      return NextResponse.json({
        success: true,
        pdf_url: reportUrl,
        fallback: true,
        message: 'PDF rendering unavailable. Use the interactive report link instead.',
      });
    }

    // Try to upload to Supabase Storage
    const fileName = `FISS_Report_${app.full_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    try {
      const { error: uploadErr } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadErr) {
        console.error('Upload error:', uploadErr);
        // Storage bucket may not exist — return PDF as base64 download
        const base64 = pdfBuffer.toString('base64');
        return NextResponse.json({
          success: true,
          pdf_base64: base64,
          filename: fileName,
          message: 'PDF generated (storage upload failed, returning direct download).',
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName);
      const pdfUrl = urlData.publicUrl;

      // Store URL in fiss_reports
      await supabase
        .from('fiss_reports')
        .update({ pdf_url: pdfUrl })
        .eq('id', report.id);

      return NextResponse.json({ success: true, pdf_url: pdfUrl });
    } catch {
      // Storage completely unavailable — return base64
      const base64 = pdfBuffer.toString('base64');
      return NextResponse.json({
        success: true,
        pdf_base64: base64,
        filename: fileName,
      });
    }
  } catch (err) {
    console.error('Generate report error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
