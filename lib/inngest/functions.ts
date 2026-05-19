import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';

/* ══════════════════════════════════════════════
   EVALUATE SUBMISSION — Inngest Function
   
   Replaces the fire-and-forget IIFE in /api/simulations.
   Inngest provides:
     • Automatic retries with exponential backoff
     • Dead-letter queue for exhausted retries
     • Observable runs in the Inngest dashboard
     • No serverless timeout issues (runs in its own invocation)
   ══════════════════════════════════════════════ */

export const evaluateSubmission = inngest.createFunction(
  {
    id: 'evaluate-submission',
    retries: 3,
    triggers: [{ event: 'app/submission.completed' }],
  },
  async ({ event }) => {
    const { application_id, simulation_id } = event.data;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
    const internalSecret = process.env.ADMIN_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!internalSecret) {
      throw new Error('[EVAL] Neither ADMIN_API_SECRET nor SUPABASE_SERVICE_ROLE_KEY is set.');
    }

    console.log(`[INNGEST] Evaluating app=${application_id}, sim=${simulation_id}`);

    const evalRes = await fetch(`${baseUrl}/api/admin/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': internalSecret,
      },
      body: JSON.stringify({ application_id, simulation_id }),
    });

    if (!evalRes.ok) {
      const errBody = await evalRes.text().catch(() => 'no body');

      // Don't retry on auth errors — they won't resolve themselves
      if (evalRes.status === 401 || evalRes.status === 403 || evalRes.status === 404) {
        console.error(`[INNGEST] Auth failure (${evalRes.status}). Marking eval_failed.`);
        await markEvalFailed(application_id);
        // Return instead of throw to prevent retry on permanent failures
        return { success: false, reason: `Auth failure: ${evalRes.status}` };
      }

      // Throw to trigger Inngest retry for transient errors
      throw new Error(
        `Evaluation failed: HTTP ${evalRes.status} — ${errBody.slice(0, 300)}`
      );
    }

    const result = await evalRes.json();
    console.log(`[INNGEST] Evaluation succeeded for app=${application_id}`);
    return { success: true, data: result };
  }
);

/**
 * Mark application as eval_failed when all retries are exhausted.
 */
async function markEvalFailed(applicationId: string) {
  try {
    const supabase = createAdminClient();
    await supabase
      .from('applications')
      .update({ status: 'eval_failed', updated_at: new Date().toISOString() })
      .eq('id', applicationId);
  } catch (err) {
    console.error('[INNGEST] Could not update status to eval_failed:', err);
  }
}
