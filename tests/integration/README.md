# Integration tests — real network

End-to-end integration tests for the `@hyperdag/protocol` modular kernel
against **real** infrastructure: Base Sepolia, Trinity Supabase, and HAL
(via CC1's `repid-engine/src/hal/lib/`).

**No mocks.** If a real dependency is unavailable, the corresponding test
skips with an explicit reason.

## How to run

```bash
# Single phase
node --experimental-strip-types --no-warnings --test tests/integration/identity.test.ts

# All phases at once
node --experimental-strip-types --no-warnings --test tests/integration/*.test.ts
```

The `--experimental-strip-types` flag is what the kernel sprint settled on
(see `packages/protocol/package.json#scripts.test`); it lets Node 22 run
TypeScript directly without a transpile step.

## Required env

See [`.env.example`](./.env.example). The setup loader checks (in order):
1. `tests/integration/.env.local` (gitignored)
2. `tests/integration/.env`
3. `../../../repid-engine/.env` (the existing developer .env that has all
   the required keys already)

Tests that find their required env missing will skip with a clear message,
not silently mock.

## Phase status

| Phase | File | Real network surface | Status |
| :---: | :--- | :--- | :--- |
| 1 | `setup.ts`, `.env.example`, this README | (infrastructure only) | ✓ scaffolded |
| 2 | `identity.test.ts` | ERC-8004 IdentityRegistry on Base Sepolia (`0x8004A818...`) | see results/identity-*.json |
| 3 | `reputation.test.ts` | Trinity Supabase RepID tables (project `qnnpjhlxljtqyigedwkb`) | see results/reputation-*.json |
| 4 | `validation.test.ts` | `hyperdag_receipts` + on-chain receipt adapter (`0x6f3519...`) | see results/validation-*.json |
| 5 | `hallucination.test.ts` | CC1's `repid-engine/src/hal/lib/` — REAL `computeHALScore` + constants; STUB `evaluate`/`extractHALSignals` | see results/hallucination-*.json |
| 6 | `linkage.test.ts` | Trinity Supabase linkage table (or in-memory if absent) | see results/linkage-*.json |
| 7 | `payment.test.ts` | x402 endpoint (interface logic only if endpoint absent) | see results/payment-*.json |
| 8 | `composite.test.ts` | Mint → link → action → HAL → receipt → reputation | see results/composite-*.{json,md} |

## Cost notes

- **Base Sepolia gas:** free (testnet). RPC calls are rate-limited; default
  is `https://sepolia.base.org` which is generous but not unlimited. For
  Phase 8 composite at scale, switch to Alchemy/Infura/Trinity-Alchemy URL
  via `BASE_SEPOLIA_RPC_URL`.
- **Trinity Supabase:** free under standard plan limits. Phases 3/4/6 do
  read-mostly queries; Phase 8 may insert a small handful of test rows.
- **HAL:** Phase 5 uses CC1's library directly (zero API cost) for the
  REAL `computeHALScore` path. Cross-LLM tests (`checkCrossLLM`) would
  consume Anthropic/Groq/Cerebras quota — currently STUBs in CC1's lib,
  so no cost yet.
- **Test wallet pollution:** Phase 2 mints leave permanent ERC-8004 tokens.
  Phase 8 composite mints one new agent per run. Both are intentional and
  documented as test pollution.

## Idempotency

Each test uses unique identifiers (timestamp + random nonce) so re-runs
don't collide. Results JSONs are written to `results/` (gitignored except
for `.gitkeep`) and are timestamped per run.

## Adding a new integration test

1. Create `tests/integration/<name>.test.ts`.
2. Import shared scaffolding: `import { env, supabase, baseSepolia, captureResult, skipIfMissing } from "./setup.ts";`
3. Use `node:test`'s `test()` and `describe()`. Honor `--test-skip-pattern`
   semantics if you need to mark a sub-test as skip.
4. If your test needs an env var that may be absent, lead with
   `skipIfMissing(...)` and bail early with a clear message — never mock.
5. Capture a results JSON with `captureResult("<phase>", { ... })` so
   morning reports have machine-readable artifacts.
