import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildEvaluationPrompt } from '@/lib/evaluation/prompt';
import { getCaseByCode, resolveRoleTrack } from '@/lib/cases';
import type { ClaudeEvaluationResult } from '@/lib/evaluation/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* POST /api/admin/evaluate — AI-evaluate a candidate's submission */
export async function POST(request: NextRequest) {
  try {
    const { application_id, simulation_id } = await request.json();

    if (!application_id || !simulation_id) {
      return NextResponse.json({ error: 'Missing application_id or simulation_id' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch simulation content
    const { data: sim, error: simErr } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', simulation_id)
      .single();

    if (simErr || !sim) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // 2. Fetch application for target_role
    const { data: app, error: appErr } = await supabase
      .from('applications')
      .select('*')
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

    // 5. Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    // 6. Parse response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    let evaluation: ClaudeEvaluationResult;
    try {
      evaluation = JSON.parse(responseText);
    } catch {
      console.error('Claude response parse error. Raw:', responseText.slice(0, 500));
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

    // 8. Update application status to scored
    await supabase
      .from('applications')
      .update({ status: 'scored', updated_at: new Date().toISOString() })
      .eq('id', application_id);

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
