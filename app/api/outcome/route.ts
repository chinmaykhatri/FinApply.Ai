import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/outcome — Candidate reports their career outcome */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/outcome' }, request);
      return limited;
    }

    const supabase = createAdminClient();
    const body = await request.json();
    const { token, outcome, company, role, feedback, finapply_helpful } = body;

    if (!outcome) {
      return NextResponse.json({ error: 'Outcome is required' }, { status: 400 });
    }

    // Sanitize all text inputs
    const sanitizedOutcome = sanitizeString(outcome, 100);
    const sanitizedCompany = sanitizeString(company, 200);
    const sanitizedRole = sanitizeString(role, 200);
    const sanitizedFeedback = sanitizeString(feedback, 2000);

    // Look up application by report_token if provided
    let applicationId = null;
    if (token && typeof token === 'string') {
      const { data: app } = await supabase
        .from('applications')
        .select('id')
        .eq('report_token', sanitizeString(token, 100))
        .single();
      if (app) applicationId = app.id;
    }

    const { error } = await supabase
      .from('outcome_responses')
      .insert({
        application_id: applicationId,
        outcome: sanitizedOutcome,
        company: sanitizedCompany || null,
        role: sanitizedRole || null,
        feedback: sanitizedFeedback || null,
        finapply_helpful: finapply_helpful === true || finapply_helpful === 'true' ? true : false,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Outcome insert error:', error.message);
      // Table may not exist yet — don't expose error details
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
