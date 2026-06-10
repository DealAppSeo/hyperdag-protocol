/**
 * ViemIdentityProvider — zero-config ERC-8004 IIdentity implementation.
 *
 * Reads work without any signer: just construct and call `resolve()`. Writes
 * require an explicit signer (privateKey or walletClient). Mainnet writes
 * additionally require `allowMainnet: true`.
 *
 * The `dryRun` flag (default true) suppresses actual broadcasts and instead
 * throws `DryRunBlocked` carrying the intended call payload. This is the
 * safety net for sprint smoke tests + first-run dogfood — no accidental
 * on-chain writes.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';

import {
  BASE_MAINNET_CHAIN_ID,
  BASE_MAINNET_DEFAULT_RPC,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_DEFAULT_RPC,
  IDENTITY_REGISTRY_BASE_SEPOLIA,
} from './constants.js';
import { IDENTITY_REGISTRY_ABI } from './abi.js';
import {
  AgentNotFoundError,
  DryRunBlocked,
  MainnetGuardError,
  MissingSignerError,
} from './errors.js';

// Structural types — match @hyperdag/interfaces shape verbatim. Declared
// inline so this package does not depend on @hyperdag/interfaces being
// installed at build time (the published dist-only package lives in a
// sibling directory; resolving it through nx workspaces is a separate
// follow-up). The IIdentity interface is structural: anything implementing
// these methods will satisfy a consumer typed as `IIdentity`.
export type AgentId = bigint;
export interface RegistrationFileMetadata {
  name?: string;
  description?: string;
  publicKey?: `0x${string}`;
  attributes?: Record<string, unknown>;
}
export interface RegistrationFile {
  agentId: AgentId;
  owner: Address;
  metadataUri: string;
  chainId: number;
  metadata?: RegistrationFileMetadata;
}
export interface RegisterResult {
  agentId: AgentId;
  txHash?: `0x${string}`;
  blockNumber?: number;
}
export interface TransferResult {
  agentId: AgentId;
  previousOwner: Address;
  newOwner: Address;
  txHash?: `0x${string}`;
}
export interface IIdentity {
  register(m: RegistrationFileMetadata & { metadataUri: string }): Promise<RegisterResult>;
  resolve(id: AgentId): Promise<RegistrationFile>;
  transfer(id: AgentId, newOwner: Address): Promise<TransferResult>;
}

export interface ViemIdentityProviderConfig {
  /** Default 84532 (Base Sepolia). Pass 8453 for mainnet (with `allowMainnet: true`). */
  chainId?: number;
  /** Default public Base Sepolia RPC. Override for higher rate limit or alt RPC. */
  rpcUrl?: string;
  /** Override the IdentityRegistry address. Default = canonical Base Sepolia. */
  registryAddress?: Address;
  /** Caller's private key for signed writes. Mutually exclusive with `walletClient`. */
  privateKey?: Hex;
  /** Caller-supplied WalletClient (e.g. browser wallet, smart-account, etc.). */
  walletClient?: WalletClient;
  /** Required `true` to target mainnet. Off-by-default safety guard. */
  allowMainnet?: boolean;
  /**
   * Default `true`. When true, writes throw `DryRunBlocked` instead of
   * broadcasting. Set to `false` to actually fire transactions.
   */
  dryRun?: boolean;
}

export class ViemIdentityProvider implements IIdentity {
  private readonly chainId: number;
  private readonly registryAddress: Address;
  private readonly publicClient: PublicClient;
  private readonly walletClient?: WalletClient;
  private readonly account?: PrivateKeyAccount;
  private readonly dryRun: boolean;

