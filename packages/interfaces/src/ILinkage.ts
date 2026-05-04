import type { AgentId } from "./types/identity.js";
import type {
  HumanRepId,
  Linkage,
  LinkageReceipt,
  StakeAmount,
  UnbindResult,
} from "./types/linkage.js";

/**
 * ILinkage — Linkage Registry layer of the HyperDAG modular trust kernel.
 *
 * @description
 * Defines the contract any human↔agent linkage provider MUST satisfy. The
 * default implementation (`@hyperdag/linkage-registry`) is HDP's Linkage
 * Registry, which sits as a sibling to ERC-8004's Identity and Reputation
 * Registries and binds Human RepIDs to Agent identities under collateralized
 * stake. The novel design point — the inverse-stake curve — means required
 * collateral DECREASES as the human's reputation grows.
 *
 * @contract
 * Implementations MUST:
 *   - Bind a (humanRepId, agentId) pair under a stake amount.
 *   - Return the current required stake for a given human (so callers can
 *     pre-flight before committing capital).
 *   - Provide an unbind path with an explicit lifecycle (bind → unbinding →
 *     released or slashed).
 *
 * Implementations MAY:
 *   - Use any underlying collateral asset or staking primitive.
 *   - Define their own `requiredStake()` curve. The HDP default uses an
 *     inverse-stake function tied to RepID tier.
 *   - Add slashing conditions, dispute windows, and recovery mechanisms.
 *
 * @see Default implementation — `packages/defaults/linkage-registry/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface ILinkage {
  /**
   * Bind a human RepID to an agent under a stake commitment.
   *
   * @param humanRepId The human party of the linkage.
   * @param agentId    The agent party of the linkage.
   * @param stake      Collateral being committed. MUST be ≥ `requiredStake(humanRepId)`.
   */
  bindHumanToAgent(
    humanRepId: HumanRepId,
    agentId: AgentId,
    stake: StakeAmount,
  ): Promise<LinkageReceipt>;

  /**
   * Begin unbinding a linkage. Implementations may enforce a dispute delay
   * before the stake is releasable.
   */
  unbind(linkageId: string): Promise<UnbindResult>;

  /**
   * Look up a linkage by either party. Returns the active linkage if one
   * exists; throws if not found (implementation-defined error).
   *
   * @param humanRepIdOrAgentId Either side of the linkage.
   */
  getLinkage(humanRepIdOrAgentId: HumanRepId | AgentId): Promise<Linkage>;

  /**
   * Compute the stake required for a given human to bind to an agent.
   * The HDP default uses an inverse-stake curve: higher RepID ⇒ lower stake.
   *
   * @param humanRepId The human party considering binding.
   */
  requiredStake(humanRepId: HumanRepId): Promise<StakeAmount>;
}
