/* ═══════════════════════════════════════════════
   TypeScript Types for FinApply.ai
   ═══════════════════════════════════════════════ */

export type ApplicationStatus =
  | 'applied'
  | 'dealroom_sent'
  | 'submitted'
  | 'scored'
  | 'report_sent'
  | 'rejected';

export interface Application {
  id: string;
  full_name: string;
  email: string;
  college_or_firm: string;
  city: string;
  current_status: string;
  target_role: string;
  essay: string;
  status: ApplicationStatus;
  deal_room_token: string | null;
  report_token: string | null;
  share_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Simulation {
  id: string;
  application_id: string;
  content: string;
  word_count: number;
  time_taken_seconds: number;
  started_at: string;
  submitted_at: string;
}

export interface DimensionScore {
  score: number;
  grade: 'Strong' | 'Adequate' | 'Developing' | 'Critical Gap';
  rationale: string;
  evidence: string;
  improvement: string;
}

export interface FissReport {
  id: string;
  application_id: string;
  simulation_id: string;
  total_score: number;
  percentile: string;
  financial_reasoning: DimensionScore;
  structured_thinking: DimensionScore;
  risk_identification: DimensionScore;
  decision_clarity: DimensionScore;
  standout_strength: string;
  critical_gap: string;
  evaluator_summary: string;
  employer_summary?: string;
  created_at: string;
}

export interface CandidateRow extends Application {
  simulation?: Simulation;
  fiss_report?: FissReport;
}

/* Grade color mapping */
export const GRADE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Strong': {
    bg: 'rgba(22,163,74,0.12)',
    border: 'rgba(22,163,74,0.25)',
    text: '#16A34A',
  },
  'Adequate': {
    bg: 'rgba(215,119,6,0.12)',
    border: 'rgba(215,119,6,0.25)',
    text: '#D97706',
  },
  'Developing': {
    bg: 'rgba(234,88,12,0.12)',
    border: 'rgba(234,88,12,0.25)',
    text: '#EA580C',
  },
  'Critical Gap': {
    bg: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.25)',
    text: '#DC2626',
  },
};

/* Status color mapping */
export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; border: string; text: string }> = {
  applied: {
    bg: 'rgba(37,99,235,0.10)',
    border: 'rgba(37,99,235,0.20)',
    text: '#2563EB',
  },
  dealroom_sent: {
    bg: 'rgba(215,119,6,0.10)',
    border: 'rgba(215,119,6,0.20)',
    text: '#D97706',
  },
  submitted: {
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.20)',
    text: '#8B5CF6',
  },
  scored: {
    bg: 'rgba(22,163,74,0.10)',
    border: 'rgba(22,163,74,0.20)',
    text: '#16A34A',
  },
  report_sent: {
    bg: 'rgba(22,163,74,0.15)',
    border: 'rgba(22,163,74,0.25)',
    text: '#16A34A',
  },
  rejected: {
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.20)',
    text: '#EF4444',
  },
};

/* Status display labels */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  dealroom_sent: 'Deal Room Sent',
  submitted: 'Submitted',
  scored: 'Scored',
  report_sent: 'Report Sent',
  rejected: 'Rejected',
};

/* Sample report data for demo */
export const SAMPLE_REPORT: Omit<FissReport, 'id' | 'application_id' | 'simulation_id' | 'created_at'> = {
  total_score: 74,
  percentile: 'Top 28th Percentile — IB Analyst Cohort',
  financial_reasoning: {
    score: 21,
    grade: 'Strong',
    rationale: 'Demonstrated rigorous DCF methodology with defensible assumptions and cross-verified using comparable multiples.',
    evidence: '"Applied a 12% WACC reflecting sector risk and adjusted terminal growth to 3.5% for cyclicality."',
    improvement: 'Incorporate sensitivity tables showing valuation range under different WACC and growth assumptions to demonstrate analytical depth.',
  },
  structured_thinking: {
    score: 17,
    grade: 'Adequate',
    rationale: 'Analysis followed a logical sequence but occasionally jumped between topics without clear transitions.',
    evidence: '"Revenue analysis moved directly to risk section without summarizing valuation conclusions first."',
    improvement: 'Use explicit section headers and transition sentences. Summarize each section before moving to the next.',
  },
  risk_identification: {
    score: 19,
    grade: 'Strong',
    rationale: 'Identified non-obvious customer concentration risk and correctly linked EV transition to demand uncertainty.',
    evidence: '"78% OEM revenue concentration creates single-point failure risk if any major customer shifts suppliers."',
    improvement: 'Quantify risk impact where possible — estimate revenue at risk if top OEM reduces orders by 20%.',
  },
  decision_clarity: {
    score: 14,
    grade: 'Developing',
    rationale: 'Recommendation lacked conviction — hedged excessively without committing to a clear thesis.',
    evidence: '"Would proceed with significant conditions" — the conditions were not specific enough to act on.',
    improvement: 'State your recommendation in the first sentence. Then defend it. Name exactly 2-3 conditions with measurable thresholds.',
  },
  standout_strength: 'You identified non-obvious customer concentration risk that surface readers miss — the rarest analyst signal. Your ability to connect OEM dependency with EV transition timing shows genuine financial intuition.',
  critical_gap: 'Your recommendation hedged too heavily without committing to a clear investment thesis. Strong analysts state their position first, then defend it — your analysis read as undecided despite strong underlying work.',
  evaluator_summary: 'A methodical analyst with strong quantitative instincts who needs to develop conviction in their recommendations.',
};
