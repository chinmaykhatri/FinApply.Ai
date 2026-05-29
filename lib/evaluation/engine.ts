/* ═══════════════════════════════════════════════
   Evaluation Engine — FinApply.ai
   
   Self-contained module that runs the full evaluation pipeline:
   1. Fetch simulation + application from DB
   2. Call Gemini for FISS scoring
   3. Insert report into fiss_reports
   4. Generate share_id + update application status
   5. Send report email with PDF attachment
   
   Designed to be called DIRECTLY (inline) from the submission
   route, eliminating fire-and-forget reliability issues.
   ═══════════════════════════════════════════════ */

import { createAdminClient } from '@/lib/supabase/admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildEvaluationPrompt } from '@/lib/evaluation/prompt';
import { getCaseByCode, resolveRoleTrack } from '@/lib/cases';
import type { ClaudeEvaluationResult } from '@/lib/evaluation/types';

export interface EvalResult {
  success: boolean;
  error?: string;
  report?: Record<string, unknown>;
  ai_flags?: {
    ai_generated: boolean;
    ai_flag_reason: string | null;
    non_obvious_found: boolean;
    non_obvious_note: string;
  };
}

/**
 * Run the full evaluation pipeline for a submitted simulation.
 * Returns the result synchronously — caller should handle errors.
 */
