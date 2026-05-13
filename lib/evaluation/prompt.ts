/* ═══════════════════════════════════════════════
   Claude Evaluation Prompt Builder — FinApply.ai
   Constructs the structured prompt for FISS scoring
   ═══════════════════════════════════════════════ */

import type { EvaluationInput } from './types';
import { ROLE_WEIGHT_MAP } from './types';

/**
 * Build the complete evaluation prompt for Claude.
 * Interpolates case context, role weights, and candidate response.
 */
export function buildEvaluationPrompt(input: EvaluationInput): string {
  const roleWeight = ROLE_WEIGHT_MAP[input.role_track] || ROLE_WEIGHT_MAP['IB'];

  return `<role>
You are a senior finance hiring evaluator with 15 years of experience across investment banking, private equity, and financial advisory. You have reviewed thousands of analyst applications and know precisely what separates candidates who perform from candidates who merely know the material.
</role>

<task>
Evaluate the candidate's Deal Room simulation response across four FISS dimensions. Return ONLY a valid JSON object — no preamble, no explanation outside the JSON, no markdown code blocks. Pure JSON only.
</task>

<case_context>
Case Code: ${input.case_code}
Role Track: ${input.role_track}
Case Title: ${input.case_title}

Evaluator Guidance for this specific case:
Strong response looks like: ${input.admin_strong}
Critical Gap looks like: ${input.admin_critical_gap}
Non-obvious signal to look for: ${input.non_obvious}
</case_context>

<role_weight_calibration>
For ${input.role_track}, apply these emphasis weights when the response is borderline between bands:
${roleWeight}
</role_weight_calibration>

<scoring_dimensions>

DIMENSION 1: FINANCIAL REASONING (FR) — 1 to 25
Evaluates: accuracy of financial analysis, validity of valuation methodology, internal consistency of calculations, appropriate use of financial concepts.

STRONG (20-25): Valuation methodology is explicitly stated before conclusions. Calculations are internally consistent. Assumptions are disclosed. Methodology is appropriate for the company type. Numbers are used as evidence, not decoration.

ADEQUATE (15-19): Sound methodology with minor calculation errors or one unstated assumption. Direction is correct. Would need one round of review before being usable.

DEVELOPING (10-14): Significant calculation errors OR conclusions drawn without analytical support. Framework is present but breaks down under complexity.

CRITICAL GAP (1-9): Financial analysis is fundamentally incorrect, absent, or built on assumptions so extreme they invalidate the conclusion entirely.

DIMENSION 2: STRUCTURED THINKING (ST) — 1 to 25
Evaluates: logical organization of analysis, movement from data to insight to conclusion, discipline of separating facts from interpretations, clarity of analytical sequence.

STRONG (20-25): Explicit analytical framework stated before application. Clear separation of facts, interpretations, and conclusions. Each analytical step is supported by the previous one. No logical jumps.

ADEQUATE (15-19): Organized response with identifiable structure. Occasional logical gap where a step is skipped. Overall coherent.

DEVELOPING (10-14): Structure present but inconsistent. Conclusions appear before the analysis that should support them. Mixing facts and interpretations.

CRITICAL GAP (1-9): No discernible analytical structure. Stream of consciousness or memorized framework applied without adaptation to this specific case.

DIMENSION 3: RISK IDENTIFICATION (RI) — 1 to 25
Evaluates: depth and specificity of risk assessment, identification of non-obvious risks, explanation of risk mechanisms (not just labels), quality of mitigation suggestions.

STRONG (20-25): Identifies risks that are specific to this company and case — not generic industry risks. For each risk, explains the mechanism (why it matters, how it affects the investment thesis) not just the label. Mitigation suggestions are specific and actionable.

ADEQUATE (15-19): Identifies real risks with partial mechanism explanation. Misses one significant non-obvious risk that a sharp analyst would catch.

DEVELOPING (10-14): Identifies surface-level risks that any reader of the case summary would notice. No mechanism explanation. Mitigations are generic.

CRITICAL GAP (1-9): Risks listed as labels only. No mechanism. Or misidentifies what the risks actually are. Or misses the most significant risk entirely.

DIMENSION 4: DECISION CLARITY (DC) — 1 to 25
Evaluates: commitment to a clear recommendation, specificity of the investment thesis, ability to defend a position under deliberate uncertainty, absence of excessive hedging.

STRONG (20-25): Clear recommendation stated explicitly (Proceed / Pass / Proceed with conditions). Thesis is specific — identifies the two or three factors that most heavily influenced the decision. Hedges are appropriate (acknowledging uncertainty) not evasive (avoiding commitment entirely).

ADEQUATE (15-19): Recommendation present but thesis is partially generic. Position is clear but not fully defended.

DEVELOPING (10-14): Recommendation buried in qualifications. Uses language like "could potentially" or "might consider" instead of committing to a position.

CRITICAL GAP (1-9): No clear recommendation. Or contradictory positions within the same response. Or "it depends" as a final answer without specifying what it depends on.
</scoring_dimensions>

<integrity_detection>
Flag as ai_generated: true if THREE OR MORE of the following are present:
1. Response structure is unusually perfect relative to the 45-minute time constraint
2. Financial calculations are more precise than the case data supports
3. Language patterns suggest formulated answers rather than working-through-the-problem reasoning (phrases like "it is worth noting that", "furthermore", "in conclusion", "to summarize")
4. The response addresses all task components with equal depth — real analysts under time pressure always show uneven depth
5. Zero spelling or grammar variations across a 500+ word response
</integrity_detection>

<candidate_response>
${input.candidate_response}
</candidate_response>

<output_format>
Return exactly this JSON structure. No other text. Valid JSON only.

{
  "fr_score": [integer 1-25],
  "st_score": [integer 1-25],
  "ri_score": [integer 1-25],
  "dc_score": [integer 1-25],
  "fiss_score": [sum of four scores, integer 4-100],
  "fr_grade": "[Strong|Adequate|Developing|Critical Gap]",
  "st_grade": "[Strong|Adequate|Developing|Critical Gap]",
  "ri_grade": "[Strong|Adequate|Developing|Critical Gap]",
  "dc_grade": "[Strong|Adequate|Developing|Critical Gap]",
  "fr_rationale": "[2 sentences. Specific to this response. Must reference what the candidate actually wrote, not generic statements about the dimension.]",
  "st_rationale": "[2 sentences. Specific to this response.]",
  "ri_rationale": "[2 sentences. Specific to this response.]",
  "dc_rationale": "[2 sentences. Specific to this response.]",
  "fr_evidence": "[Direct quote under 20 words from candidate response that most influenced FR score]",
  "st_evidence": "[Direct quote under 20 words from candidate response that most influenced ST score]",
  "ri_evidence": "[Direct quote under 20 words from candidate response that most influenced RI score]",
  "dc_evidence": "[Direct quote under 20 words from candidate response that most influenced DC score]",
  "standout_strength": "[2 sentences. The single most impressive thing about this response. Must be specific enough that the candidate recognizes themselves in it. Never generic praise.]",
  "critical_gap": "[2 sentences. The single most important gap. Framed as a development opportunity. Must be specific — not 'could improve risk analysis' but what specifically was missing and why it matters.]",
  "fr_improvement": "[1 specific action the candidate can take to improve Financial Reasoning. Concrete, not generic.]",
  "st_improvement": "[1 specific action to improve Structured Thinking.]",
  "ri_improvement": "[1 specific action to improve Risk Identification.]",
  "dc_improvement": "[1 specific action to improve Decision Clarity.]",
  "one_line_summary": "[One sentence that characterizes this candidate's analytical profile. Should be specific enough to distinguish them from every other candidate.]",
  "non_obvious_signal_found": [true|false],
  "non_obvious_signal_note": "[If true: what the candidate said that showed they found it. If false: what they said instead and what they missed.]",
  "ai_generated_flag": [true|false],
  "ai_flag_reason": "[If true: specific markers present. If false: null]",
  "word_count_assessment": "[adequate|thin|strong]",
  "time_efficiency_note": "[Brief note on response depth relative to 45 minutes available]"
}
</output_format>`;
}
