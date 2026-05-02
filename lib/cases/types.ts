/* ═══════════════════════════════════════════════
   Case Library Types — FinApply.ai
   ═══════════════════════════════════════════════ */

export interface CaseFinancials {
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export interface AdminOnly {
  strong_response: string;
  critical_gap: string;
  non_obvious_signal: string;
}

export interface DealCase {
  code: string;
  role: string;
  difficulty: 'Intermediate' | 'Advanced';
  title: string;
  situation: string;
  company_overview: string;
  financials: CaseFinancials;
  market_context: string;
  task: string;
  admin_only: AdminOnly;
}

export type RoleTrack = 'IB' | 'PE' | 'B4' | 'CF' | 'ER';

export const ROLE_MAP: Record<string, RoleTrack> = {
  'Investment Banking Analyst': 'IB',
  'Private Equity Analyst': 'PE',
  'Big 4 Advisory': 'B4',
  'Corporate Finance': 'CF',
  'Equity Research': 'ER',
};
