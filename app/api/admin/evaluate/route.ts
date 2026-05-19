import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildEvaluationPrompt } from '@/lib/evaluation/prompt';
import { getCaseByCode, resolveRoleTrack } from '@/lib/cases';
import type { ClaudeEvaluationResult } from '@/lib/evaluation/types';
import { verifyInternalAuth, applyRateLimit, auditLog } from '@/lib/security';

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

    const supabase = createAdminClient();

    // 1. Fetch simulation content
    const { data: sim, error: simErr } = await supabase
      .from('simulations')
      .select('id, application_id, case_code, content, word_count, time_taken_seconds, started_at, submitted_at, tab_violations, paste_count, large_paste_count, typing_bursts, integrity_score')
      .eq('id', simulation_id)
      .single();

    if (simErr || !sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // 2. Fetch application for target_role
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('id, full_name, email, target_role, status, report_token')
      .eq('id', application_id)
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Resolve the case
    const caseCode = sim.case_code || 'IB-001';
    const dealCase = getCaseByCode(caseCode);
    const roleTrack = resolveRoleTrack(app.target_role);

    // 4. Build the prompt
    const prompt = buildEvaluationPrompt({
      case_code: caseCode,
      role_track: roleTrack,
      case_title: dealCase?.title || 'Unknown Case',
      admin_strong: dealCase?.admin_only?.strong_response || 'N/A',
      admin_critical_gap: dealCase?.admin_only?.critical_gap || 'N/A',
      non_obvious: dealCase?.admin_only?.non_obvious_signal || 'N/A',
      candidate_response: sim.content,
    });

    // 5. Call Gemini 2.5 Flash — temperature 0.1 for scoring consistency
    // Low temperature ensures the same response gets near-identical scores across runs
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 6. Parse response — extract JSON from code blocks or raw text
    let evaluation: ClaudeEvaluationResult;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

    try {
      evaluation = JSON.parse(jsonStr);
    } catch {
      console.error('Gemini response parse error. Raw:', responseText.slice(0, 500));
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 502 });
    }

    // 7. Insert into fiss_reports
    const { data: report, error: insertErr } = await supabase
      .from('fiss_reports')
      .insert({
        application_id,
        simulation_id,
        total_score: evaluation.fiss_score,
        percentile: `Founding Cohort — ${roleTrack} Track`,
        financial_reasoning: {
          score: evaluation.fr_score,
          grade: evaluation.fr_grade,
          rationale: evaluation.fr_rationale,
          evidence: evaluation.fr_evidence,
          improvement: evaluation.fr_improvement,
        },
        structured_thinking: {
          score: evaluation.st_score,
          grade: evaluation.st_grade,
          rationale: evaluation.st_rationale,
          evidence: evaluation.st_evidence,
          improvement: evaluation.st_improvement,
        },
        risk_identification: {
          score: evaluation.ri_score,
          grade: evaluation.ri_grade,
          rationale: evaluation.ri_rationale,
          evidence: evaluation.ri_evidence,
          improvement: evaluation.ri_improvement,
        },
        decision_clarity: {
          score: evaluation.dc_score,
          grade: evaluation.dc_grade,
          rationale: evaluation.dc_rationale,
          evidence: evaluation.dc_evidence,
          improvement: evaluation.dc_improvement,
        },
        standout_strength: evaluation.standout_strength,
        critical_gap: evaluation.critical_gap,
        evaluator_summary: evaluation.one_line_summary,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('FISS report insert error:', insertErr);
      return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 });
    }

    // 8. Generate public share_id for /score/[id] page
    let shareId = '';
    try {
      const { generateShareId, addCollisionSuffix } = await import('@/lib/share');
      shareId = generateShareId(app.full_name, evaluation.fiss_score, app.target_role);
      
      // Check collision
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('share_id', shareId)
        .maybeSingle();
      
      if (existing) {
        shareId = addCollisionSuffix(shareId);
      }

      await supabase
        .from('applications')
        .update({ status: 'scored', share_id: shareId, updated_at: new Date().toISOString() })
        .eq('id', application_id);
    } catch (shareErr) {
      console.error('Share ID generation failed (non-blocking):', shareErr);
      // Fallback: just update status without share_id
      await supabase
        .from('applications')
        .update({ status: 'scored', updated_at: new Date().toISOString() })
        .eq('id', application_id);
    }

    // 9. Auto-email FISS report to candidate (non-blocking)
    try {
      const { sendReportEmail } = await import('@/lib/email');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finapply-ai-delta.vercel.app';
      await sendReportEmail({
        full_name: app.full_name,
        email: app.email,
        fiss_score: evaluation.fiss_score,
        percentile: 'Founding Cohort',
        role_track: roleTrack,
        fr_score: evaluation.fr_score,
        fr_grade: evaluation.fr_grade,
        st_score: evaluation.st_score,
        st_grade: evaluation.st_grade,
        ri_score: evaluation.ri_score,
        ri_grade: evaluation.ri_grade,
        dc_score: evaluation.dc_score,
        dc_grade: evaluation.dc_grade,
        one_liner: evaluation.one_line_summary,
        report_url: `${appUrl}/report/${app.report_token}`,
        share_url: shareId ? `${appUrl}/score/${shareId}` : undefined,
      });

      // Update status to report_sent since email was successful
      await supabase
        .from('applications')
        .update({ status: 'report_sent', updated_at: new Date().toISOString() })
        .eq('id', application_id);
    } catch (emailErr) {
      console.error('Auto-email failed (non-blocking):', emailErr);
      // Scoring succeeded; email failure is non-critical
    }

    return NextResponse.json({
      success: true,
      data: report,
      ai_flags: {
        ai_generated: evaluation.ai_generated_flag,
        ai_flag_reason: evaluation.ai_flag_reason,
        non_obvious_found: evaluation.non_obvious_signal_found,
        non_obvious_note: evaluation.non_obvious_signal_note,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Evaluate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
