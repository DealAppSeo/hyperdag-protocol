/**
 * @hyperdag/protocol — Modular trust kernel for AI agents.
 *
 * The user-facing meta-package: re-exports the six interfaces from
 * @hyperdag/interfaces, the six curated defaults from @hyperdag/defaults/*,
 * and exposes a single `createHDP()` factory that wires them together with
 * sensible defaults so first-time users can call `createHDP({})` and get
 * something that works (with stub fallbacks where live services aren't
 * configured).
 *
 * @see ARCHITECTURE.md at the repo root for the full architecture story.
 */

import type {
  IIdentity,
  IReputation,
  IValidation,
  IPayment,
  ILinkage,
  IHallucination,
  ChainId,
  Address,
} from "@hyperdag/interfaces";

import {
  ERC8004IdentityProvider,
  type ERC8004ContractClient,
  type ERC8004IdentityProviderConfig,
} from "@hyperdag/identity-erc8004";

import { ZKPRepIDProvider, type ZKPRepIDProviderConfig } from "@hyperdag/reputation-zkp";

import {
  TrinityValidationProvider,
  type TrinityValidationProviderConfig,
} from "@hyperdag/validation-trinity";

import { X402PaymentProvider, type X402PaymentProviderConfig } from "@hyperdag/payment-x402";

import {
  LinkageRegistryProvider,
  type LinkageRegistryProviderConfig,
} from "@hyperdag/linkage-registry";

import {
  HALHallucinationProvider,
  type HALHallucinationProviderConfig,
} from "@hyperdag/hallucination-hal";

// Re-export interfaces and types so consumers only need this one package.
export * from "@hyperdag/interfaces";

// Re-export default classes for direct construction.
export { ERC8004IdentityProvider } from "@hyperdag/identity-erc8004";
export { ZKPRepIDProvider } from "@hyperdag/reputation-zkp";
export { TrinityValidationProvider } from "@hyperdag/validation-trinity";
export { X402PaymentProvider } from "@hyperdag/payment-x402";
export { LinkageRegistryProvider } from "@hyperdag/linkage-registry";
export { HALHallucinationProvider } from "@hyperdag/hallucination-hal";

/**
 * Composed protocol instance. Each property is the active implementation of
 * the corresponding interface. Override individual layers via `createHDP`'s
 * `overrides` config to plug a third-party implementation.
 */
export interface HDP {
  identity?: IIdentity;
  reputation: IReputation;
  validation: IValidation;
  payment: IPayment;
  linkage: ILinkage;
  hallucination: IHallucination;
}

export type Network =
  | "base-sepolia"
  | "base"
  | "ethereum"
  | "sepolia"
  | (string & {});

const NETWORK_CHAIN_IDS: Record<Network, ChainId> = {
  "base-sepolia": 84532,
  base: 8453,
  ethereum: 1,
  sepolia: 11155111,
};

/**
 * Configuration for `createHDP()`. All fields are optional — the factory
 * uses sensible defaults so a bare `createHDP({})` returns a working
 * (stub-fallback) HDP instance.
 */
export interface HDPConfig {
  /** Network identifier (default: "base-sepolia"). */
  network?: Network;
  /** Override the chain id (default: derived from `network`). */
  chainId?: ChainId;

  /** Optional repID service URL — without it, getScore() will throw. */
  repIdServiceUrl?: string;
  repIdApiKey?: string;

  /** Optional HAL service URL — without it, evaluate() returns a stub HALResult. */
  halServiceUrl?: string;
  halApiKey?: string;

  /** Optional ERC-8004 client — without it, IIdentity is omitted (undefined). */
  erc8004Client?: ERC8004ContractClient;
  /** Optional ERC-8004 registry override. */
  erc8004RegistryAddress?: Address;
  /** Optional default sender for ERC-8004 write operations. */
  defaultSender?: Address;

  /** HITL gate for IValidation (default: 70). */
  hitlGate?: number;

  /** Per-layer overrides. Pass any of these to swap the curated default for
   *  a third-party implementation. */
  overrides?: Partial<{
    identity: IIdentity;
    reputation: IReputation;
    validation: IValidation;
    payment: IPayment;
    linkage: ILinkage;
    hallucination: IHallucination;
  }>;

  /**
   * Per-layer raw config knobs for the curated defaults — useful when you
   * want the default implementation but with non-default settings. Each
   * field is forwarded verbatim to the matching default's constructor.
   */
  defaultsConfig?: Partial<{
    identity: Partial<ERC8004IdentityProviderConfig>;
    reputation: Partial<ZKPRepIDProviderConfig>;
    validation: Partial<TrinityValidationProviderConfig>;
    payment: Partial<X402PaymentProviderConfig>;
    linkage: Partial<LinkageRegistryProviderConfig>;
    hallucination: Partial<HALHallucinationProviderConfig>;
  }>;
}

/**
 * Construct a fully-wired HDP instance using the curated defaults, with any
 * `overrides` swapped in.
 *
 * @example
 * ```typescript
 * const hdp = createHDP({});
 * // Stub HAL fallback (no service URL) — fine for local dev / tests
 *
 * const hdp = createHDP({
 *   halServiceUrl: 'https://hal.hyperdag.dev/api/v1',
 *   halApiKey: process.env.HAL_API_KEY,
 *   repIdServiceUrl: 'https://repid.hyperdag.dev/api/v1',
 *   repIdApiKey: process.env.REPID_API_KEY,
 * });
 * ```
 */
export function createHDP(config: HDPConfig): HDP {
  const network = config.network ?? "base-sepolia";
  const chainId = config.chainId ?? NETWORK_CHAIN_IDS[network] ?? 84532;
  const overrides = config.overrides ?? {};
  const defaultsConfig = config.defaultsConfig ?? {};

  const identity =
    overrides.identity ??
    (config.erc8004Client
      ? new ERC8004IdentityProvider({
          chainId,
          registryAddress: config.erc8004RegistryAddress,
          client: config.erc8004Client,
          defaultSender: config.defaultSender,
          ...defaultsConfig.identity,
        })
      : undefined);

  const reputation =
    overrides.reputation ??
    new ZKPRepIDProvider({
      apiUrl: config.repIdServiceUrl ?? "https://repid.hyperdag.dev/api/v1",
      apiKey: config.repIdApiKey,
      ...defaultsConfig.reputation,
    });

  const validation =
    overrides.validation ??
    new TrinityValidationProvider({
      hitlGate: config.hitlGate,
      ...defaultsConfig.validation,
    });

  const payment =
    overrides.payment ??
    new X402PaymentProvider({
      defaultNetwork: network,
      defaultChainId: chainId,
      ...defaultsConfig.payment,
    });

  const linkage = overrides.linkage ?? new LinkageRegistryProvider({ ...defaultsConfig.linkage });

  const hallucination =
    overrides.hallucination ??
    new HALHallucinationProvider({
      apiUrl: config.halServiceUrl,
      apiKey: config.halApiKey,
      ...defaultsConfig.hallucination,
    });

  return {
    identity,
    reputation,
    validation,
    payment,
    linkage,
    hallucination,
  };
}