export async function runEvaluationPipeline(
  application_id: string,
  simulation_id: string
): Promise<EvalResult> {
  const supabase = createAdminClient();

  // 1. Fetch simulation content
  const { data: sim, error: simErr } = await supabase
    .from('simulations')
    .select('id, application_id, case_code, case_instance_id, case_variables, content, word_count, time_taken_seconds, started_at, submitted_at, tab_violations, paste_count, large_paste_count, typing_bursts, integrity_score')
    .eq('id', simulation_id)
    .single();

  if (simErr || !sim) {
    return { success: false, error: 'Simulation not found' };
  }

  // 2. Fetch application for target_role
  const { data: app, error: appErr } = await supabase
    .from('applications')
    .select('id, full_name, email, target_role, status, report_token')
    .eq('id', application_id)
    .single();

  if (appErr || !app) {
    return { success: false, error: 'Application not found' };
  }

  // 3. Resolve the case
  const caseCode = sim.case_code || 'IB-001';
  const dealCase = getCaseByCode(caseCode);
  const roleTrack = resolveRoleTrack(app.target_role);

  // 4. Build the prompt (include instance variables if candidate got a dynamic case)
  const caseVars = sim.case_variables as Record<string, number> | null;
  const prompt = buildEvaluationPrompt({
    case_code: caseCode,
    role_track: roleTrack,
    case_title: dealCase?.title || 'Unknown Case',
    admin_strong: dealCase?.admin_only?.strong_response || 'N/A',
    admin_critical_gap: dealCase?.admin_only?.critical_gap || 'N/A',
    non_obvious: dealCase?.admin_only?.non_obvious_signal || 'N/A',
    candidate_response: sim.content,
    case_variables: caseVars || undefined,
  });

  // 5. Call Gemini 2.5 Flash — temperature 0.1 for scoring consistency
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
    console.error('[EVAL ENGINE] Gemini response parse error. Raw:', responseText.slice(0, 500));
    return { success: false, error: 'AI returned invalid JSON' };
  }

  // Sanitize evidence quotes — strip formatting artifacts that break PDF rendering
  const sanitizeEvidence = (raw: string): string => {
    if (!raw) return '';
    return raw
      .replace(/[\u2018\u2019]/g, "'")   // smart quotes
      .replace(/[\u201C\u201D]/g, '"')   // smart double quotes
      .replace(/[\u2013\u2014]/g, '-')   // em/en dashes
      .replace(/[\u2026]/g, '...')       // ellipsis
      .replace(/[\u00B7\u2022\u25CF]/g, '-') // bullet chars
      .replace(/[^\x20-\x7E]/g, '')     // strip any remaining non-ASCII
      .replace(/\s+/g, ' ')             // collapse whitespace
      .trim();
  };
  evaluation.fr_evidence = sanitizeEvidence(evaluation.fr_evidence);
  evaluation.st_evidence = sanitizeEvidence(evaluation.st_evidence);
  evaluation.ri_evidence = sanitizeEvidence(evaluation.ri_evidence);
  evaluation.dc_evidence = sanitizeEvidence(evaluation.dc_evidence);

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
      employer_summary: evaluation.employer_summary || null,
      confidence_level: evaluation.confidence_level || 'HIGH',
      confidence_reason: evaluation.confidence_reason || null,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[EVAL ENGINE] FISS report insert error:', insertErr);
    return { success: false, error: 'Failed to save evaluation' };
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
    console.error('[EVAL ENGINE] Share ID generation failed (non-blocking):', shareErr);
    // Fallback: just update status without share_id
    await supabase
      .from('applications')
      .update({ status: 'scored', updated_at: new Date().toISOString() })
      .eq('id', application_id);
  }

  // 9. Auto-email FISS report to candidate with full PDF attachment
  try {
    const { sendReportEmail } = await import('@/lib/email');
    const { generateFissReportBuffer } = await import('@/lib/generatePdfBuffer');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin-apply-ai.vercel.app';

    // Fetch candidate's college for PDF
    const { data: appFull } = await supabase
      .from('applications')
      .select('college_or_firm')
      .eq('id', application_id)
      .single();

    // Generate full PDF with all dimension data for email attachment
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = generateFissReportBuffer({
        candidateName: app.full_name,
        candidateCollege: appFull?.college_or_firm || '',
        shareId: shareId || undefined,
        report: {
          total_score: evaluation.fiss_score,
          percentile: `Founding Cohort — ${roleTrack} Track`,
          financial_reasoning: {
            score: evaluation.fr_score, grade: evaluation.fr_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
            rationale: evaluation.fr_rationale, evidence: evaluation.fr_evidence, improvement: evaluation.fr_improvement,
          },
          structured_thinking: {
            score: evaluation.st_score, grade: evaluation.st_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
            rationale: evaluation.st_rationale, evidence: evaluation.st_evidence, improvement: evaluation.st_improvement,
          },
          risk_identification: {
            score: evaluation.ri_score, grade: evaluation.ri_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
            rationale: evaluation.ri_rationale, evidence: evaluation.ri_evidence, improvement: evaluation.ri_improvement,
          },
          decision_clarity: {
            score: evaluation.dc_score, grade: evaluation.dc_grade as 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap',
            rationale: evaluation.dc_rationale, evidence: evaluation.dc_evidence, improvement: evaluation.dc_improvement,
          },
          standout_strength: evaluation.standout_strength,
          critical_gap: evaluation.critical_gap,
          evaluator_summary: evaluation.one_line_summary,
          employer_summary: evaluation.employer_summary || undefined,
          confidence_level: evaluation.confidence_level || 'HIGH',
        },
      });
    } catch (pdfErr) {
      console.error('[EVAL ENGINE] PDF generation failed (non-blocking):', pdfErr);
    }

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
      pdf_download_url: `${appUrl}/api/report/${app.report_token}/pdf`,
      dashboard_url: `${appUrl}/my-score?token=${app.report_token}`,
      share_url: shareId ? `${appUrl}/score/${shareId}` : undefined,
      candidateCollege: appFull?.college_or_firm || '',
      pdfBuffer,
    });

    // Update status to report_sent since email was successful
    await supabase
      .from('applications')
      .update({ status: 'report_sent', updated_at: new Date().toISOString() })
      .eq('id', application_id);

    console.log(`[EVAL ENGINE] Report sent to ${app.email} for app=${application_id}`);
  } catch (emailErr) {
    console.error('[EVAL ENGINE] Auto-email failed (non-blocking):', emailErr);
    // Scoring succeeded; email failure is non-critical
  }

  return {
    success: true,
    report: report as unknown as Record<string, unknown>,
    ai_flags: {
      ai_generated: evaluation.ai_generated_flag,
      ai_flag_reason: evaluation.ai_flag_reason,
      non_obvious_found: evaluation.non_obvious_signal_found,
      non_obvious_note: evaluation.non_obvious_signal_note,
    },
  };
}
