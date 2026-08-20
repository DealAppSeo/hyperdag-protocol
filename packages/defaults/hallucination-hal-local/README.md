# @hyperdag/hallucination-hal-local

**Status:** Internal-only. `private: true`. **Do NOT npm publish without Sean's explicit approval.**

Local-first implementation of the `IHallucination` slot. Bundles the deterministic 5-signal extractor + canonical combiner from `repid-engine/src/hal/lib/`, so a `createHDP({})` consumer can run HAL evaluations **offline, with no remote dependency**, for the C→A milestone (D-017).

## Why private

The HAL signal-extraction formula and weighting are proprietary internals (P-003 — Pythagorean Comma Dissonance Detection). Per CLAUDE.md hard-stop:

> RepID scoring formula T=floor(2000×log₁₀…) — never appear in public docs
> ANFIS parameters — never in public docs

This package contains the canonical 5-signal extraction formula AND the canonical combiner (Pythagorean Comma at 531441/524288). It is **safe for trinity-internal consumers** (the agents and services already inside the proprietary codebase). It is **not** safe for public npm publication.

The PUBLIC slot remains `@hyperdag/hallucination-hal`, which ships as an HTTP client + stub fallback. External consumers of `createHDP({})` continue to see that public package.

## Architecture

This package exports three classes:

- **`LocalHALProvider`** — primary. Pure local 5-signal extraction + canonical Pythagorean-Comma combiner. Implements `IHallucination`. No network calls. The 5th signal (`agreement_score`, cross-LLM consensus) falls back to `null` when no providers are supplied — see [Cross-LLM signal](#cross-llm-signal-5th-signal) below.

- **`RemoteHALProvider`** — re-export of `HALHallucinationProvider` from `@hyperdag/hallucination-hal` for API symmetry.

- **`HALRouter`** — routing provider that respects `HDP_MODE`:
  - `HDP_MODE=local` → only ever calls the local provider.
  - `HDP_MODE=remote` → only ever calls the remote provider.
  - `HDP_MODE=hybrid` (default) → tries local first; if the local result lands in a configurable veto-borderline zone (default `[0.20, 0.30]`), routes to remote for a second opinion. If remote is unreachable, returns the local result with `borderline_fallback: true` in `signals` (extra field).

## Cross-LLM signal (5th signal)

The cross-LLM `agreement_score` is the only signal that needs a model. Three paths:

1. **No providers configured** → `agreement_score = null`, combiner falls back to the 4-signal formula (canonical `score.ts` already handles this branch).
2. **BYOK providers** → caller passes provider configs in `evaluate(request, { providers, embeddingClient })`. Same shape as `HALContext.providers` in the repid-engine source.
3. **Remote fallback** → `HALRouter` with `HDP_MODE=hybrid` will get cross-LLM coverage from the remote service when borderline.

This package does **not** bundle a small local model. That would make the install size unreasonable. State of art: shipping local cross-LLM verification needs a 1-7B-param judge model, which is a 1-4 GB tarball minimum. Out of scope tonight; **honest fallback** to BYOK or remote.

## Usage

```ts
import { createHDP } from '@hyperdag/protocol';
import { HALRouter } from '@hyperdag/hallucination-hal-local';

const hdp = createHDP({
  overrides: {
    hallucination: new HALRouter({ mode: 'hybrid' }),
  },
});

const result = await hdp.hallucination.evaluate({
  prompt: 'What is the boiling point of water at sea level?',
  output: 'It boils at 100°C at sea level.',
  context: { domain: 'physics', certainty: 0.99 },
});
```

## Divergence from remote (A/B)

The local provider matches the remote provider byte-for-byte on the deterministic 4 signals (same constants, same regex hit-lists, same Jaccard ontology overlap). The 5th signal (`agreement_score`) is the only divergence:

| Mode | Where `agreement_score` comes from |
|---|---|
| Local, no providers | `null` (combiner falls back to 4-signal formula) |
| Local, BYOK providers | live LLM calls from the caller's process |
| Remote | live LLM calls from `repid-engine` (orchestrated) |

For factual / time-sensitive prompts, local-no-providers will produce a different `hal_score` than remote, because remote always runs cross-LLM. **This divergence is documented in the A/B test results in the sprint report.**

## License

See `LICENSE` at the repo root. This package is Apache-2.0 in license terms but `private: true` in `package.json` so the npm registry refuses to publish it.
