import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, auditLog } from '@/lib/security';
import { inngest } from '@/lib/inngest/client';

/* POST /api/simulations — Submit deal room work + dispatch async evaluation */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per 5 minutes per IP
    const limited = applyRateLimit(request, 'ai');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/simulations' }, request);
      return limited;
    }

    const body = await request.json();
    const {
      application_id, deal_room_token, case_code, content, word_count,
      time_taken_seconds, started_at, tab_violations, violation_log,
      paste_count, large_paste_count, typing_bursts,
    } = body;

    if (!application_id || !content || !deal_room_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // ══════════════════════════════════════════════
    // OWNERSHIP CHECK — verify deal_room_token matches application_id
    // Prevents IDOR: attacker cannot submit for another user's application
    // ══════════════════════════════════════════════
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('id', application_id)
      .eq('deal_room_token', deal_room_token)
      .single();

    if (appError || !app) {
      auditLog('api.suspicious', {
        endpoint: '/api/simulations',
        reason: 'IDOR attempt — token/id mismatch',
        application_id,
      }, request);
      return NextResponse.json({ error: 'Invalid submission credentials' }, { status: 403 });
    }

    // Prevent double submissions
    if (app.status === 'submitted' || app.status === 'scored' || app.status === 'report_sent') {
      return NextResponse.json({ error: 'Simulation already submitted' }, { status: 409 });
    }

    // Sanitize content (allow longer text for essay responses)
    const sanitizedContent = sanitizeString(content, 50_000);
    if (!sanitizedContent || sanitizedContent.length < 10) {
      return NextResponse.json({ error: 'Submission content is too short' }, { status: 400 });
    }

    // Compute integrity score (100 = clean, lower = more suspicious)
    const tabPenalty = Math.min(Number(tab_violations) || 0, 10) * 10;
    const pastePenalty = Math.min(Number(large_paste_count) || 0, 10) * 12;
    const burstPenalty = Math.min(Number(typing_bursts) || 0, 10) * 8;
    const integrityScore = Math.max(0, 100 - tabPenalty - pastePenalty - burstPenalty);

    // 1. Insert simulation
    const { data: sim, error: simError } = await supabase
      .from('simulations')
      .insert({
        application_id,
        case_code: sanitizeString(case_code, 20) || null,
        content: sanitizedContent,
        word_count: Math.min(Math.max(0, Number(word_count) || 0), 100_000),
        time_taken_seconds: Math.min(Math.max(0, Number(time_taken_seconds) || 0), 86_400),
        started_at: started_at || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        tab_violations: Math.min(Math.max(0, Number(tab_violations) || 0), 10_000),
        violation_log: violation_log ? sanitizeString(JSON.stringify(violation_log), 10_000) : null,
        paste_count: Math.min(Math.max(0, Number(paste_count) || 0), 10_000),
        large_paste_count: Math.min(Math.max(0, Number(large_paste_count) || 0), 10_000),
        typing_bursts: Math.min(Math.max(0, Number(typing_bursts) || 0), 10_000),
        integrity_score: integrityScore,
      })
      .select()
      .single();

    if (simError) {
      console.error('Simulation insert error:', simError.message);
      return NextResponse.json({ error: 'Failed to save simulation' }, { status: 500 });
    }

    // 2. Update application status to submitted
    await supabase
      .from('applications')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    // 3. Dispatch evaluation via Inngest (async, step-based)
    // Each step runs in its own serverless invocation, so no 10s timeout issues.
    // Report will be ready in ~1-3 minutes and emailed to the candidate.
    try {
      await inngest.send({
        name: 'app/submission.completed',
        data: { application_id, simulation_id: sim.id },
      });
      console.log(`[SUBMIT] Evaluation dispatched via Inngest for app=${application_id}`);
    } catch (inngestErr) {
      console.error('[SUBMIT] Inngest dispatch failed:', inngestErr);
      // Mark as eval_failed so user/admin can retry
      await supabase
        .from('applications')
        .update({ status: 'eval_failed', updated_at: new Date().toISOString() })
        .eq('id', application_id);
    }

    auditLog('admin.action', {
      action: 'simulation_submitted',
      application_id,
      simulation_id: sim.id,
    }, request);

    return NextResponse.json({ success: true, data: { id: sim.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
