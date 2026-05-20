/* ═══════════════════════════════════════════════
   AI Evaluation Types — FinApply.ai
   Gemini-powered FISS scoring pipeline
   ═══════════════════════════════════════════════ */

/** Raw JSON response from Gemini evaluation */
export interface GeminiEvaluationResult {
  fr_score: number;
  st_score: number;
  ri_score: number;
  dc_score: number;
  fiss_score: number;

  fr_grade: string;
  st_grade: string;
  ri_grade: string;
  dc_grade: string;

  fr_rationale: string;
  st_rationale: string;
  ri_rationale: string;
  dc_rationale: string;

  fr_evidence: string;
  st_evidence: string;
  ri_evidence: string;
  dc_evidence: string;

  fr_improvement: string;
  st_improvement: string;
  ri_improvement: string;
  dc_improvement: string;

  standout_strength: string;
  critical_gap: string;
  one_line_summary: string;

  non_obvious_signal_found: boolean;
  non_obvious_signal_note: string;

  ai_generated_flag: boolean;
  ai_flag_reason: string | null;

  employer_summary: string;
  word_count_assessment: string;
  time_efficiency_note: string;
}

/** @deprecated Use GeminiEvaluationResult — alias kept for backward compatibility */
export type ClaudeEvaluationResult = GeminiEvaluationResult;

/** Input required to build the evaluation prompt */
export interface EvaluationInput {
  case_code: string;
  role_track: string;
  case_title: string;
  admin_strong: string;
  admin_critical_gap: string;
  non_obvious: string;
  candidate_response: string;
}

/** Role-specific weight calibration text */
export const ROLE_WEIGHT_MAP: Record<string, string> = {
  IB: 'Financial Reasoning is the primary signal. Decision Clarity is secondary.',
  PE: 'Decision Clarity is the primary signal. Risk Identification is secondary.',
  B4: 'Structured Thinking is the primary signal. Financial Reasoning is secondary.',
  CF: 'Financial Reasoning is primary. Structured Thinking is secondary.',
  ER: 'Risk Identification is primary. Decision Clarity is secondary.',
};
