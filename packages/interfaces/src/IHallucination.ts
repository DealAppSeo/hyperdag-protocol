import type {
  HALEvaluationRequest,
  HALResult,
  VetoDecision,
} from "./types/hallucination.js";

/**
 * IHallucination — Hallucination filtering layer of the HyperDAG modular
 * trust kernel.
 *
 * @description
 * Defines the contract any hallucination filter MUST satisfy. The default
 * implementation (`@hyperdag/hallucination-hal`) is HAL — the Hallucination
 * Adversarial Layer — using cross-LLM consensus combined with the
 * Pythagorean Comma BFT veto threshold (531441/524288 ≈ 1.013643).
 * Conforming alternatives may use any approach as long as they produce a
 * `HALResult` with the same shape.
 *
 * @contract
 * Implementations MUST:
 *   - Accept any `(prompt, output, context)` triple and return a deterministic
 *     `HALResult` (deterministic given the same inputs and the same internal
 *     model snapshot).
 *   - Populate `vetoed` honestly — if the implementation cannot certify the
 *     output, `vetoed` MUST be `true`.
 *   - Expose `getCommaThreshold()` so downstream consumers can introspect
 *     which veto threshold the implementation operates under.
 *
 * Implementations MAY:
 *   - Use any combination of LLM panels, classical NLP, retrieval grounding,
 *     statistical detectors, etc.
 *   - Use a different threshold than the Pythagorean Comma.
 *   - Add additional fields to the `signals` block beyond the canonical
 *     6-DOF set, but the canonical fields MUST be present.
 *
 * @see Default implementation — `packages/defaults/hallucination-hal/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface IHallucination {
  /**
   * Evaluate an agent output for hallucination risk.
   *
   * @param request `(prompt, output, context)` to evaluate.
   * @returns Full `HALResult` — score, veto, comma_gap, signals.
   */
  evaluate(request: HALEvaluationRequest): Promise<HALResult>;

  /**
   * Lighter check that takes a precomputed cross-model consensus value and
   * returns only a veto decision. Useful when the caller has already
   * computed (or chosen not to compute) the full signal block.
   *
   * @param output     Output under evaluation.
   * @param consensus  Cross-model consensus value in 0..1.
   */
  vetoCheck(output: string, consensus: number): Promise<VetoDecision>;

  /**
   * Return the implementation's veto threshold. The HDP default returns
   * 1.013643 (Pythagorean Comma); other implementations may return any
   * positive number.
   */
  getCommaThreshold(): Promise<number>;
}
