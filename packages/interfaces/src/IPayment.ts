import type { Address } from "./types/common.js";
import type { PaymentProof, PaymentRequired } from "./types/payment.js";

/**
 * IPayment — Payment layer of the HyperDAG modular trust kernel.
 *
 * @description
 * Defines the contract any payment provider MUST satisfy. The default
 * implementation (`@hyperdag/payment-x402`) implements the x402 spec —
 * HTTP 402 Payment Required as a settled, agent-friendly micropayment
 * primitive. Conforming alternatives may use Lightning, ERC-3009 directly,
 * Stripe, or any payment rail; the interface only requires the request /
 * proof / verify shape.
 *
 * @contract
 * Implementations MUST:
 *   - Produce a `PaymentRequired` envelope containing enough information for
 *     a client to present a valid proof.
 *   - Parse `X-PAYMENT` headers (or equivalent) into a `PaymentProof`.
 *   - Verify proofs without trusting the client (cryptographic verification
 *     against the underlying settlement layer).
 *
 * Implementations MAY:
 *   - Use any settlement asset, network, or facilitator.
 *   - Add scheme extensions via `PaymentRequired.extra`.
 *
 * @see x402 spec — https://github.com/coinbase/x402
 * @see Default implementation — `packages/defaults/payment-x402/`
 *
 * @versioning
 * This interface is versioned independently. Breaking changes will increment
 * the major version of `@hyperdag/interfaces`. Compatible implementations
 * receive a 12-month backward-compat guarantee.
 */
export interface IPayment {
  /**
   * Construct a `PaymentRequired` envelope to return to the client (typically
   * as the JSON body of an HTTP 402 response).
   *
   * @param amount    Amount required (smallest unit of the chosen asset).
   * @param recipient Settlement recipient address.
   * @param resource  Optional resource URL the payment unlocks.
   */
  createPaymentRequired(
    amount: bigint,
    recipient: Address,
    resource?: string,
  ): Promise<PaymentRequired>;

  /**
   * Parse the `X-PAYMENT` header value (or body field) into a `PaymentProof`.
   * Does NOT validate the proof — call `verifyProof()` for that.
   */
  parsePaymentProof(headerValue: string): Promise<PaymentProof>;

  /**
   * Verify that the proof is valid (correctly signed, unspent, sufficient
   * amount, addressed to the right recipient and resource).
   */
  verifyProof(proof: PaymentProof): Promise<boolean>;
}
