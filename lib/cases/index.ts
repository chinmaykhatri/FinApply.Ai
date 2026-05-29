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
 * Handles partial matches and common variations.
 */
export function resolveRoleTrack(targetRole: string): RoleTrack {
  const normalized = targetRole.toLowerCase().trim();

  if (normalized.includes('investment banking') || normalized.includes('ib')) return 'IB';
  if (normalized.includes('private equity') || normalized.includes('pe')) return 'PE';
  if (normalized.includes('big 4') || normalized.includes('advisory') || normalized.includes('audit') || normalized.includes('b4')) return 'B4';
  if (normalized.includes('corporate finance') || normalized.includes('cf') || normalized.includes('treasury') || normalized.includes('fp&a')) return 'CF';
  if (normalized.includes('equity research') || normalized.includes('er') || normalized.includes('credit research')) return 'ER';

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
