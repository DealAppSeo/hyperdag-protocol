# @hyperdag/payment-x402

Default x402 implementation of `@hyperdag/interfaces`#`IPayment`.

Pure transport-level implementation of the x402 spec — constructs the
`PaymentRequired` envelope and parses `X-PAYMENT` headers. Settlement
verification is delegated via injected verifier so this package does NOT
take a hard dependency on viem/ethers/Coinbase Pay or any specific RPC.

## Provenance

- Public spec: x402 — https://github.com/coinbase/x402
- Reference shape: `repid-engine/src/services/x402-server.ts`
  (commit `204cfcbe93f85f8cb0ccdc969d2cc4003129c1db` at sprint time) —
  envelope structure adapted to be transport-level (Supabase coupling
  removed).
- License: Apache-2.0

## Usage

```typescript
import { X402PaymentProvider } from '@hyperdag/payment-x402';

const payment = new X402PaymentProvider({
  defaultAsset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC Base Sepolia
  defaultNetwork: 'base-sepolia',
  defaultChainId: 84532,
  // Optional verifier — without one, verifyProof always returns false.
  verifier: async (proof) => myOnChainVerifier(proof),
});

const required = await payment.createPaymentRequired(
  1_000_000n, // 1.0 USDC (6 decimals)
  '0xRecipient...',
  '/api/v1/tip/deliver/abc',
);
```

## v0.2 plan

Bundle a default verifier for Base Sepolia that uses a published facilitator
URL, so out-of-the-box `verifyProof` works without injection.

## License

Apache-2.0.
