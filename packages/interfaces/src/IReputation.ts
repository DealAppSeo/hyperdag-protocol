import type { AgentId } from "./types/identity.js";
import type {
  Feedback,
  FeedbackReceipt,
  RepIDScore,
  ZKProof,
} from "./types/reputation.js";

/**
 * IReputation — Reputation layer of the HyperDAG modular trust kernel.
 *
 * @description
 * Defines the contract any reputation provider MUST satisfy. The default
 * implementation (`@hyperdag/reputation-zkp`) is the ZKP RepID system,
 * which keeps the underlying scoring formula private while exposing
 * verifiable proofs that an agent's score satisfies a public predicate.
 *
 * @contract
 * Implementations MUST:
 *   - Provide a numeric score per agent, monotonically updated.
 *   - Issue a `FeedbackReceipt` for every accepted feedback submission.
 *   - Allow third-party verification of any score it produces via
 *     `verifyProof()`. (The proof system is implementation-defined; what
 *     matters is that proofs are verifiable without holding the private
 *     scoring inputs.)
 *
 * Implementations MAY:
 *   - Use any score range, tier scheme, or staking model.
 *   - Compose with off-chain attestations (BAS, EAS), on-chain SBTs, or
 *     hybrid proof systems.
 *   - Decline to issue proofs for agents below an implementation-defined
 *     activity threshold.
 *
 * @see Default implementation — `packages/defaults/reputation-zkp/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface IReputation {
  /**
   * Get the current RepID score for an agent.
   *
   * @param agentId The agent to score.
   * @throws If the agent has no score on record (implementation-defined).
   */
  getScore(agentId: AgentId): Promise<RepIDScore>;

  /**
   * Submit feedback against an agent. The feedback contributes to future
   * score updates per the implementation's scoring rules.
   *
   * @param agentId  The agent being reviewed.
   * @param feedback Free-form feedback body + optional signal.
   */
  submitFeedback(agentId: AgentId, feedback: Feedback): Promise<FeedbackReceipt>;

  /**
   * Verify a ZK proof that some agent satisfies some public predicate
   * (e.g., "score ≥ 5000"). Implementations document the predicate
   * shape they support.
   *
   * @param proof Opaque proof envelope produced by `getReputationProof()`.
   * @returns true iff the proof is valid against the implementation's verifier.
   */
  verifyProof(proof: ZKProof): Promise<boolean>;

  /**
   * Generate a ZK proof of the agent's current score (or score-derived
   * predicate). Use this when sharing reputation with a third party who
   * should not learn the underlying inputs.
   *
   * @param agentId The agent whose score to prove.
   */
  getReputationProof(agentId: AgentId): Promise<ZKProof>;
}
