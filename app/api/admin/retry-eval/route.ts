import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyInternalAuth, auditLog } from '@/lib/security';
import { runEvaluationPipeline } from '@/lib/evaluation/engine';

// Allow up to 60s for AI evaluation pipeline
export const maxDuration = 60;

/* ══════════════════════════════════════════════
   POST /api/admin/retry-eval
   
   Manually retry evaluation for a stuck submission.
   Finds the latest simulation for the given email
   and triggers evaluation directly via the shared engine.

   Auth: x-internal-secret header required.
   Body: { email: string }
   ══════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  // Auth: require internal secret (same as evaluate endpoint)
  if (!verifyInternalAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Find the application
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('id, full_name, email, status')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: `No application found for ${email}` }, { status: 404 });
    }

    // 2. Find the latest simulation for this application
    const { data: sim, error: simErr } = await supabase
      .from('simulations')
      .select('id, case_code, word_count')
      .eq('application_id', app.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (simErr || !sim) {
      return NextResponse.json({
        error: `No simulation found for application ${app.id}`,
        application: { id: app.id, status: app.status },
      }, { status: 404 });
    }

    // 3. Check if already evaluated
    const { data: existingReport } = await supabase
      .from('fiss_reports')
      .select('id, total_score')
      .eq('application_id', app.id)
      .maybeSingle();

    if (existingReport) {
      return NextResponse.json({
        message: 'Already evaluated',
        application_id: app.id,
        simulation_id: sim.id,
        score: existingReport.total_score,
      });
    }

    // 4. Run evaluation directly via shared engine — no HTTP roundtrip
    console.log(`[RETRY-EVAL] Running eval for app=${app.id}, sim=${sim.id}, email=${email}`);

    const result = await runEvaluationPipeline(app.id, sim.id);

    auditLog('admin.action', {
      action: 'manual_retry_eval',
      email,
      application_id: app.id,
      simulation_id: sim.id,
      eval_success: result.success,
    }, request);

    if (!result.success) {
      return NextResponse.json({
        error: 'Evaluation failed',
        details: result.error,
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `Evaluation completed for ${app.full_name}`,
      data: result,
    });
  } catch (err) {
    console.error('[RETRY-EVAL] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
