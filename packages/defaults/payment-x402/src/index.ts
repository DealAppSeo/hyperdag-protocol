/**
 * Source: x402 spec — https://github.com/coinbase/x402
 *   Reference shape: repid-engine/src/services/x402-server.ts
 *   (commit 204cfcbe93f85f8cb0ccdc969d2cc4003129c1db at sprint time)
 * v0.1.0-alpha provenance: transport-level x402 — envelope construction +
 *   X-PAYMENT parsing. Settlement verification is injected so this package
 *   has no hard chain dependency.
 * v0.2 plan: bundle a default verifier for Base Sepolia with a published
 *   facilitator URL.
 * License: Apache-2.0
 */

import type {
  IPayment,
  Address,
  ChainId,
  PaymentProof,
  PaymentRequired,
} from "@hyperdag/interfaces";

export type ProofVerifier = (proof: PaymentProof) => Promise<boolean>;

export interface X402PaymentProviderConfig {
  /** Default scheme for `createPaymentRequired`. Default: "exact". */
  defaultScheme?: PaymentRequired["scheme"];
  /** Default network identifier. Default: "base-sepolia". */
  defaultNetwork?: string;
  /** Default chainId. Default: 84532. */
  defaultChainId?: ChainId;
  /** Default settlement asset. Default: USDC on Base Sepolia. */
  defaultAsset?: Address | "native";
  /** Default facilitator URL clients can use to settle. */
  defaultFacilitatorUrl?: string;
  /** Pluggable verifier — without one, verifyProof returns false. */
  verifier?: ProofVerifier;
}

const USDC_BASE_SEPOLIA: Address = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export class X402PaymentProvider implements IPayment {
  private readonly defaultScheme: PaymentRequired["scheme"];
  private readonly defaultNetwork: string;
  private readonly defaultChainId: ChainId;
  private readonly defaultAsset: Address | "native";
  private readonly defaultFacilitatorUrl?: string;
  private readonly verifier?: ProofVerifier;

  constructor(config: X402PaymentProviderConfig = {}) {
    this.defaultScheme = config.defaultScheme ?? "exact";
    this.defaultNetwork = config.defaultNetwork ?? "base-sepolia";
    this.defaultChainId = config.defaultChainId ?? 84532;
    this.defaultAsset = config.defaultAsset ?? USDC_BASE_SEPOLIA;
    this.defaultFacilitatorUrl = config.defaultFacilitatorUrl;
    this.verifier = config.verifier;
  }

  async createPaymentRequired(
    amount: bigint,
    recipient: Address,
    resource?: string,
  ): Promise<PaymentRequired> {
    return {
      scheme: this.defaultScheme,
      network: this.defaultNetwork,
      chainId: this.defaultChainId,
      maxAmountRequired: amount,
      asset: this.defaultAsset,
      payTo: recipient,
      resource: resource ?? "",
      facilitatorUrl: this.defaultFacilitatorUrl,
    };
  }

  async parsePaymentProof(headerValue: string): Promise<PaymentProof> {
    if (!headerValue || typeof headerValue !== "string") {
      throw new Error("X402PaymentProvider.parsePaymentProof: empty header");
    }
    // x402 sends X-PAYMENT base64-encoded JSON.
    let decoded: string;
    try {
      decoded = Buffer.from(headerValue, "base64").toString("utf8");
    } catch {
      throw new Error("X402PaymentProvider.parsePaymentProof: header is not valid base64");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(decoded);
    } catch {
      throw new Error("X402PaymentProvider.parsePaymentProof: decoded body is not valid JSON");
    }
    const obj = parsed as Record<string, unknown>;
    return {
      scheme: typeof obj["scheme"] === "string" ? (obj["scheme"] as string) : this.defaultScheme,
      network: typeof obj["network"] === "string" ? (obj["network"] as string) : this.defaultNetwork,
      payload: (obj["payload"] as Record<string, unknown>) ?? {},
      txHash: typeof obj["txHash"] === "string" ? (obj["txHash"] as `0x${string}`) : undefined,
    };
  }

  async verifyProof(proof: PaymentProof): Promise<boolean> {
    if (!this.verifier) return false;
    return this.verifier(proof);
  }
}
