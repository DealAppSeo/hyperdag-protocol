# @hyperdag/protocol

> Modular trust kernel for AI agents — six composable interface contracts with
> curated default implementations. Wraps ERC-8004 + x402 + ERC-5192 + ERC-7231
> with HAL hallucination filtering and ZKP RepID.

## Install

```bash
npm install @hyperdag/protocol
```

This is the meta-package. It re-exports the six interfaces from
[`@hyperdag/interfaces`](https://github.com/DealAppSeo/hyperdag-protocol/tree/main/packages/interfaces)
and the six curated default implementations from
[`packages/defaults/`](https://github.com/DealAppSeo/hyperdag-protocol/tree/main/packages/defaults).

## Quick start

```typescript
import { createHDP } from '@hyperdag/protocol';

const hdp = createHDP({
  network: 'base-sepolia',
  // Optional service URLs — omit for local stubs.
  halServiceUrl: 'https://hal.hyperdag.dev/api/v1',
  halApiKey: process.env.HAL_API_KEY,
});

// Evaluate an agent output through HAL
const result = await hdp.hallucination.evaluate({
  prompt: "What's the capital of France?",
  output: 'Paris.',
  context: { agentId: 3749 },
});

if (result.vetoed) {
  console.log('HAL vetoed this output:', result.veto_reason);
} else {
  console.log('HAL score:', result.hal_score);
}
```

## The six interfaces

| Interface | Default | Purpose |
| :--- | :--- | :--- |
| `IIdentity` | `@hyperdag/identity-erc8004` | Agent identity (ERC-8004 wrapper) |
| `IReputation` | `@hyperdag/reputation-zkp` | ZKP RepID scoring |
| `IValidation` | `@hyperdag/validation-trinity` | Trinity Symphony BFT validators with HITL graduation |
| `IPayment` | `@hyperdag/payment-x402` | x402 micropayments |
| `ILinkage` | `@hyperdag/linkage-registry` | Human↔agent custodial linkage with inverse-stake curve |
| `IHallucination` | `@hyperdag/hallucination-hal` | HAL filtering with Pythagorean Comma BFT veto |

Each interface is documented in detail at its source file. See
[ARCHITECTURE.md](https://github.com/DealAppSeo/hyperdag-protocol/blob/main/ARCHITECTURE.md)
for the design rationale.

## Composition: replace any default

Swap a curated default for your own implementation by passing `overrides` to
`createHDP`:

```typescript
import { createHDP, type IHallucination } from '@hyperdag/protocol';

class MyHAL implements IHallucination { /* ... */ }

const hdp = createHDP({
  overrides: { hallucination: new MyHAL() },
});
```

## Versioning

`@hyperdag/protocol` follows semantic versioning. Interface contracts in
`@hyperdag/interfaces` are versioned independently with a 12-month
backward-compat guarantee for conforming implementations.

## License

Apache-2.0.