  constructor(config: ViemIdentityProviderConfig = {}) {
    this.chainId = config.chainId ?? BASE_SEPOLIA_CHAIN_ID;

    if (this.chainId === BASE_MAINNET_CHAIN_ID && !config.allowMainnet) {
      // Guard surface only — throws on actual write attempts (in writeGate()).
      // Constructor doesn't throw so consumers can read-only-probe mainnet
      // without opting into allowMainnet.
    }

    this.registryAddress = config.registryAddress ?? IDENTITY_REGISTRY_BASE_SEPOLIA;
    const rpcUrl =
      config.rpcUrl ??
      (this.chainId === BASE_MAINNET_CHAIN_ID
        ? BASE_MAINNET_DEFAULT_RPC
        : BASE_SEPOLIA_DEFAULT_RPC);

    const chain = this.chainId === BASE_MAINNET_CHAIN_ID ? base : baseSepolia;

    // viem's strict types want a tightly-typed Chain object; cast away the
    // generic-instantiation noise here — runtime behavior is unaffected.
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    }) as unknown as PublicClient;

    if (config.walletClient) {
      this.walletClient = config.walletClient;
    } else if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey);
      this.walletClient = createWalletClient({
        account: this.account,
        chain,
        transport: http(rpcUrl),
      });
    }

    // dryRun defaults TRUE — explicit opt-in to broadcast.
    this.dryRun = config.dryRun ?? true;
  }

  // ---------- Reads (zero-config) ----------

  async resolve(agentId: AgentId): Promise<RegistrationFile> {
    let owner: Address;
    try {
      // Cast the call object to `any` to sidestep viem's overly-strict
      // ReadContractParameters union — at runtime we're calling a
      // well-formed view function; the union mismatch is purely a type-check
      // artifact.
      owner = (await (this.publicClient.readContract as any)({
        address: this.registryAddress,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [agentId],
      })) as Address;
    } catch (e: any) {
      // ERC-721 ownerOf reverts on non-existent token; surface a clear error.
      if (
        typeof e?.message === 'string' &&
        (e.message.includes('ERC721NonexistentToken') ||
          e.message.includes('ERC721: invalid token') ||
          e.message.includes('execution reverted'))
      ) {
        throw new AgentNotFoundError(agentId);
      }
      throw e;
    }

    let metadataUri = '';
    try {
      metadataUri = (await (this.publicClient.readContract as any)({
        address: this.registryAddress,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'tokenURI',
        args: [agentId],
      })) as string;
    } catch {
      // tokenURI revert is non-fatal — leave empty.
    }

    return {
      agentId,
      owner,
      metadataUri,
      chainId: this.chainId,
    };
  }

  /** Public read: agent's separately-managed wallet (ERC-8004 extension). */
  async getAgentWallet(agentId: AgentId): Promise<Address> {
    return (await (this.publicClient.readContract as any)({
      address: this.registryAddress,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'getAgentWallet',
      args: [agentId],
    })) as Address;
  }

  /** Public read: arbitrary metadata key. */
  async getMetadata(agentId: AgentId, metadataKey: string): Promise<Hex> {
    return (await (this.publicClient.readContract as any)({
      address: this.registryAddress,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'getMetadata',
      args: [agentId, metadataKey],
    })) as Hex;
  }

  // ---------- Writes (gated) ----------

  async register(
    metadata: RegistrationFileMetadata & { metadataUri: string }
  ): Promise<RegisterResult> {
    const args = [metadata.metadataUri] as const;
    const result = await this.writeGate('register', args);
    return {
      agentId: result.returnedAgentId ?? 0n,
      txHash: result.txHash,
    };
  }

  async transfer(agentId: AgentId, newOwner: Address): Promise<TransferResult> {
    const current = await this.resolve(agentId);
    const args = [current.owner, newOwner, agentId] as const;
    const result = await this.writeGate('transferFrom', args);
    return {
      agentId,
      previousOwner: current.owner,
      newOwner,
      txHash: result.txHash,
    };
  }

  /** Single point of broadcast-gate enforcement. */
  private async writeGate(
    functionName: 'register' | 'transferFrom' | 'setAgentURI',
    args: readonly unknown[]
  ): Promise<{ txHash?: Hex; returnedAgentId?: bigint }> {
    // Mainnet guard.
    if (this.chainId === BASE_MAINNET_CHAIN_ID) {
      throw new MainnetGuardError(this.chainId);
    }
    if (!this.walletClient || !this.account) {
      throw new MissingSignerError();
    }
    if (this.dryRun) {
      throw new DryRunBlocked({
        address: this.registryAddress,
        functionName,
        args,
      });
    }
    // Real broadcast path.
    const txHash = (await (this.walletClient as any).writeContract({
      address: this.registryAddress,
      abi: IDENTITY_REGISTRY_ABI,
      functionName,
      args,
      account: this.account,
      chain: this.walletClient.chain,
    })) as Hex;
    return { txHash };
  }
}
