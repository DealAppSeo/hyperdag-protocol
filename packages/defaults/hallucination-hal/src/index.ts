/**
 * Source: HyperDAG HAL evaluation service (proprietary).
 *   Reference shape: repid-engine/src/services/hal-signals.ts
 *   (commit 204cfcbe93f85f8cb0ccdc969d2cc4003129c1db at sprint time)
 * v0.1.0-alpha provenance: HTTP client + stub fallback. The HAL signal
 *   extraction formula and weighting (HAEE / ANFIS parameters) are part of
 *   HDP's patent portfolio (P-003) and are NOT redistributed under v0.1.
 *   Conforming implementations are free to use any scoring math as long as
 *   they produce the canonical HALResult shape.
 * v0.2 plan: opt-in local signal extraction once the open subset of HAEE is
 *   published.
 * License: Apache-2.0 (this wrapper). Underlying service is proprietary.
 */

import type {
  IHallucination,
  HALEvaluationRequest,
  HALResult,
  VetoDecision,
} from "@hyperdag/interfaces";

/** Public constant per CLAUDE.md ("Pythagorean Comma: 531441/524288 ≈ 1.013643"). */
export const PYTHAGOREAN_COMMA = 531441 / 524288;

export interface HALHallucinationProviderConfig {
  /** Base URL of the HAL evaluation service (no trailing slash). Optional. */
  apiUrl?: string;
  apiKey?: string;
  /** Override the comma veto threshold this provider reports. Default: PYTHAGOREAN_COMMA. */
  commaThreshold?: number;
  /** Custom fetch (must conform to WHATWG Fetch). Default: globalThis.fetch. */
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

export class HALHallucinationProvider implements IHallucination {
  private readonly apiUrl?: string;
  private readonly apiKey?: string;
  private readonly commaThreshold: number;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs: number;

  constructor(config: HALHallucinationProviderConfig = {}) {
    this.apiUrl = config.apiUrl?.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.commaThreshold = config.commaThreshold ?? PYTHAGOREAN_COMMA;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  async evaluate(request: HALEvaluationRequest): Promise<HALResult> {
    if (!this.apiUrl) {
      return this.stubResult(request);
    }
    return this.request<HALResult>("/hal/evaluate", "POST", request);
  }

  async vetoCheck(output: string, consensus: number): Promise<VetoDecision> {
    if (!this.apiUrl) {
      const gap = consensus - (this.commaThreshold - 1);
      return { vetoed: false, comma_gap: gap };
    }
    return this.request<VetoDecision>("/hal/veto-check", "POST", { output, consensus });
  }

  async getCommaThreshold(): Promise<number> {
    return this.commaThreshold;
  }

  private stubResult(_request: HALEvaluationRequest): HALResult {
    return {
      hal_score: 0.5,
      vetoed: false,
      comma_veto: false,
      comma_gap: 0,
      formula: "stub",
      signals: {
        faithfulness: 0.5,
        contradiction: 0.5,
        calibration: 0.5,
        relevance: 0.5,
        coherence: 0.5,
        consensus: 0.5,
      },
    };
  }

  private async request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
      const res = await this.fetchImpl(`${this.apiUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`HALHallucinationProvider ${method} ${path}: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
