/**
 * Local HAL native types — the canonical 5-signal shape ported from
 * repid-engine/src/hal/lib/types.ts.
 *
 * Field names are load-bearing per HAL_LIBRARY_API.md — never rename. The
 * repid-engine names are preserved here for byte-equivalence with production HAL.
 *
 * Note: this is DIFFERENT from the 6-DOF `HALSignals` shape in
 * `@hyperdag/interfaces` (faithfulness, contradiction, calibration, …).
 * The two schemas are intentionally distinct: one is the proprietary native
 * signal block, the other is the public canonical-DOF block. The
 * `LocalHALProvider.evaluate()` populates both (native via extras,
 * canonical via best-effort approximation) so consumers of either schema
 * still work.
 */

export type CommaSeverity = 'none' | 'minor' | 'major' | 'critical';
export type AgreementZone = 'too-tight' | 'in-band' | 'too-loose';
export type StrictnessLevel = 1 | 2 | 3 | 4 | 5;

export interface NativeHALSignals {
  harm_probability: number;
  epistemic_uncertainty: number;
  evidence_quality: number;
  scope_appropriateness: number;
  certainty_at_claim: number;
  agreement_score?: number | null;
  prompt_category?: string | null;
  comma_veto?: boolean | null;
  comma_gap?: number | null;
  comma_severity?: CommaSeverity | null;
}

export interface ExtractInput {
  text: string;
  domain: string;
  certainty: number;
  domainOntologies?: Record<string, string[]>;
}

export interface LocalHALEvaluateOptions {
  /** Default 0.25; overrides HAL_DEFAULT_VETO_THRESHOLD if set. */
  threshold?: number;
  /** Caller-supplied cross-LLM agreement score in [0, 1] if pre-computed. */
  agreement_score?: number | null;
  /** Caller-supplied prompt category from a classifier. */
  prompt_category?: string | null;
  /** Domain extension/override. */
  domainOntologies?: Record<string, string[]>;
}
