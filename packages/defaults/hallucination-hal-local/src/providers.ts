/**
 * LocalHALProvider — primary IHallucination implementation for C→A (D-017).
 *
 * Wraps the local 5-signal extractor + canonical combiner so a createHDP({})
 * consumer can run HAL evaluations entirely offline. The 5th signal
 * (cross-LLM agreement) is honestly fallback-able:
 *   - If `request.context.agreement_score` is supplied, the 5-signal combiner runs.
 *   - Otherwise the 4-signal combiner runs (canonical score.ts already handles this).
 *
 * Schema mapping: the local provider's NATIVE signal block uses the
 * repid-engine canonical 5-signal names (harm_probability, epistemic_uncertainty,
 * evidence_quality, scope_appropriateness, certainty_at_claim). The public
 * @hyperdag/interfaces HALSignals uses a different 6-DOF shape (faithfulness,
 * contradiction, calibration, relevance, coherence, consensus). The native
 * signals are surfaced as extras (`native_signals`) on the returned
 * HALResult, and the canonical 6-DOF block is populated via best-effort
 * approximation so downstream IHallucination consumers still work.
 */

import { extractHALSignals } from './extract.js';
import { computeHALScore } from './score.js';
import {
  HAL_PYTHAGOREAN_COMMA,
  HAL_DEFAULT_VETO_THRESHOLD,
} from './constants.js';
import type { NativeHALSignals } from './types.js';
import type {
  HALEvaluationRequest,
  HALResult,
  HALSignals,
  IHallucination,
  VetoDecision,
} from '@hyperdag/interfaces';

export interface LocalHALProviderConfig {
  /** Default 0.25; overrides HAL_DEFAULT_VETO_THRESHOLD if set. */
  threshold?: number;
  /** Override the Pythagorean Comma constant (only for ablation testing). */
  commaOverride?: number;
  /** Caller-supplied domain ontology extensions / overrides. */
  domainOntologies?: Record<string, string[]>;
}

/**
 * Project NATIVE 5-signal block → canonical 6-DOF HALSignals.
 *
 * This is a LOSSY approximation. The native and canonical schemas are
 * intentionally different. Mapping rationale:
 *
 *   - faithfulness  ≈ evidence_quality       (both measure "is the claim grounded")
 *   - contradiction ≈ harm_probability        (both penalize overconfident specifics)
 *   - calibration   ≈ 1 - epistemic_uncertainty (well-calibrated = low mismatch)
 *   - relevance     ≈ scope_appropriateness  (both = "does the claim fit the domain")
 *   - coherence     ≈ 1 - epistemic_uncertainty  (same proxy as calibration)
 *   - consensus     = agreement_score ?? 0.5  (null → neutral midpoint)
 *
 * The native block is the source of truth for the local provider's veto
 * decision (computed in score.ts). The 6-DOF block is informational only,
 * for IHallucination-typed dashboards and validators.
 */
function projectToCanonical(native: NativeHALSignals): HALSignals {
  return {
    faithfulness: native.evidence_quality,
    contradiction: native.harm_probability,
    calibration: 1 - native.epistemic_uncertainty,
    relevance: native.scope_appropriateness,
    coherence: 1 - native.epistemic_uncertainty,
    consensus: native.agreement_score ?? 0.5,
  };
}

export class LocalHALProvider implements IHallucination {
  private readonly threshold: number;
  private readonly commaOverride?: number;
  private readonly domainOntologies?: Record<string, string[]>;

  constructor(config: LocalHALProviderConfig = {}) {
    this.threshold = config.threshold ?? HAL_DEFAULT_VETO_THRESHOLD;
    this.commaOverride = config.commaOverride;
    this.domainOntologies = config.domainOntologies;
  }

  async evaluate(request: HALEvaluationRequest): Promise<HALResult> {
    const ctx = (request.context ?? {}) as Record<string, unknown>;
    const domain = (ctx.domain as string | undefined) ?? 'finance';
    const certainty = typeof ctx.certainty === 'number' ? ctx.certainty : 0.5;

    // 4 deterministic signals on the OUTPUT (the claim under evaluation).
    const baseSignals = extractHALSignals({
      text: request.output,
      domain,
      certainty,
      domainOntologies: this.domainOntologies,
    });

    // Caller may pre-compute the 5th (cross-LLM agreement) signal — local
    // does not call out to LLMs for this BYOK path.
    const agreement_score =
      typeof ctx.agreement_score === 'number'
        ? (ctx.agreement_score as number)
        : null;

    const nativeSignals: NativeHALSignals = {
      ...baseSignals,
      agreement_score,
      prompt_category: (ctx.prompt_category as string | undefined) ?? null,
    };

    const scored = computeHALScore(nativeSignals, this.threshold, this.commaOverride);
    const canonicalSignals = projectToCanonical(nativeSignals);

    // comma_gap in this local path is the gap between the unscaled sum and
    // the comma threshold — not the cross-LLM belief spread. For that, run
    // the cross-LLM step (remote). Surface as null when no agreement signal.
    const comma_gap = scored.hal_score - (scored.threshold);

    return {
      hal_score: scored.hal_score,
      vetoed: scored.vetoed,
      veto_reason: scored.vetoed
        ? `local-canonical: hal_score=${scored.hal_score.toFixed(3)} >= threshold=${scored.threshold}`
        : undefined,
      // Local provider does not produce a separate "comma_veto" — it always
      // uses the comma in the score multiplier. The cross-LLM BFT comma_veto
      // path requires multiple LLM beliefs (remote-only in v1).
      comma_veto: false,
      comma_gap,
      formula: scored.formula,
      signals: canonicalSignals,
      // Extra field — IHallucination contract MAY add fields beyond the 6-DOF.
      // The native block is the source of truth for veto.
      ...({ native_signals: nativeSignals } as object),
    };
  }

  async vetoCheck(_output: string, consensus: number): Promise<VetoDecision> {
    // The local-light path: given a precomputed consensus value, return the
    // gap-vs-Pythagorean-Comma decision per the canonical formula in the
    // existing remote provider's vetoCheck (gap = consensus - (comma - 1)).
    const commaThreshold = await this.getCommaThreshold();
    const gap = consensus - (commaThreshold - 1);
    return { vetoed: gap < 0, comma_gap: gap };
  }

  async getCommaThreshold(): Promise<number> {
    return this.commaOverride ?? HAL_PYTHAGOREAN_COMMA;
  }
}
