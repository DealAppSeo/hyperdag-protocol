import type { Address, ChainId, Hex } from "./common.js";

/**
 * Globally unique agent identifier. The default ERC-8004 implementation
 * uses a `bigint` (uint256 token id); other implementations may use
 * different opaque IDs. Treat as opaque outside the interface boundary.
 */
export type AgentId = bigint;

/**
 * ERC-8004 RegistrationFile metadata pointer. The on-chain record stores
 * a URI to a JSON document; off-chain consumers resolve it to render or
 * validate.
 */
export interface RegistrationFile {
  agentId: AgentId;
  owner: Address;
  /** URI to the off-chain registration JSON (https://, ipfs://, ar://, ...) */
  metadataUri: string;
  /** Chain where this agent is canonical (per EIP-155). */
  chainId: ChainId;
  /** Optional pre-fetched payload, if the implementation chose to denormalize. */
  metadata?: RegistrationFileMetadata;
}

/**
 * Shape of the JSON document at `metadataUri`. The ERC-8004 spec is loose;
 * fields beyond `name` and `description` are conventional, not mandatory.
 */
export interface RegistrationFileMetadata {
  name?: string;
  description?: string;
  /** Public key for agent-to-agent ECDSA verification (compressed hex). */
  publicKey?: Hex;
  /** Free-form attributes — implementation-defined, never assumed by HDP. */
  attributes?: Record<string, unknown>;
}

/**
 * Result of `register()`. Implementations may surface a transaction hash so
 * callers can poll for finality.
 */
export interface RegisterResult {
  agentId: AgentId;
  txHash?: Hex;
  blockNumber?: number;
}

/**
 * Result of `transfer()`. ERC-8004 agent-as-NFT semantics require the new
 * owner to accept ownership; the implementation hides whether this is a
 * single-tx transfer or a two-step pull pattern.
 */
export interface TransferResult {
  agentId: AgentId;
  previousOwner: Address;
  newOwner: Address;
  txHash?: Hex;
}
