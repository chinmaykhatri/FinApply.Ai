/* ═══════════════════════════════════════════════
   Plan Generator — FinApply.ai
   Takes FISS report dimensions, identifies the 2
   weakest, and returns the matching 30-day plan.
   ═══════════════════════════════════════════════ */

import { IMPROVEMENT_PLANS, type DailyAction, type Dimension } from './improvement-plans';

interface DimensionScore {
  abbr: Dimension;
  score: number;
}

interface FISSReport {
  financial_reasoning: number;
  structured_thinking: number;
  risk_identification: number;
  decision_clarity: number;
}

/**
 * Given a FISS report, returns the 30-day improvement plan
 * targeting the two weakest dimensions.
 */
export function generatePlan(report: FISSReport): {
  plan: DailyAction[];
  weakest: [Dimension, Dimension];
} {
  const dimensions: DimensionScore[] = [
    { abbr: 'FR', score: report.financial_reasoning },
    { abbr: 'ST', score: report.structured_thinking },
    { abbr: 'RI', score: report.risk_identification },
    { abbr: 'DC', score: report.decision_clarity },
  ];

  // Sort ascending to find the two weakest
  dimensions.sort((a, b) => a.score - b.score);
  const weakest: [Dimension, Dimension] = [dimensions[0].abbr, dimensions[1].abbr];

  // Create a sorted key to match our plan map
  const key = [...weakest].sort().join('_');

  const plan = IMPROVEMENT_PLANS[key];
  if (!plan) {
    // Fallback: if no exact match (shouldn't happen), use FR_ST
    return {
      plan: IMPROVEMENT_PLANS['FR_ST'],
      weakest,
    };
  }

  return { plan, weakest };
}

/**
 * Helper: returns the full dimension name for an abbreviation.
 */
export function dimensionName(abbr: Dimension): string {
  const names: Record<Dimension, string> = {
    FR: 'Financial Reasoning',
    ST: 'Structured Thinking',
    RI: 'Risk Identification',
    DC: 'Decision Clarity',
  };
  return names[abbr];
}
