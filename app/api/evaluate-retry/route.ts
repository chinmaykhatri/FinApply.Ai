import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';
import { runEvaluationPipeline } from '@/lib/evaluation/engine';

// Allow up to 120s for AI evaluation pipeline
export const maxDuration = 120;

/* ══════════════════════════════════════════════
   POST /api/evaluate-retry
   
   Self-healing retry endpoint for stuck evaluations.
   Called by the dashboard when a submission has been
   stuck in "submitted" status for > 2 minutes.
   
   Auth: email ownership — must match the application.
   Rate limit: aggressive (1 per minute per IP).
   
   Body: { email: string, application_id: string }
   ══════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  // Rate limit: 2 retries per minute per IP
  const limited = applyRateLimit(request, 'ai');
  if (limited) {
    auditLog('api.rate_limited', { endpoint: '/api/evaluate-retry' }, request);
    return limited;
  }

  try {
    const { email, application_id } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 });
    }

    const normalizedEmail = sanitizeString(email, 254).toLowerCase();
    const supabase = createAdminClient();

    // 1. Verify email ownership — the email must match the application
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('id, email, status')
      .eq('id', application_id)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // SECURITY: Only the application owner can retry
    if (app.email.toLowerCase() !== normalizedEmail) {
      auditLog('api.suspicious', {
        endpoint: '/api/evaluate-retry',
        reason: 'Email mismatch on retry attempt',
        claimed_email: normalizedEmail,
        application_id,
      }, request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only retry if stuck in submitted or eval_failed status
    if (!['submitted', 'eval_failed'].includes(app.status)) {
      // If already scored/report_sent, return success
      if (['scored', 'report_sent'].includes(app.status)) {
        return NextResponse.json({
          success: true,
          message: 'Evaluation already completed',
          status: app.status,
        });
      }
      return NextResponse.json({
        error: `Cannot retry evaluation — status is "${app.status}"`,
      }, { status: 400 });
    }

    // 2. Check if a report already exists (evaluation may have completed but status wasn't updated)
    const { data: existingReport } = await supabase
      .from('fiss_reports')
      .select('id, total_score')
      .eq('application_id', application_id)
      .maybeSingle();

    if (existingReport) {
      // Report exists but status is stale — fix the status
      await supabase
        .from('applications')
        .update({ status: 'scored', updated_at: new Date().toISOString() })
        .eq('id', application_id);

      return NextResponse.json({
        success: true,
        message: 'Report already exists — status updated',
        score: existingReport.total_score,
      });
    }

    // 3. Find the simulation
    const { data: sim } = await supabase
      .from('simulations')
      .select('id')
      .eq('application_id', application_id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (!sim) {
      return NextResponse.json({ error: 'No simulation found' }, { status: 404 });
    }

    // 4. Run evaluation directly — bypasses Inngest entirely
    console.log(`[EVAL-RETRY] Running direct eval for app=${application_id}, sim=${sim.id}`);

    const result = await runEvaluationPipeline(application_id, sim.id);

    auditLog('admin.action', {
      action: 'self_healing_eval_retry',
      email: normalizedEmail,
      application_id,
      simulation_id: sim.id,
      eval_success: result.success,
    }, request);

    if (!result.success) {
      // Mark as eval_failed so dashboard shows appropriate state
      await supabase
        .from('applications')
        .update({ status: 'eval_failed', updated_at: new Date().toISOString() })
        .eq('id', application_id);

      return NextResponse.json({
        error: 'Evaluation failed',
        details: result.error,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Evaluation completed successfully',
    });
  } catch (err) {
    console.error('[EVAL-RETRY] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
