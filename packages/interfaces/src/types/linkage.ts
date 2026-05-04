import type { Address, Hex } from "./common.js";
import type { AgentId } from "./identity.js";

/**
 * Identifier for a Human RepID. Distinct from `AgentId` — humans and agents
 * live in different identity namespaces. The default Linkage Registry uses
 * an opaque string (typically a checksummed Ethereum address or DID).
 */
export type HumanRepId = string;

/**
 * Stake amount in the implementation's chosen unit. The default Linkage
 * Registry uses USDT (6-decimal `bigint`).
 */
export type StakeAmount = bigint;

/**
 * Receipt issued when a human binds to an agent. Represents the on-chain
 * commitment plus the stake collateral held in escrow.
 */
export interface LinkageReceipt {
  linkageId: string;
  humanRepId: HumanRepId;
  agentId: AgentId;
  /** Collateral locked. */
  stake: StakeAmount;
  /** Who can claim slashed stake on misbehavior (typically a community pool). */
  slashRecipient?: Address;
  /** Receipt-content hash for off-chain ↔ on-chain reconciliation. */
  contentHash: Hex;
  /** Optional on-chain tx for the bind. */
  txHash?: Hex;
}

/**
 * Existing linkage as returned by `getLinkage()`.
 */
export interface Linkage {
  linkageId: string;
  humanRepId: HumanRepId;
  agentId: AgentId;
  stake: StakeAmount;
  /** Linkage state — implementation defines the lifecycle. */
  status: "active" | "unbinding" | "slashed" | "released";
  /** When the bind happened (unix seconds). */
  boundAt: number;
}

/**
 * Outcome of `unbind()`. The default implementation uses a delay so the
 * counterparty can dispute; status will be "unbinding" until the delay
 * elapses, then "released".
 */
export interface UnbindResult {
  linkageId: string;
  status: "unbinding" | "released";
  /** When the stake becomes withdrawable (unix seconds). */
  releasableAt?: number;
  txHash?: Hex;
}
