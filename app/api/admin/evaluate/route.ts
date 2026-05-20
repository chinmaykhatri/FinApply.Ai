import { NextResponse, NextRequest } from 'next/server';
import { verifyInternalAuth, applyRateLimit, auditLog } from '@/lib/security';
import { runEvaluationPipeline } from '@/lib/evaluation/engine';

// Allow up to 60s for AI evaluation pipeline (Gemini + PDF + email)
export const maxDuration = 60;

/* POST /api/admin/evaluate — AI-evaluate a candidate's submission */
export async function POST(request: NextRequest) {
  try {
    // Allow internal server-to-server calls (from /api/simulations auto-trigger)
    // Middleware handles admin browser sessions; this handles programmatic access
    const isInternalCall = verifyInternalAuth(request);
    
    console.log(`[EVALUATE] Endpoint hit. Internal auth: ${isInternalCall}`);
    
    if (!isInternalCall) {
      // If not internal, middleware will have already validated admin session
      // But add rate limiting for safety
      const limited = applyRateLimit(request, 'ai');
      if (limited) {
        auditLog('api.rate_limited', { endpoint: '/api/admin/evaluate' }, request);
        return limited;
      }
    }

    const { application_id, simulation_id } = await request.json();

    if (!application_id || !simulation_id) {
      console.error('[EVALUATE] Missing IDs:', { application_id, simulation_id });
      return NextResponse.json({ error: 'Missing application_id or simulation_id' }, { status: 400 });
    }
    
    console.log(`[EVALUATE] Processing: app=${application_id}, sim=${simulation_id}`);

    // Run the shared evaluation pipeline (Gemini → DB → email)
    const result = await runEvaluationPipeline(application_id, simulation_id);

    if (!result.success) {
      console.error(`[EVALUATE] Pipeline failed: ${result.error}`);
      return NextResponse.json({ error: result.error || 'Evaluation failed' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      data: result.report,
      ai_flags: result.ai_flags,
    }, { status: 201 });
  } catch (err) {
    console.error('Evaluate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
