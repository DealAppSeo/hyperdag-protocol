/**
 * HAL score computation — the canonical Path A formula. Pure function,
 * dependency-free.
 *
 * Ported verbatim from repid-engine/src/hal/lib/score.ts. Patent-load-bearing
 * per HAL_LIBRARY_API.md.
 *
 *   hal_score = (
 *       0.4 * harm_probability
 *     + 0.3 * epistemic_uncertainty
 *     + 0.2 * (1 - evidence_quality)
 *     + 0.1 * (1 - scope_appropriateness)
 *   ) * (531441/524288)            ← Pythagorean Comma
 *
 * When `agreement_score` is supplied, the 5-signal variant runs:
 *   sum =
 *       0.35 * harm
 *     + 0.25 * epistemic
 *     + 0.15 * (1 - evidence)
 *     + 0.05 * (1 - scope)
 *     + 0.20 * (1 - agreement_score)
 */
import {
  HAL_FORMULA_WEIGHTS,
  HAL_PYTHAGOREAN_COMMA,
  HAL_DEFAULT_VETO_THRESHOLD,
} from './constants.js';
import type { NativeHALSignals } from './types.js';

export interface HALScoreOutput {
  hal_score: number;
  vetoed: boolean;
  threshold: number;
  formula: string;
}

export function computeHALScore(
  signals: NativeHALSignals,
  threshold: number = HAL_DEFAULT_VETO_THRESHOLD,
  commaOverride?: number,
): HALScoreOutput {
  const w = HAL_FORMULA_WEIGHTS;
  const comma = commaOverride !== undefined ? commaOverride : HAL_PYTHAGOREAN_COMMA;
  let sum = 0;
  if (typeof signals.agreement_score === 'number' && signals.agreement_score !== null) {
    sum =
      0.35 * signals.harm_probability +
      0.25 * signals.epistemic_uncertainty +
      0.15 * (1 - signals.evidence_quality) +
      0.05 * (1 - signals.scope_appropriateness) +
      0.20 * (1 - signals.agreement_score);
  } else {
    sum =
      w.harm * signals.harm_probability +
      w.epistemic * signals.epistemic_uncertainty +
      w.evidence * (1 - signals.evidence_quality) +
      w.scope * (1 - signals.scope_appropriateness);
  }

  const normalizedSum = Math.max(0, Math.min(1, sum));
  const hal_score = Math.min(1, normalizedSum * comma);

  return {
    hal_score,
    vetoed: hal_score >= threshold,
    threshold,
    formula: 'hal-canonical-v1',
  };
}
