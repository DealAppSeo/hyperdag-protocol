# @hyperdag/interfaces

TypeScript interface contracts for the HyperDAG Protocol modular trust kernel.

This package defines **six interfaces** — one per layer of the kernel — that
together describe HDP's composition contract. Implementations are pluggable:
ship with `@hyperdag/defaults` for the curated set, or roll your own and
plug them into `createHDP()` from `@hyperdag/protocol`.

## The six interfaces

| Interface | Default implementation | Wraps |
| :--- | :--- | :--- |
| [`IIdentity`](./src/IIdentity.ts) | `@hyperdag/identity-erc8004` | ERC-8004 IdentityRegistry |
| [`IReputation`](./src/IReputation.ts) | `@hyperdag/reputation-zkp` | ZKP RepID |
| [`IValidation`](./src/IValidation.ts) | `@hyperdag/validation-trinity` | Trinity Symphony BFT validators |
| [`IPayment`](./src/IPayment.ts) | `@hyperdag/payment-x402` | x402 |
| [`ILinkage`](./src/ILinkage.ts) | `@hyperdag/linkage-registry` | HDP Linkage Registry (inverse-stake) |
| [`IHallucination`](./src/IHallucination.ts) | `@hyperdag/hallucination-hal` | HAL (Pythagorean Comma BFT veto) |

## Versioning

This package is versioned independently from `@hyperdag/protocol`. Breaking
interface changes increment the major version. Compatible implementations
get a 12-month backward-compat guarantee — third parties can ship conforming
implementations without fear of a same-week breakage.

## Install

```bash
npm install @hyperdag/interfaces
```

You probably want `@hyperdag/protocol` instead, which re-exports these
interfaces along with the curated defaults and a `createHDP()` factory.

## License

Apache-2.0.
