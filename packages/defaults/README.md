# @hyperdag/defaults

Curated default implementations of the six `@hyperdag/interfaces` contracts.

| Default package | Implements | Notes |
| :--- | :--- | :--- |
| [`@hyperdag/identity-erc8004`](./identity-erc8004) | `IIdentity` | Thin viem-shaped client over ERC-8004 IdentityRegistry |
| [`@hyperdag/reputation-zkp`](./reputation-zkp) | `IReputation` | HTTP client over the proprietary RepID engine |
| [`@hyperdag/validation-trinity`](./validation-trinity) | `IValidation` | Trinity Symphony BFT, Pythagorean Comma veto, HITL gate |
| [`@hyperdag/payment-x402`](./payment-x402) | `IPayment` | Transport-level x402 envelope + parsing, injectable verifier |
| [`@hyperdag/linkage-registry`](./linkage-registry) | `ILinkage` | In-memory inverse-stake registry stub (v0.2 → on-chain) |
| [`@hyperdag/hallucination-hal`](./hallucination-hal) | `IHallucination` | HAL service client + clearly-marked stub fallback |

This is a directory of independent npm packages, not itself a publishable
package. Use `@hyperdag/protocol` to consume the curated set in one go.
