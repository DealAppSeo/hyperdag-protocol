/**
 * HAL evaluation request. The implementation decides what subset of these
 * fields it needs to compute the score.
 */
export interface HALEvaluationRequest {
  /** Original prompt the agent was given. */
  prompt: string;
  /** Agent's output to evaluate. */
  output: string;
  /** Free-form evaluation context (model, agent id, prior turns, ...). */
  context?: Record<string, unknown>;
}

/**
 * 6-DOF signal block produced by HAL. The HyperDAG default implementation
 * derives these from cross-LLM consensus + ZKP RepID weighting; replacement
 * implementations are free to compute them differently as long as the shape
 * is preserved so downstream consumers (validators, dashboards) still work.
 */
export interface HALSignals {
  /** Semantic faithfulness to the prompt. */
  faithfulness: number;
  /** Internal contradiction within the output. */
  contradiction: number;
  /** Calibration of expressed confidence vs. supported facts. */
  calibration: number;
  /** Relevance to the prompt scope. */
  relevance: number;
  /** Coherence across reasoning steps. */
  coherence: number;
  /** Consensus across the cross-LLM panel (0..1). */
  consensus: number;
}

/**
 * HAL evaluation result. `vetoed` is the load-bearing field for callers:
 * if true, the output should NOT be returned to a downstream consumer.
 */
export interface HALResult {
  /** Aggregate score in 0..1 (higher is better). */
  hal_score: number;
  /** True if HAL refuses to certify this output. */
  vetoed: boolean;
  /** Optional human-readable veto reason. */
  veto_reason?: string;
  /** Whether the BFT-veto path triggered (Pythagorean Comma threshold). */
  comma_veto: boolean;
  /** Distance from the comma threshold (negative = below, positive = above). */
  comma_gap: number;
  /** Implementation tag identifying which formula produced this score. */
  formula: string;
  /** 6-DOF signal block. */
  signals: HALSignals;
}

/**
 * Result of `vetoCheck()` — a lighter call than `evaluate()` that consumes
 * an already-computed cross-LLM consensus value rather than re-running it.
 */
export interface VetoDecision {
  vetoed: boolean;
  /** Reason for veto if applicable. */
  reason?: string;
  /** Distance from the comma threshold at decision time. */
  comma_gap: number;
}
