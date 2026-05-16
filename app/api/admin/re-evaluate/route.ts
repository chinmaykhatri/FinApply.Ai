import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyInternalAuth, applyRateLimit, auditLog } from '@/lib/security';

/**
 * POST /api/admin/re-evaluate
 * Re-triggers evaluation for stuck submissions.
 * 
 * Body options:
 *   { application_id }         — Re-evaluate a single application
 *   { batch: true }            — Re-evaluate ALL stuck applications (status = submitted | eval_failed)
 * 
 * Requires admin session or internal auth.
 */
export async function POST(request: NextRequest) {
  try {
    const isInternalCall = verifyInternalAuth(request);
    if (!isInternalCall) {
      const limited = applyRateLimit(request, 'ai');
      if (limited) return limited;
    }

    const body = await request.json();
    const { application_id, batch } = body;

    const supabase = createAdminClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
    const internalSecret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!internalSecret) {
      return NextResponse.json(
        { error: 'ADMIN_API_SECRET not configured. Cannot trigger evaluation.' },
        { status: 500 }
      );
    }

    // Determine which applications to re-evaluate
    let query = supabase
      .from('applications')
      .select('id, email, full_name, status')
      .in('status', ['submitted', 'eval_failed']);

    if (!batch && application_id) {
      query = query.eq('id', application_id);
    }

    const { data: stuckApps, error: fetchErr } = await query;

    if (fetchErr) {
      console.error('[RE-EVAL] Failed to fetch applications:', fetchErr);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    if (!stuckApps || stuckApps.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stuck applications found.',
        retriggered: 0,
      });
    }

    // For each stuck app, find its simulation and re-trigger evaluation
    const results: { id: string; status: string; error?: string }[] = [];

    for (const app of stuckApps) {
      // Find the latest simulation for this application
      const { data: sim } = await supabase
        .from('simulations')
        .select('id')
        .eq('application_id', app.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (!sim) {
        results.push({ id: app.id, status: 'skipped', error: 'No simulation found' });
        continue;
      }

      // Reset status back to 'submitted' before re-triggering
      await supabase
        .from('applications')
        .update({ status: 'submitted', updated_at: new Date().toISOString() })
        .eq('id', app.id);

      // Fire evaluation call (non-blocking but tracked)
      try {
        const evalRes = await fetch(`${baseUrl}/api/admin/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': internalSecret,
          },
          body: JSON.stringify({
            application_id: app.id,
            simulation_id: sim.id,
          }),
        });

        if (evalRes.ok) {
          results.push({ id: app.id, status: 'triggered' });
        } else {
          const errText = await evalRes.text().catch(() => '');
          results.push({
            id: app.id,
            status: 'failed',
            error: `HTTP ${evalRes.status}: ${errText.slice(0, 200)}`,
          });
        }
      } catch (err) {
        results.push({
          id: app.id,
          status: 'error',
          error: err instanceof Error ? err.message : 'Network error',
        });
      }
    }

    const triggered = results.filter(r => r.status === 'triggered').length;
    const failed = results.filter(r => r.status !== 'triggered').length;

    auditLog('admin.action', {
      action: 're-evaluate',
      batch: !!batch,
      total: stuckApps.length,
      triggered,
      failed,
    }, request);

    console.log(`[RE-EVAL] Triggered: ${triggered}, Failed: ${failed}, Total: ${stuckApps.length}`);

    return NextResponse.json({
      success: true,
      message: `Re-evaluated ${triggered} application(s). ${failed} failed.`,
      retriggered: triggered,
      results,
    });
  } catch (err) {
    console.error('[RE-EVAL] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
