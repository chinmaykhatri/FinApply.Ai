/* ═══════════════════════════════════════════════
   Case Library Index — FinApply.ai
   75 cases across 5 role tracks (15 per track)
   7 Intermediate/Advanced + 8 Expert per track
   ═══════════════════════════════════════════════ */

export type { DealCase, CaseFinancials, AdminOnly, RoleTrack } from './types';
export { ROLE_MAP } from './types';

import { IB_CASES } from './ib';
import { PE_CASES } from './pe';
import { B4_CASES } from './b4';
import { CF_CASES } from './cf';
import { ER_CASES } from './er';
import type { DealCase, RoleTrack } from './types';

/** Full case library indexed by role track */
export const CASE_LIBRARY: Record<RoleTrack, DealCase[]> = {
  IB: IB_CASES,
  PE: PE_CASES,
  B4: B4_CASES,
  CF: CF_CASES,
  ER: ER_CASES,
};

/**
 * Map a target_role string from the application to a RoleTrack key.
 * Handles both DB enum values (ib_analyst, pe_analyst, etc.) and
 * human-readable labels (Investment Banking Analyst, etc.).
 */
export function resolveRoleTrack(targetRole: string): RoleTrack {
  const normalized = targetRole.toLowerCase().trim();

  // DB enum values (exact match, fastest path)
  if (normalized === 'ib_analyst') return 'IB';
  if (normalized === 'pe_analyst') return 'PE';
  if (normalized === 'big4_advisory') return 'B4';
  if (normalized === 'equity_research') return 'ER';
  if (normalized === 'corporate_finance') return 'CF';

  // Human-readable / partial matches
  if (normalized.includes('investment banking') || normalized === 'ib') return 'IB';
  if (normalized.includes('private equity') || normalized === 'pe') return 'PE';
  if (normalized.includes('big 4') || normalized.includes('advisory') || normalized.includes('audit') || normalized === 'b4') return 'B4';
  if (normalized.includes('corporate finance') || normalized.includes('treasury') || normalized.includes('fp&a') || normalized === 'cf') return 'CF';
  if (normalized.includes('equity research') || normalized.includes('credit research') || normalized === 'er') return 'ER';

  // Default to IB if role is unrecognised
  return 'IB';
}

/**
 * Randomly assign one case from the candidate's role track.
 * Pure random — every visit gets a fresh, unpredictable case.
 */
export function assignCase(targetRole: string): DealCase {
  const track = resolveRoleTrack(targetRole);
  const cases = CASE_LIBRARY[track];
  const index = Math.floor(Math.random() * cases.length);
  return cases[index];
}

/** Get a specific case by its code (e.g. 'IB-003') */
export function getCaseByCode(code: string): DealCase | undefined {
  const allCases = [
    ...IB_CASES,
    ...PE_CASES,
    ...B4_CASES,
    ...CF_CASES,
    ...ER_CASES,
  ];
  return allCases.find((c) => c.code === code);
}
