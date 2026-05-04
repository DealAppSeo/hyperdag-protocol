import type { Address } from "./types/common.js";
import type {
  AgentId,
  RegisterResult,
  RegistrationFile,
  RegistrationFileMetadata,
  TransferResult,
} from "./types/identity.js";

/**
 * IIdentity — Identity layer of the HyperDAG modular trust kernel.
 *
 * @description
 * Defines the contract any identity provider MUST satisfy to plug into the
 * HyperDAG Protocol composition. The default implementation
 * (`@hyperdag/identity-erc8004`) wraps the ERC-8004 IdentityRegistry, but
 * conforming alternatives may use DIDs, ENS sub-records, off-chain registries,
 * or hybrid approaches.
 *
 * @contract
 * Implementations MUST:
 *   - Return globally unique `AgentId`s within their namespace.
 *   - Make `resolve(agentId)` deterministic for the lifetime of an agent.
 *   - Surface ownership as a first-class property (so transfer is semantically
 *     meaningful, not just a metadata edit).
 *
 * Implementations MAY:
 *   - Add identity attestation extensions (KYC, audit, ENS, etc.) under
 *     `RegistrationFileMetadata.attributes`.
 *   - Use any underlying chain or off-chain registry, as long as `resolve`
 *     is callable from the consumer's runtime.
 *   - Reject `register()` calls based on policy (rate limit, allowlist, etc.).
 *
 * @see ERC-8004 — https://eips.ethereum.org/EIPS/eip-8004
 * @see Default implementation — `packages/defaults/identity-erc8004/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface IIdentity {
  /**
   * Register a new agent.
   *
   * @param metadata Initial registration metadata (uri, public key, attributes).
   *                 Implementations may store the metadata document anywhere
   *                 addressable by URI.
   * @returns The newly-issued AgentId, plus optional tx hash for finality polling.
   */
  register(metadata: RegistrationFileMetadata & { metadataUri: string }): Promise<RegisterResult>;

  /**
   * Resolve an agent's RegistrationFile.
   *
   * @param agentId The agent to resolve.
   * @throws If the agent does not exist (implementation-defined error type).
   */
  resolve(agentId: AgentId): Promise<RegistrationFile>;

  /**
   * Transfer ownership of an agent.
   *
   * @param agentId   The agent being transferred.
   * @param newOwner  The recipient address.
   * @returns Transfer result describing the new ownership state.
   *
   * @remarks
   * Some implementations use a two-step pull pattern (the new owner must
   * accept). The interface intentionally hides this; call `resolve()` to
   * confirm the new owner.
   */
  transfer(agentId: AgentId, newOwner: Address): Promise<TransferResult>;
}
