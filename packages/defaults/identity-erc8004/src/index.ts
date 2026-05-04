/**
 * Source: hyperdag-protocol/packages/contracts/contracts/IdentityRegistryUpgradeable.sol
 * Original spec: packages/contracts/ERC8004SPEC.md (Marco De Rossi)
 * Deployed (Base Sepolia): 0x8004A818BFB912233c491871b3d84c89A494BD9e
 * v0.1.0-alpha provenance: this is a thin TypeScript wrapper over the on-chain
 * ERC-8004 IdentityRegistry. The contract is the source of truth.
 * v0.2 plan: refactor to consume a published @hyperdag/identity-erc8004-source
 * package so third parties can use the wrapper without cloning the monorepo.
 * License: Apache-2.0
 */

import type {
  IIdentity,
  Address,
  AgentId,
  ChainId,
  RegisterResult,
  RegistrationFile,
  RegistrationFileMetadata,
  TransferResult,
} from "@hyperdag/interfaces";

/**
 * Minimal contract-shape interface so we don't take a hard viem/ethers
 * dependency at the package level. Consumers inject a client that knows
 * how to call the registry.
 */
export interface ERC8004ContractClient {
  /** Read `agents(agentId)` — returns owner, metadataUri. */
  readAgent(agentId: AgentId): Promise<{ owner: Address; metadataUri: string } | null>;
  /** Write `register(metadataUri, owner)` — returns the new agentId. */
  register(metadataUri: string, owner: Address): Promise<{ agentId: AgentId; txHash?: `0x${string}`; blockNumber?: number }>;
  /** Write `transferFrom(from, to, agentId)` (or equivalent NFT transfer). */
  transfer(agentId: AgentId, from: Address, to: Address): Promise<{ txHash?: `0x${string}` }>;
}

export interface ERC8004IdentityProviderConfig {
  /** Chain on which the registry is deployed. Default: Base Sepolia (84532). */
  chainId?: ChainId;
  /** Registry contract address. Default: deployed Base Sepolia vanity address. */
  registryAddress?: Address;
  /** Pre-built contract client. Required for any registry interaction. */
  client: ERC8004ContractClient;
  /** Default sender for write ops (so callers don't need to pass it every call). */
  defaultSender?: Address;
}

const DEFAULT_REGISTRY_BASE_SEPOLIA: Address = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

export class ERC8004IdentityProvider implements IIdentity {
  readonly chainId: ChainId;
  readonly registryAddress: Address;
  private readonly client: ERC8004ContractClient;
  private readonly defaultSender?: Address;

  constructor(config: ERC8004IdentityProviderConfig) {
    this.chainId = config.chainId ?? 84532;
    this.registryAddress = config.registryAddress ?? DEFAULT_REGISTRY_BASE_SEPOLIA;
    this.client = config.client;
    this.defaultSender = config.defaultSender;
  }

  async register(
    metadata: RegistrationFileMetadata & { metadataUri: string },
  ): Promise<RegisterResult> {
    if (!this.defaultSender) {
      throw new Error("ERC8004IdentityProvider.register: no defaultSender configured");
    }
    const out = await this.client.register(metadata.metadataUri, this.defaultSender);
    return {
      agentId: out.agentId,
      txHash: out.txHash,
      blockNumber: out.blockNumber,
    };
  }

  async resolve(agentId: AgentId): Promise<RegistrationFile> {
    const row = await this.client.readAgent(agentId);
    if (!row) {
      throw new Error(`ERC8004IdentityProvider.resolve: agent ${agentId} not found`);
    }
    return {
      agentId,
      owner: row.owner,
      metadataUri: row.metadataUri,
      chainId: this.chainId,
    };
  }

  async transfer(agentId: AgentId, newOwner: Address): Promise<TransferResult> {
    const current = await this.resolve(agentId);
    const out = await this.client.transfer(agentId, current.owner, newOwner);
    return {
      agentId,
      previousOwner: current.owner,
      newOwner,
      txHash: out.txHash,
    };
  }
}
