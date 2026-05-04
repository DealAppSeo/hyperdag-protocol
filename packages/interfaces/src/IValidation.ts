import type {
  BFTResult,
  ValidationContext,
  ValidationResult,
  ValidationTask,
  WorkArtifact,
} from "./types/validation.js";

/**
 * IValidation — Validation layer of the HyperDAG modular trust kernel.
 *
 * @description
 * Defines the contract any validation provider MUST satisfy. The default
 * implementation (`@hyperdag/validation-trinity`) wraps Trinity Symphony's
 * φ-weighted BFT validators; conforming alternatives may use any
 * Byzantine-fault-tolerant scheme (committee voting, VRF-selected jurors,
 * stake-weighted multisig, etc.).
 *
 * @contract
 * Implementations MUST:
 *   - Return a deterministic verdict for a given (receiptId, validator) pair.
 *   - Aggregate attestations into a `BFTResult` under an explicit threshold.
 *   - Honor the `repIdGate` parameter on `requestValidation()` — if the
 *     submitter's reputation is below the gate, the implementation MUST
 *     route the artifact through human review (HITL graduation).
 *
 * Implementations MAY:
 *   - Choose any aggregation function and threshold.
 *   - Reject artifacts based on policy (size, content type, etc.).
 *   - Use external compute (validator marketplaces, oracle networks).
 *
 * @hitl
 * The `repIdGate` parameter is structural in v0.1: the parameter exists,
 * and implementations MUST honor it. The exact graduation curve is tuned in
 * v0.5+ and governed by community vote (see GOVERNANCE_ROADMAP.md).
 *
 * @see Default implementation — `packages/defaults/validation-trinity/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface IValidation {
  /**
   * Issue a single-validator validation pass on an existing receipt.
   *
   * @param receiptId The receipt being validated.
   * @param context   Free-form validation context (model, prompt hash, ...).
   */
  validate(receiptId: string, context: ValidationContext): Promise<ValidationResult>;

  /**
   * Aggregate all attestations collected for `receiptId` into a single BFT
   * verdict. Idempotent — calling twice with the same set returns the same
   * result.
   */
  aggregateAttestations(receiptId: string): Promise<BFTResult>;

  /**
   * Submit a work artifact for validation.
   *
   * @param workArtifact The work to validate.
   * @param repIdGate    The submitter's RepID. If below the implementation's
   *                     HITL threshold, the artifact MUST be routed through
   *                     human review before automated validation completes.
   */
  requestValidation(
    workArtifact: WorkArtifact,
    repIdGate: number,
  ): Promise<ValidationTask>;
}
