/* ═══════════════════════════════════════════════
   Case Instance Generator — FinApply.ai
   
   Generates a unique case instance by:
   1. Selecting random values for each variable
   2. Computing derived values in dependency order
   3. Validating the combination is analytically sound
   4. Hydrating the case text with actual numbers
   
   If validation fails, regenerates (up to 20 tries).
   ═══════════════════════════════════════════════ */

import type { DealCase } from './types';
import { CASE_VARIABLES, VALIDATION_RULES } from './variables';
import type { CaseVariable } from './variables';

/** Result of generating a case instance */
export interface CaseInstance {
  /** Unique instance ID, e.g. "IB-001-1717000000000" */
  instance_id: string;
  /** Original case code */
  case_code: string;
  /** The generated variable values */
  generated_variables: Record<string, number>;
  /** Human-readable variable labels for display */
  variable_labels: Record<string, string>;
  /** The original DealCase with [PLACEHOLDERS] replaced */
  hydrated_case: DealCase;
}

/**
 * Generate a random value for a single variable definition.
 * For derived variables, `currentVars` must already contain dependencies.
 */
function generateValue(
  config: CaseVariable,
  currentVars: Record<string, number>,
): number {
  switch (config.type) {
    case 'range':
      return Math.floor(
        Math.random() * (config.max - config.min + 1) + config.min,
      );

    case 'choice':
      return config.options[
        Math.floor(Math.random() * config.options.length)
      ];

    case 'derived':
      return config.formula(currentVars);

    default:
      return 0;
  }
}

/**
 * Sort variable keys so that derived variables come after their dependencies.
 * Non-derived variables come first in definition order.
 */
function sortVariableKeys(
  vars: Record<string, CaseVariable>,
): string[] {
  const keys = Object.keys(vars);
  const sorted: string[] = [];
  const visited = new Set<string>();

  function visit(key: string) {
    if (visited.has(key)) return;
    visited.add(key);

    const config = vars[key];
    if (config.type === 'derived') {
      for (const dep of config.dependsOn) {
        if (keys.includes(dep)) visit(dep);
      }
    }
    sorted.push(key);
  }

  for (const key of keys) visit(key);
  return sorted;
}

/**
 * Generate all variable values for a given case code.
 * Returns null if the case has no variable definitions (static case).
 */
function generateVariables(
  caseCode: string,
): { values: Record<string, number>; labels: Record<string, string> } | null {
  const varDefs = CASE_VARIABLES[caseCode];
  if (!varDefs) return null;

  const sortedKeys = sortVariableKeys(varDefs);
  const values: Record<string, number> = {};
  const labels: Record<string, string> = {};

  for (const key of sortedKeys) {
    const config = varDefs[key];
    values[key] = generateValue(config, values);
    labels[key] = config.display;
  }

  return { values, labels };
}

/**
 * Validate a generated variable set against the case's rules.
 * Returns true if all rules pass.
 */
function validateVariables(
  vars: Record<string, number>,
  caseCode: string,
): boolean {
  const rules = VALIDATION_RULES[caseCode];
  if (!rules || rules.length === 0) return true;

  for (const rule of rules) {
    if (!rule.check(vars)) return false;
  }

  return true;
}

/**
 * Replace [PLACEHOLDER] tokens in any string with actual values.
 */
function hydrate(text: string, vars: Record<string, number>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`[${key}]`, String(value));
  }
  return result;
}

/**
 * Deep-hydrate a DealCase object: replace placeholders in all text fields
 * (situation, company_overview, market_context, task) and in financials metrics.
 */
function hydrateDealCase(
  original: DealCase,
  vars: Record<string, number>,
): DealCase {
  // Deep clone to avoid mutating the library template
  const clone: DealCase = JSON.parse(JSON.stringify(original));

  // Hydrate top-level text fields
  if (clone.situation) clone.situation = hydrate(clone.situation, vars);
  if (clone.company_overview) clone.company_overview = hydrate(clone.company_overview, vars);
  if (clone.market_context) clone.market_context = hydrate(clone.market_context, vars);
  if (clone.task) clone.task = hydrate(clone.task, vars);
  if (clone.title) clone.title = hydrate(clone.title, vars);

  // Hydrate financial table values — rows may contain placeholder strings
  if (clone.financials?.rows) {
    for (const row of clone.financials.rows) {
      row.label = hydrate(row.label, vars);
      row.values = row.values.map((v: string) =>
        typeof v === 'string' ? hydrate(v, vars) : v,
      );
    }
  }

  return clone;
}

/**
 * Generate a unique case instance for a candidate.
 * 
 * If the case has variable definitions, generates random values
 * within defined ranges and hydrates the case text.
 * 
 * If the case is static (no variables defined), returns it as-is
 * with an empty variables map.
 * 
 * @param dealCase - The base DealCase from the library
 * @returns A CaseInstance with unique numbers
 */
export function generateCaseInstance(dealCase: DealCase): CaseInstance {
  const caseCode = dealCase.code;
  const maxAttempts = 20;

  // Static case — no variables defined, return as-is
  if (!CASE_VARIABLES[caseCode]) {
    return {
      instance_id: `${caseCode}-${Date.now()}`,
      case_code: caseCode,
      generated_variables: {},
      variable_labels: {},
      hydrated_case: dealCase,
    };
  }

  // Generate and validate
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = generateVariables(caseCode);
    if (!result) break; // shouldn't happen, checked above

    if (validateVariables(result.values, caseCode)) {
      return {
        instance_id: `${caseCode}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        case_code: caseCode,
        generated_variables: result.values,
        variable_labels: result.labels,
        hydrated_case: hydrateDealCase(dealCase, result.values),
      };
    }
  }

  // Fallback: return static case if validation keeps failing
  console.warn(`[CASE INSTANCE] Validation failed after ${maxAttempts} attempts for ${caseCode}. Using static case.`);
  return {
    instance_id: `${caseCode}-${Date.now()}-static`,
    case_code: caseCode,
    generated_variables: {},
    variable_labels: {},
    hydrated_case: dealCase,
  };
}
