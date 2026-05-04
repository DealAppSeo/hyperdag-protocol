import type { Hex } from "./common.js";
import type { AgentId } from "./identity.js";

/**
 * Free-form validation context the calling agent provides. Validators may
 * inspect any field but MUST NOT mutate. Implementation-defined keys.
 */
export type ValidationContext = Record<string, unknown>;

/**
 * Single attestation produced by one validator about a receipt.
 */
export interface ValidatorAttestation {
  validatorAgentId: AgentId;
  /** -1..+1 attestation signal, or implementation-defined enumeration. */
  verdict: number;
  /** Optional attestation reasoning the validator chose to disclose. */
  reasoning?: string;
  /** Validator's signature over (receiptId, verdict, reasoning). */
  signature: Hex;
}

/**
 * Outcome of a single validator's `validate()` call. Aggregated by
 * `aggregateAttestations()` into a `BFTResult`.
 */
export interface ValidationResult {
  receiptId: string;
  attestation: ValidatorAttestation;
  /** Whether human review is required for this artifact (HITL graduation). */
  humanReviewRequired: boolean;
}

/**
 * Outcome of BFT aggregation across multiple validator attestations.
 * The default Trinity Symphony implementation uses a φ-weighted threshold
 * (BFT_THRESHOLD = 0.618).
 */
export interface BFTResult {
  receiptId: string;
  /** Final aggregated verdict in -1..+1. */
  verdict: number;
  /** Threshold the aggregator used (implementation-defined). */
  threshold: number;
  /** Whether the verdict cleared the threshold. */
  consensusReached: boolean;
  attestations: ValidatorAttestation[];
}

/**
 * Work to be validated. Either an in-flight artifact (pre-validation) or a
 * pointer to one already issued.
 */
export interface WorkArtifact {
  /** Optional receipt id if the artifact has already been issued. */
  receiptId?: string;
  /** Hash of the work payload (for content-addressing). */
  contentHash: Hex;
  /** Optional inline payload. Validators decide whether to fetch externally. */
  payload?: unknown;
  /** Free-form metadata (model, prompt hash, agent context, ...). */
  metadata?: Record<string, unknown>;
}

/**
 * Returned by `requestValidation()`. The task may be queued, in-flight,
 * or already complete depending on implementation.
 */
export interface ValidationTask {
  taskId: string;
  receiptId?: string;
  status: "queued" | "in_progress" | "complete";
  /** When mandatory human review is gating progress. */
  awaitingHuman: boolean;
}
