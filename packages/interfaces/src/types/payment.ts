import type { Address, ChainId, Hex } from "./common.js";

/**
 * x402 PaymentRequired envelope. Returned by a server to instruct the client
 * to present a payment proof in the next request's `X-PAYMENT` header.
 *
 * The shape mirrors the x402 spec; `extra` holds implementation-specific
 * payload (asset metadata, settlement timing hints, etc.).
 */
export interface PaymentRequired {
  /** "exact" for fixed-amount, "upTo" for capped, etc. */
  scheme: "exact" | "upTo" | string;
  /** EIP-3009 / x402 supported network identifier ("base-sepolia", "base", ...). */
  network: string;
  chainId: ChainId;
  /** Amount in smallest unit of `asset`. */
  maxAmountRequired: bigint;
  /** Token contract or "native". */
  asset: Address | "native";
  /** Recipient of the settled payment. */
  payTo: Address;
  /** Resource URL the payment unlocks. */
  resource: string;
  /** Optional facilitator URL the client can use to settle. */
  facilitatorUrl?: string;
  /** Implementation-specific extension. */
  extra?: Record<string, unknown>;
}

/**
 * Parsed `X-PAYMENT` header — decoded from base64 by the implementation.
 */
export interface PaymentProof {
  scheme: string;
  network: string;
  /** Proof payload (e.g., signed EIP-3009 transferWithAuthorization). */
  payload: Record<string, unknown>;
  /** Settlement transaction hash, once observed. */
  txHash?: Hex;
}
