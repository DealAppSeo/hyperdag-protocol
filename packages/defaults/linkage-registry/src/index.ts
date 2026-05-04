/**
 * Source: HDP Linkage Registry (P-002 — inverse-stake curve)
 *   No canonical source impl exists yet at sprint time; this is the reference
 *   v0.1 implementation, in-memory.
 * v0.1.0-alpha provenance: stub registry — backs the interface with an in-memory
 *   store and a default inverse-stake curve. No on-chain backing yet.
 * v0.2 plan: deploy LinkageRegistry as a sibling to ERC-8004 IdentityRegistry
 *   and ReputationRegistry; refactor this package into a thin viem client.
 * License: Apache-2.0
 */

import type {
  ILinkage,
  AgentId,
  HumanRepId,
  Linkage,
  LinkageReceipt,
  StakeAmount,
  UnbindResult,
} from "@hyperdag/interfaces";

/**
 * Inverse-stake curve. Implementation-defined; replaceable by passing a
 * different `stakeCurve` to the provider constructor.
 *
 * @param humanRepIdScore RepID score in 0..10000 (or 0 if unknown).
 * @returns Required stake in USDT smallest units (6 decimals).
 */
export type StakeCurve = (humanRepIdScore: number) => StakeAmount;

/** Default curve used by `LinkageRegistryProvider` when none is injected. */
export const DEFAULT_STAKE_CURVE: StakeCurve = (score) => {
  const BASE_STAKE = 1_000_000_000n; // 1000 USDT (6 decimals)
  const STAKE_FLOOR = 10_000_000n; // 10 USDT
  const SCALE = 12000;
  const safe = Math.max(0, Math.min(10000, score));
  // (BASE_STAKE * (SCALE - safe)) / SCALE — bigint-safe linear inverse.
  const calc = (BASE_STAKE * BigInt(SCALE - safe)) / BigInt(SCALE);
  return calc < STAKE_FLOOR ? STAKE_FLOOR : calc;
};

/**
 * Lookup of a human's RepID score for the inverse-stake curve.
 * In production this should call the IReputation provider; v0.1 default is
 * "unknown ⇒ 0 ⇒ max stake required."
 */
export type HumanRepIdLookup = (humanRepId: HumanRepId) => Promise<number>;

const DEFAULT_LOOKUP: HumanRepIdLookup = async () => 0;

export interface LinkageRegistryProviderConfig {
  stakeCurve?: StakeCurve;
  humanRepIdLookup?: HumanRepIdLookup;
  /** Delay before unbind releases stake (seconds). Default: 7 days. */
  unbindDelaySeconds?: number;
}

interface InternalLinkage extends Linkage {
  contentHash: `0x${string}`;
  releasableAt?: number;
}

const DEFAULT_UNBIND_DELAY = 7 * 24 * 60 * 60;

export class LinkageRegistryProvider implements ILinkage {
  private readonly stakeCurve: StakeCurve;
  private readonly lookup: HumanRepIdLookup;
  private readonly unbindDelaySeconds: number;
  private readonly byId = new Map<string, InternalLinkage>();
  private readonly byHuman = new Map<HumanRepId, string>();
  private readonly byAgent = new Map<string, string>();

  constructor(config: LinkageRegistryProviderConfig = {}) {
    this.stakeCurve = config.stakeCurve ?? DEFAULT_STAKE_CURVE;
    this.lookup = config.humanRepIdLookup ?? DEFAULT_LOOKUP;
    this.unbindDelaySeconds = config.unbindDelaySeconds ?? DEFAULT_UNBIND_DELAY;
  }

  async requiredStake(humanRepId: HumanRepId): Promise<StakeAmount> {
    const score = await this.lookup(humanRepId);
    return this.stakeCurve(score);
  }

  async bindHumanToAgent(
    humanRepId: HumanRepId,
    agentId: AgentId,
    stake: StakeAmount,
  ): Promise<LinkageReceipt> {
    const required = await this.requiredStake(humanRepId);
    if (stake < required) {
      throw new Error(
        `LinkageRegistryProvider.bindHumanToAgent: insufficient stake (${stake} < required ${required})`,
      );
    }
    if (this.byHuman.has(humanRepId)) {
      throw new Error(`LinkageRegistryProvider.bindHumanToAgent: human ${humanRepId} is already bound`);
    }
    const agentKey = agentId.toString();
    if (this.byAgent.has(agentKey)) {
      throw new Error(`LinkageRegistryProvider.bindHumanToAgent: agent ${agentKey} is already bound`);
    }
    const linkageId = `link_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const contentHash = ("0x" + sha256ish(`${humanRepId}|${agentKey}|${stake.toString()}|${linkageId}`)) as `0x${string}`;
    const linkage: InternalLinkage = {
      linkageId,
      humanRepId,
      agentId,
      stake,
      status: "active",
      boundAt: Math.floor(Date.now() / 1000),
      contentHash,
    };
    this.byId.set(linkageId, linkage);
    this.byHuman.set(humanRepId, linkageId);
    this.byAgent.set(agentKey, linkageId);
    return {
      linkageId,
      humanRepId,
      agentId,
      stake,
      contentHash,
    };
  }

  async unbind(linkageId: string): Promise<UnbindResult> {
    const linkage = this.byId.get(linkageId);
    if (!linkage) {
      throw new Error(`LinkageRegistryProvider.unbind: linkage ${linkageId} not found`);
    }
    const releasableAt = Math.floor(Date.now() / 1000) + this.unbindDelaySeconds;
    linkage.status = "unbinding";
    linkage.releasableAt = releasableAt;
    return {
      linkageId,
      status: "unbinding",
      releasableAt,
    };
  }

  async getLinkage(humanRepIdOrAgentId: HumanRepId | AgentId): Promise<Linkage> {
    let id: string | undefined;
    if (typeof humanRepIdOrAgentId === "bigint") {
      id = this.byAgent.get(humanRepIdOrAgentId.toString());
    } else {
      id = this.byHuman.get(humanRepIdOrAgentId);
    }
    if (!id) {
      throw new Error(`LinkageRegistryProvider.getLinkage: not found for ${String(humanRepIdOrAgentId)}`);
    }
    const linkage = this.byId.get(id)!;
    return {
      linkageId: linkage.linkageId,
      humanRepId: linkage.humanRepId,
      agentId: linkage.agentId,
      stake: linkage.stake,
      status: linkage.status,
      boundAt: linkage.boundAt,
    };
  }
}

/**
 * Tiny non-cryptographic hash for in-memory content addressing. NOT a real
 * keccak — replaced with the actual hash function in the on-chain backing.
 */
function sha256ish(s: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < s.length; i++) {
    ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  const out = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, "0");
  return out.repeat(4);
}
