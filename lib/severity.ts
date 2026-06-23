/**
 * Illustrative severity model — LOCKED matrix.
 *
 * This is a deliberately small 3×4 grid that produces a 4-band output.
 * It is an ILLUSTRATIVE demo model (`isIllustrative`), NOT a validated or
 * certified risk methodology. Do not improvise these mappings.
 */

import type { Likelihood, Consequence, RiskBand } from '@/types';

/**
 * Locked severity matrix. Rows = likelihood, cols = consequence.
 * Any change to these values is a model-version change.
 */
export const SEVERITY_MATRIX: Record<
  Likelihood,
  Record<Consequence, RiskBand>
> = {
  likely: {
    minor: 'medium',
    serious: 'high',
    severe: 'critical',
    catastrophic: 'critical',
  },
  possible: {
    minor: 'low',
    serious: 'medium',
    severe: 'high',
    catastrophic: 'critical',
  },
  rare: {
    minor: 'low',
    serious: 'low',
    severe: 'medium',
    catastrophic: 'high',
  },
} as const;

/** SLA window per risk band, in hours (locked mapping). */
export const SLA_HOURS: Record<RiskBand, number> = {
  critical: 1,
  high: 4,
  medium: 24,
  low: 72,
} as const;

/** Resolve the illustrative risk band from likelihood + consequence. */
export function calculateRiskBand(
  likelihood: Likelihood,
  consequence: Consequence,
): RiskBand {
  return SEVERITY_MATRIX[likelihood][consequence];
}

/**
 * Compute the SLA due timestamp for a risk band, measured from `fromIso`.
 * Pure: deterministic given its inputs.
 */
export function calculateSlaDueAt(
  riskBand: RiskBand,
  fromIso: string,
): string {
  const from = new Date(fromIso);
  const due = new Date(from.getTime() + SLA_HOURS[riskBand] * 60 * 60 * 1000);
  return due.toISOString();
}
