# @hyperdag/validation-trinity

Default Trinity Symphony BFT validators implementation of
`@hyperdag/interfaces`#`IValidation`.

The 12-validator framework with Byzantine-fault-tolerant aggregation using
the **Pythagorean Comma** dissonance threshold (P-003 patent claim) — a single
veto from a decisive validator overrides a majority pass when the dissonance
gap exceeds the comma.

## Provenance

- Source: `trinity-symphony-shared/lib/receipt-validation/ReceiptValidator.js`
  (commit `c7308617a98a58fd6fde308d87f5df3b9e443969` at sprint time)
- Math constants: `trinity-symphony-shared/lib/MathConstants.js`
  (`BFT_THRESHOLD = 0.618`, `PYTHAGOREAN_COMMA = 531441/524288`,
  `DISSONANCE_THRESHOLD = 0.0136`)
- License: Apache-2.0

This package is a TypeScript port of the public ReceiptValidator with
constructor injection of dependencies (schema validator, attestation store).

## HITL graduation

`requestValidation()` honors the `repIdGate` parameter as required by the
interface contract. If the submitter's RepID is below the gate
(`REPID_HITL_GATE = 70` by default), the resulting `ValidationTask` returns
`awaitingHuman: true` and the artifact is queued for mandatory human review.

## Usage

```typescript
import { TrinityValidationProvider } from '@hyperdag/validation-trinity';

const validation = new TrinityValidationProvider({
  hitlGate: 70,
});

const task = await validation.requestValidation(workArtifact, agentRepId);
```

## v0.2 plan

Wire to the live BFT consensus mesh once the Trinity Symphony validator
network is publicly callable. v0.1 ships the local-aggregation path.

## License

Apache-2.0.
