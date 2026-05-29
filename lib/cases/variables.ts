/* ═══════════════════════════════════════════════
   Case Variable Definitions — FinApply.ai
   
   Each case can define 4-7 variables that are
   randomised per candidate to make every instance
   unique. The analytical structure stays identical;
   only the specific numbers change.
   
   Variable types:
   - range:   random integer within [min, max]
   - choice:  random pick from a list
   - derived: calculated from previously-generated vars
   ═══════════════════════════════════════════════ */

// ── Type definitions ──

export interface RangeVar {
  type: 'range';
  min: number;
  max: number;
  label?: string;
  display: string;
}

export interface ChoiceVar {
  type: 'choice';
  options: number[];
  display: string;
}

export interface DerivedVar {
  type: 'derived';
  formula: (vars: Record<string, number>) => number;
  display: string;
  /** Keys this variable depends on — used for ordering */
  dependsOn: string[];
}

export type CaseVariable = RangeVar | ChoiceVar | DerivedVar;

export interface ValidationRule {
  check: (vars: Record<string, number>) => boolean;
  message: string;
}

// ── Variable definitions for Phase 1 (5 priority cases) ──

export const CASE_VARIABLES: Record<string, Record<string, CaseVariable>> = {

  /* ─── IB-001: Meridian Auto Components ─── */
  'IB-001': {
    REVENUE_FY24: {
      type: 'range', min: 210, max: 260,
      label: '₹ Crores',
      display: 'Revenue FY24',
    },
    EBITDA_MARGIN: {
      type: 'range', min: 15, max: 22,
      label: '%',
      display: 'EBITDA Margin FY24',
    },
    EBITDA_FY24: {
      type: 'derived',
      formula: (v) => Math.round(v.REVENUE_FY24 * v.EBITDA_MARGIN / 100),
      display: 'EBITDA FY24',
      dependsOn: ['REVENUE_FY24', 'EBITDA_MARGIN'],
    },
    TOTAL_DEBT: {
      type: 'range', min: 90, max: 130,
      label: '₹ Crores',
      display: 'Total Debt FY24',
    },
    INTEREST_EXPENSE: {
      type: 'derived',
      formula: (v) => Math.round(v.TOTAL_DEBT * 0.105),
      display: 'Interest Expense',
      dependsOn: ['TOTAL_DEBT'],
    },
    WC_DAYS: {
      type: 'range', min: 72, max: 92,
      label: 'days',
      display: 'Working Capital Days',
    },
    ENTRY_MULTIPLE: {
      type: 'choice',
      options: [9, 10, 11, 12],
      display: 'Target Entry Multiple (EV/EBITDA)',
    },
  },

  /* ─── PE-001: Spice Route QSR ─── */
  'PE-001': {
    OUTLET_COUNT: {
      type: 'range', min: 68, max: 92,
      display: 'Total Outlets',
    },
    OWNED_RATIO: {
      type: 'choice',
      options: [35, 40, 45],
      display: '% Owned Outlets',
    },
    SYSTEM_SALES: {
      type: 'range', min: 240, max: 310,
      display: 'System Sales ₹ Cr',
    },
    EBITDA_MARGIN: {
      type: 'range', min: 14, max: 20,
      display: 'Owned Store EBITDA %',
    },
    PAYBACK_MONTHS: {
      type: 'range', min: 22, max: 32,
      display: 'New Store Payback Months',
    },
    ASKING_MULTIPLE: {
      type: 'range', min: 16, max: 21,
      display: 'Promoter Asking Multiple',
    },
    SSS_GROWTH: {
      type: 'range', min: 5, max: 11,
      display: 'Same Store Sales Growth %',
    },
  },

  /* ─── B4-001: MedEquip Distributors ─── */
  'B4-001': {
    REVENUE_REPORTED: {
      type: 'range', min: 260, max: 320,
      display: 'Reported Revenue ₹ Cr',
    },
    EBITDA_PCT: {
      type: 'range', min: 11, max: 16,
      display: 'Reported EBITDA Margin %',
    },
    EBITDA_REPORTED: {
      type: 'derived',
      formula: (v) => Math.round(v.REVENUE_REPORTED * v.EBITDA_PCT / 100),
      display: 'Reported EBITDA',
      dependsOn: ['REVENUE_REPORTED', 'EBITDA_PCT'],
    },
    GOVT_TENDER_ONE_TIME: {
      type: 'range', min: 8, max: 18,
      display: 'One-time Govt Tender Revenue',
    },
    EXPIRING_CONTRACT_PCT: {
      type: 'range', min: 32, max: 45,
      display: 'Revenue from Expiring Contract %',
    },
    DEBTOR_DAYS: {
      type: 'range', min: 82, max: 108,
      display: 'Debtor Days',
    },
  },

  /* ─── ER-001: FreshFields Consumer Products ─── */
  'ER-001': {
    CURRENT_PRICE: {
      type: 'range', min: 740, max: 940,
      display: 'Current Share Price ₹',
    },
    REVENUE_FY24: {
      type: 'range', min: 780, max: 900,
      display: 'Revenue FY24 ₹ Cr',
    },
    EBITDA_MARGIN: {
      type: 'range', min: 12, max: 16,
      display: 'EBITDA Margin %',
    },
    PE_TRAILING: {
      type: 'range', min: 18, max: 26,
      display: 'Trailing P/E at CMP',
    },
    AD_SPEND_PCT: {
      type: 'range', min: 5, max: 9,
      display: 'Ad Spend as % of Revenue FY24',
    },
    DIVIDEND_PAYOUT: {
      type: 'choice',
      options: [22, 24, 25, 28],
      display: 'Dividend Payout %',
    },
  },

  /* ─── CF-001: Sunrise Foods Capex ─── */
  'CF-001': {
    BUILD_COST: {
      type: 'range', min: 160, max: 210,
      display: 'Build New Facility Cost ₹ Cr',
    },
    BUILD_MONTHS: {
      type: 'range', min: 24, max: 34,
      display: 'Construction Timeline Months',
    },
    ACQUIRE_COST: {
      type: 'range', min: 200, max: 260,
      display: 'Acquire Existing Facility ₹ Cr',
    },
    BUILD_CAPACITY: {
      type: 'range', min: 40000, max: 52000,
      display: 'New Build Capacity MT',
    },
    ACQUIRE_CAPACITY: {
      type: 'range', min: 28000, max: 38000,
      display: 'Acquired Facility Capacity MT',
    },
    DEMAND_YEAR2: {
      type: 'range', min: 32000, max: 44000,
      display: 'Demand Forecast Year 2 MT',
    },
    WACC: {
      type: 'choice',
      options: [11, 12, 12.5, 13],
      display: 'Company WACC %',
    },
  },
};

