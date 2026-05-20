import { inngest } from './client';
import { runEvaluationPipeline } from '@/lib/evaluation/engine';
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

    console.log(`[INNGEST] Evaluating app=${application_id}, sim=${simulation_id}`);

    // Use the shared evaluation engine directly — no HTTP roundtrip needed
    const result = await runEvaluationPipeline(application_id, simulation_id);

    if (!result.success) {
      console.error(`[INNGEST] Evaluation failed: ${result.error}`);

      // Mark as eval_failed for permanent/non-retryable errors
      if (result.error === 'Simulation not found' || result.error === 'Application not found') {
        await markEvalFailed(application_id);
        return { success: false, reason: result.error };
      }

      // Throw to trigger Inngest retry for transient errors (AI failure, DB timeout, etc.)
      throw new Error(`Evaluation failed: ${result.error}`);
    }

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
