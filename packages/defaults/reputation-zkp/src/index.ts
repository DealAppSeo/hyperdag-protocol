/**
 * Source: HyperDAG RepID scoring service (proprietary, accessible via REST).
 *   Reference impl exists in private repo `repid-engine` (commit 204cfcb at sprint time).
 * v0.1.0-alpha provenance: this package is a public-API client. The scoring
 *   formula is part of HDP's patent portfolio (P-001) and is NOT redistributed.
 *   Conforming implementations are free to use any scoring math.
 * v0.2 plan: opt-in local proof generation via Plonky3 once the federated
 *   learning protocol is public.
 * License: Apache-2.0 (this wrapper). Underlying service is proprietary.
 */

import type {
  IReputation,
  AgentId,
  Feedback,
  FeedbackReceipt,
  RepIDScore,
  ZKProof,
} from "@hyperdag/interfaces";

export interface ZKPRepIDProviderConfig {
  /** Base URL of the RepID scoring service (no trailing slash). */
  apiUrl: string;
  /** API key for authenticated calls. */
  apiKey?: string;
  /**
   * Custom fetch implementation (Node 20+ has it globally; pass to override
   * for testing). Must conform to the WHATWG Fetch API.
   */
  fetch?: typeof globalThis.fetch;
  /** Default timeout for outbound requests (ms). Default: 10000. */
  timeoutMs?: number;
}

export class ZKPRepIDProvider implements IReputation {
  private readonly apiUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly timeoutMs: number;

  constructor(config: ZKPRepIDProviderConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.fetchImpl = config.fetch ?? globalThis.fetch;
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  async getScore(agentId: AgentId): Promise<RepIDScore> {
    const data = await this.request<{
      agentId: string;
      score: number;
      tier?: string;
      updatedAt: number;
      proofCommitment?: `0x${string}`;
    }>(`/repid/${agentId.toString()}`, "GET");
    return {
      agentId,
      score: data.score,
      tier: data.tier,
      updatedAt: data.updatedAt,
      proofCommitment: data.proofCommitment,
    };
  }

  async submitFeedback(agentId: AgentId, feedback: Feedback): Promise<FeedbackReceipt> {
    const data = await this.request<{
      receiptId: string;
      contentHash: `0x${string}`;
      txHash?: `0x${string}`;
    }>(`/repid/${agentId.toString()}/feedback`, "POST", feedback);
    return {
      receiptId: data.receiptId,
      agentId,
      contentHash: data.contentHash,
      txHash: data.txHash,
    };
  }

  async verifyProof(proof: ZKProof): Promise<boolean> {
    const data = await this.request<{ valid: boolean }>(
      `/repid/proofs/verify`,
      "POST",
      proof,
    );
    return data.valid;
  }

  async getReputationProof(agentId: AgentId): Promise<ZKProof> {
    return this.request<ZKProof>(`/repid/${agentId.toString()}/proof`, "GET");
  }

  private async request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
      const res = await this.fetchImpl(`${this.apiUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`ZKPRepIDProvider ${method} ${path}: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