// ── Validation rules — prevent degenerate combinations ──

export const VALIDATION_RULES: Record<string, ValidationRule[]> = {

  'IB-001': [
    {
      check: (v) => v.EBITDA_FY24 > v.INTEREST_EXPENSE * 1.5,
      message: 'EBITDA must cover interest by at least 1.5x for case to work',
    },
    {
      check: (v) => v.TOTAL_DEBT / v.EBITDA_FY24 < 4,
      message: 'Leverage cannot exceed 4x or case becomes trivially distressed',
    },
    {
      check: (v) => v.WC_DAYS > 60,
      message: 'WC days must be elevated to create the analytical signal',
    },
  ],

  'PE-001': [
    {
      check: (v) => v.ASKING_MULTIPLE > v.EBITDA_MARGIN * 0.8,
      message: 'Asking multiple must create valuation tension against margins',
    },
    {
      check: (v) => v.PAYBACK_MONTHS >= 20,
      message: 'Payback must be long enough to question unit economics',
    },
  ],

  'B4-001': [
    {
      check: (v) => v.GOVT_TENDER_ONE_TIME < v.REVENUE_REPORTED * 0.08,
      message: 'One-time tender must be small enough to be hidden, not obvious',
    },
    {
      check: (v) => v.DEBTOR_DAYS > 75,
      message: 'Debtor days must be elevated to signal collection risk',
    },
  ],

  'ER-001': [
    {
      check: (v) => v.PE_TRAILING < 30,
      message: 'P/E must appear "cheap" vs sector 35-55x to create the valuation signal',
    },
    {
      check: (v) => v.AD_SPEND_PCT < v.EBITDA_MARGIN,
      message: 'Ad spend must be below EBITDA margin to create the hidden signal',
    },
  ],

  'CF-001': [
    {
      check: (v) => v.BUILD_COST < v.ACQUIRE_COST,
      message: 'Build must be cheaper than acquire to create the analytical tension',
    },
    {
      check: (v) => v.BUILD_CAPACITY > v.ACQUIRE_CAPACITY,
      message: 'Build must have more capacity to justify the longer timeline',
    },
    {
      check: (v) => v.DEMAND_YEAR2 > v.ACQUIRE_CAPACITY * 0.7,
      message: 'Demand must stress acquired capacity to make build attractive',
    },
  ],
};
