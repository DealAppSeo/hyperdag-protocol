/**
 * Source: trinity-symphony-shared/lib/receipt-validation/ReceiptValidator.js
 *   (commit c7308617a98a58fd6fde308d87f5df3b9e443969 at sprint time)
 *   trinity-symphony-shared/lib/MathConstants.js
 * v0.1.0-alpha provenance: TypeScript port of the public ReceiptValidator,
 *   adapted to the IValidation interface. Dependencies (schema validator,
 *   attestation store) are injected via constructor instead of module-loaded.
 * v0.2 plan: refactor to consume a published @hyperdag/validation-trinity-source
 *   package once the BFT mesh is publicly callable.
 * License: Apache-2.0
 */

import type {
  IValidation,
  AgentId,
  BFTResult,
  ValidationContext,
  ValidationResult,
  ValidationTask,
  ValidatorAttestation,
  WorkArtifact,
} from "@hyperdag/interfaces";

/**
 * Constants — public per CLAUDE.md ("Pythagorean Comma: 531441/524288 ≈ 1.013643",
 * "BFT_THRESHOLD = 0.618"). DISSONANCE_THRESHOLD is 0.0136 (the comma minus 1,
 * floored at 4 decimals).
 */
export const BFT_THRESHOLD = 0.618;
export const PYTHAGOREAN_COMMA = 531441 / 524288;
export const DISSONANCE_THRESHOLD = 0.0136;

/** Default HITL gate from CLAUDE.md (`REPID_HITL_GATE = 70`). */
export const DEFAULT_HITL_GATE = 70;

/**
 * Pluggable attestation store. Replaceable with on-chain or DB-backed stores;
 * the default is in-memory.
 */
export interface AttestationStore {
  put(receiptId: string, attestation: ValidatorAttestation): Promise<void>;
  list(receiptId: string): Promise<ValidatorAttestation[]>;
}

export class InMemoryAttestationStore implements AttestationStore {
  private readonly map = new Map<string, ValidatorAttestation[]>();
  async put(receiptId: string, attestation: ValidatorAttestation): Promise<void> {
    const arr = this.map.get(receiptId) ?? [];
    arr.push(attestation);
    this.map.set(receiptId, arr);
  }
  async list(receiptId: string): Promise<ValidatorAttestation[]> {
    return this.map.get(receiptId) ?? [];
  }
}

/**
 * Strategy for producing a single validator's verdict on demand. Real
 * deployments inject a strategy that calls out to the live validator mesh;
 * v0.1 ships a stub-friendly local strategy.
 */
export interface ValidatorStrategy {
  /** This strategy's identifying agent id (for attestation provenance). */
  validatorAgentId: AgentId;
  /**
   * Produce a verdict in -1..+1 for the given receipt and context.
   * Returning a verdict outside the range will be clamped by the provider.
   */
  vote(receiptId: string, context: ValidationContext): Promise<{ verdict: number; reasoning?: string; signature: `0x${string}` }>;
}

export interface TrinityValidationProviderConfig {
  hitlGate?: number;
  store?: AttestationStore;
  /** Validator strategies that compose this provider's verdict. */
  validators?: ValidatorStrategy[];
}

export class TrinityValidationProvider implements IValidation {
  private readonly hitlGate: number;
  private readonly store: AttestationStore;
  private readonly validators: ValidatorStrategy[];

  constructor(config: TrinityValidationProviderConfig = {}) {
    this.hitlGate = config.hitlGate ?? DEFAULT_HITL_GATE;
    this.store = config.store ?? new InMemoryAttestationStore();
    this.validators = config.validators ?? [];
  }

  async validate(receiptId: string, context: ValidationContext): Promise<ValidationResult> {
    if (this.validators.length === 0) {
      throw new Error(
        "TrinityValidationProvider.validate: no validator strategies configured. " +
          "Pass `validators` in the constructor to enable single-validator passes.",
      );
    }
    const v = this.validators[0]!;
    const vote = await v.vote(receiptId, context);
    const attestation: ValidatorAttestation = {
      validatorAgentId: v.validatorAgentId,
      verdict: clamp(vote.verdict, -1, 1),
      reasoning: vote.reasoning,
      signature: vote.signature,
    };
    await this.store.put(receiptId, attestation);
    return {
      receiptId,
      attestation,
      humanReviewRequired: false,
    };
  }

  async aggregateAttestations(receiptId: string): Promise<BFTResult> {
    const attestations = await this.store.list(receiptId);
    if (attestations.length === 0) {
      return {
        receiptId,
        verdict: 0,
        threshold: BFT_THRESHOLD,
        consensusReached: false,
        attestations: [],
      };
    }
    const decisive = attestations.filter((a) => a.verdict !== 0);

    // Pythagorean Comma BFT veto override (P-003): one decisive veto wins
    // when the dissonance gap exceeds the comma threshold.
    const dissonance = PYTHAGOREAN_COMMA - 1;
    const hasVeto = decisive.some((a) => a.verdict < 0);
    if (hasVeto && dissonance >= DISSONANCE_THRESHOLD) {
      return {
        receiptId,
        verdict: -1,
        threshold: BFT_THRESHOLD,
        consensusReached: true,
        attestations,
      };
    }

    // Otherwise φ-weighted majority on positive verdicts.
    const passCount = decisive.filter((a) => a.verdict > 0).length;
    const passRatio = decisive.length === 0 ? 0 : passCount / decisive.length;
    const consensusReached = passRatio >= BFT_THRESHOLD;
    return {
      receiptId,
      verdict: consensusReached ? 1 : 0,
      threshold: BFT_THRESHOLD,
      consensusReached,
      attestations,
    };
  }

  async requestValidation(workArtifact: WorkArtifact, repIdGate: number): Promise<ValidationTask> {
    const awaitingHuman = repIdGate < this.hitlGate;
    return {
      taskId: `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      receiptId: workArtifact.receiptId,
      status: awaitingHuman ? "queued" : "in_progress",
      awaitingHuman,
    };
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
