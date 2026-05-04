# @hyperdag/hallucination-hal

Default HAL (Hallucination Adversarial Layer) implementation of
`@hyperdag/interfaces`#`IHallucination`.

Implements the **Pythagorean Comma BFT veto** (P-003 patent claim) at the
interface boundary — `getCommaThreshold()` returns 1.013643. The full
6-DOF signal extraction is performed by the proprietary HAL service; this
package is a thin HTTP client with a stub fallback for local development.

## Provenance

- Service: HyperDAG HAL evaluation engine (proprietary).
- Reference shape: `repid-engine/src/services/hal-signals.ts`
  (commit `204cfcbe93f85f8cb0ccdc969d2cc4003129c1db` at sprint time)
- Public constants: Pythagorean Comma 531441/524288 ≈ 1.013643.
- License: Apache-2.0

## Why a thin client

The HAL signal extraction formula and weighting (HAEE / ANFIS parameters) are
part of HyperDAG Protocol's patent portfolio (P-003) and are not published.
This default exposes only what is necessary for downstream composition:
evaluate, veto-check, threshold lookup. Replacement implementations are free
to use their own scoring math.

When no HAL service URL is configured, the provider returns a clearly-marked
stub HAL result (`formula: "stub"`, all signals at 0.5, `vetoed: false`) so
local development and tests don't require the live service.

## Usage

```typescript
import { HALHallucinationProvider } from '@hyperdag/hallucination-hal';

const hal = new HALHallucinationProvider({
  apiUrl: 'https://hal.hyperdag.dev/api/v1',
  apiKey: process.env.HAL_API_KEY,
});

const result = await hal.evaluate({
  prompt: "What's the capital of France?",
  output: "Paris.",
  context: { agentId: 3749 },
});
```

## License

Apache-2.0 (this wrapper). Underlying scoring service is proprietary.
