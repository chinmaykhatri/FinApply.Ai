import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, auditLog } from '@/lib/security';

/* POST /api/feedback — Candidate submits feedback on their FISS report */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 per minute per IP
    const limited = applyRateLimit(request, 'api');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/feedback' }, request);
      return limited;
    }

    const body = await request.json();
    const {
      report_token,
      accuracy_rating,
      usefulness_rating,
      would_recommend,
      open_feedback,
    } = body;

    // ══════════════════════════════════════════════
    // OWNERSHIP CHECK — require report_token instead of raw application_id
    // Prevents IDOR: only the token holder can submit feedback
    // ══════════════════════════════════════════════
    if (!report_token || !accuracy_rating || !usefulness_rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate rating ranges
    const accRating = Number(accuracy_rating);
    const useRating = Number(usefulness_rating);
    if (accRating < 1 || accRating > 5 || useRating < 1 || useRating > 5) {
      return NextResponse.json({ error: 'Ratings must be between 1 and 5' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Look up application by report_token to prove ownership
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('report_token', report_token)
      .single();

    if (appError || !app) {
      auditLog('api.suspicious', {
        endpoint: '/api/feedback',
        reason: 'Invalid report_token',
      }, request);
      return NextResponse.json({ error: 'Invalid report token' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        application_id: app.id,
        accuracy_rating: accRating,
        usefulness_rating: useRating,
        would_recommend: would_recommend ?? true,
        open_feedback: sanitizeString(open_feedback, 2000) || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Feedback insert error:', error.message);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id: data.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
