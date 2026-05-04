import type { Hex } from "./common.js";
import type { AgentId } from "./identity.js";

/**
 * RepID score for an agent. The score range is implementation-defined
 * but the default ZKP RepID implementation uses 0..10000 with named tiers:
 *
 *  - CUSTODIED_DBT: 0..999       (mandatory human-in-the-loop)
 *  - EARNING_AUTONOMY: 1000..4999 (graduated review)
 *  - AUTONOMOUS: 5000..10000      (autonomous operation within bounds)
 *
 * Other implementations are free to use different ranges. Consumers MUST
 * NOT hardcode tier thresholds — query via the implementation's tier helpers
 * or use the `IValidation` `repIdGate` parameter, which is implementation-aware.
 */
export interface RepIDScore {
  agentId: AgentId;
  /** Numeric score. Range is implementation-defined. */
  score: number;
  /** Implementation-defined tier label (e.g., "AUTONOMOUS"). Optional. */
  tier?: string;
  /** When this score was last updated (unix seconds). */
  updatedAt: number;
  /** Optional ZK proof commitment that was last accepted. */
  proofCommitment?: Hex;
}

/**
 * Feedback submitted against an agent. The default implementation hashes
 * `body` and `context` together with the submitter address before storing.
 */
export interface Feedback {
  /** Submitter (human or agent address). */
  from: string;
  /** Free-form feedback body. Implementations decide whether to store on-chain. */
  body: string;
  /** Optional severity / direction signal. -1..+1 convention recommended. */
  signal?: number;
  /** Free-form context object the implementation may hash into the receipt. */
  context?: Record<string, unknown>;
}

export interface FeedbackReceipt {
  receiptId: string;
  agentId: AgentId;
  /** keccak-256 digest of feedback body + context. */
  contentHash: Hex;
  /** Optional on-chain transaction hash if persisted on-chain. */
  txHash?: Hex;
}

/**
 * Zero-knowledge proof envelope. Implementation-specific; consumers should
 * pass it back to `verifyProof()` rather than parsing the bytes.
 */
export interface ZKProof {
  /** Proof system identifier ("plonky3", "groth16", "stub", ...). */
  system: string;
  /** Opaque proof bytes. */
  proof: Hex;
  /** Public inputs the proof commits to. Shape is system-specific. */
  publicInputs: unknown[];
}
