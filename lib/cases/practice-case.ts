/* ═══════════════════════════════════════════════
   Practice Case — FinApply.ai
   A free, unscored 15-minute mini case for
   homepage visitors. No registration needed.
   ═══════════════════════════════════════════════ */

import type { DealCase } from './types';

/**
 * A generic M&A advisory scenario — intentionally NOT from
 * the scored case library. Simpler financials, shorter
 * analysis scope, designed to give a taste of the real
 * Deal Room without revealing scored case content.
 */
export const PRACTICE_CASE: DealCase = {
  code: 'PRACTICE-001',
  role: 'General Finance',
  difficulty: 'Intermediate',
  title: 'NovaBridge Technologies — Strategic Acquisition Assessment',
  situation: `Your team at a mid-market advisory firm has been retained by NovaBridge Technologies, a B2B SaaS company specializing in supply chain analytics. NovaBridge's board is evaluating a potential acquisition of DataPulse, a smaller competitor focused on demand forecasting.

NovaBridge's CEO believes combining both platforms would create a full-stack supply chain intelligence suite — but the CFO has concerns about DataPulse's deteriorating margins and customer retention. Your managing director has asked you to prepare a preliminary investment memo assessing whether this acquisition creates or destroys value.`,

  company_overview: `NovaBridge Technologies (est. 2018) serves 340+ enterprise clients across manufacturing, retail, and logistics. The company reached $42M ARR in FY24, growing at 28% YoY. Gross margins are 74%, and NovaBridge has been EBITDA-positive for 6 quarters.

DataPulse (est. 2020) is a venture-backed startup with $11M ARR, growing at 18% YoY — down from 45% two years ago. Gross margins are 61%, and the company burns $2.1M per quarter. DataPulse has 89 enterprise customers, with its top 3 clients representing 38% of revenue. The proposed acquisition price is $55M (5x ARR).`,

  financials: {
    headers: ['Metric', 'NovaBridge (FY24)', 'DataPulse (FY24)', 'Combined (Pro Forma)'],
    rows: [
      { label: 'ARR', values: ['$42.0M', '$11.0M', '$53.0M'] },
      { label: 'YoY Growth', values: ['28%', '18%', '—'] },
      { label: 'Gross Margin', values: ['74%', '61%', '—'] },
      { label: 'EBITDA', values: ['$4.2M', '−$8.4M', '—'] },
      { label: 'Net Revenue Retention', values: ['118%', '94%', '—'] },
      { label: 'Customers', values: ['340', '89', '429'] },
      { label: 'Avg Contract Value', values: ['$124K', '$124K', '—'] },
      { label: 'Customer Concentration (Top 3)', values: ['12%', '38%', '—'] },
    ],
  },

  market_context: `The supply chain analytics market is projected to reach $19.3B by 2027, growing at 17% CAGR. However, the market is consolidating — three major acquisitions occurred in the last 18 months, and enterprise buyers increasingly prefer single-vendor solutions.

DataPulse's demand forecasting technology is genuinely differentiated, using proprietary ML models trained on 4 years of supply chain disruption data (COVID, Suez Canal, semiconductor shortage). However, two well-funded competitors (ChainIQ and FlowMind) are building similar capabilities and have raised $80M+ each in recent rounds. The window for NovaBridge to acquire this capability vs. build internally is estimated at 12-18 months.`,

  task: `Prepare a concise investment memo covering:

1. **Valuation Assessment**: Is 5x ARR fair for DataPulse given its decelerating growth and negative margins? What would you pay, and why?

2. **Strategic Rationale**: Does the combined entity create genuine strategic value, or is this an acqui-hire dressed up as a platform play?

3. **Key Risks**: Identify the top 3 risks of this acquisition and propose specific mitigation strategies for each.

4. **Recommendation**: Clear invest/pass recommendation with the 2-3 conditions that would change your view.`,

  admin_only: {
    strong_response: 'Identifies that DataPulse\'s 94% NRR signals existing customer dissatisfaction, questions whether the "proprietary ML" is truly defensible given competitor funding levels, and flags the customer concentration risk in a combined entity.',
    critical_gap: 'Accepts the 5x ARR valuation at face value without adjusting for negative margins and decelerating growth. Misses the integration risk of merging two different tech stacks.',
    non_obvious_signal: 'DataPulse\'s ACV is identical to NovaBridge ($124K) despite being a smaller company — this suggests DataPulse is selling to the same enterprise segment, not a different tier. The real question is whether there\'s genuine customer overlap that would cause churn post-acquisition.',
  },
};
