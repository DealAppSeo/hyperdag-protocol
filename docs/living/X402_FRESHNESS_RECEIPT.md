# Dispatch #64 receipt — x402 honesty + freshness + provider count (CC2, published client)

All measured from a clean temp dir, `npm i @hyperdag/trustshell@1.3.0` (registry current 1.3.0),
keyless, no Sean in the loop, no mint. Run: 2026-09-13, CC2.

## P1 — presentProof freshness (independent check of HYP-7 / zkrepid.freshness)
`client.presentProof('trinity-shofet', { verify: true })` →
- `createdAt = 2026-09-12T12:01:42.562058+00:00`
- **age ≈ 1.56 days** at probe time (keys: `agentId, tier, proofBytes, scheme, statement, createdAt, verification`).

**Independent confirmation:** the proof the PUBLISHED client presents for `trinity-shofet` is **~1.5 days
old**, not the ~8-day staleness CC1 flagged — a fresher proof landed 2026-09-12. Freshness is
**MEASURED, not FAILED**, from the client's view. CC1 owns the fix/remint; P5 will re-probe after a remint
to confirm it drops further. (No mint attempted here.)

## P2 — x402 honesty walk: published 1.3.0 vs git main
What a stranger who `npm i @hyperdag/trustshell@1.3.0` actually gets vs what lives only in the git tree:

| symbol | published 1.3.0 | git `origin/main` |
|---|---|---|
| `buildX402Payment` | **EXPORT** | src/lib (audit, guarded-payment, index) |
| `executeA2A` | **method on TrustShell** | src/lib (audit, index, trustshell) |
| `guardedX402Payment` | **ABSENT** | `src/lib/guarded-payment.ts`, `index.ts` |
| `assertOriginCanPay` | **ABSENT** | `src/lib/origin.ts`, `guarded-payment.ts`, `index.ts` |
| `auditThenAct` | **ABSENT** | `src/lib/audit.ts`, `guarded-payment.ts`, `index.ts` |
| `getAllowance` | **ABSENT** | `src/lib/trustshell.ts` |

Published 1.3.0 module keys: `TrustShell, TrustShellError, buildX402Payment, proofBadgeStatus,
renderProofBadge, renderProofBadgeMarkdown, verify`.

**Honest finding:** the published client can **build** an x402 payment and run A2A, but it has **no
safety wrapper** — no origin fail-closed (`assertOriginCanPay`), no intent→policy→act audit
(`auditThenAct`), no cap read (`getAllowance`), no composed `guardedX402Payment`. Those are **git-only /
unpublished** (a future release, NOT 1.3.0, NOT claimed as 1.4.0). A builder on npm today who wires
`buildX402Payment` directly is paying **without** the guard rails that exist in the repo.

## P3 — live HAL provider count from published verifyOutput (N vs the "6/6" claim)
`client.verifyOutput(...)` keyless, live:
- **Paris** → `verdict=PASS`, evidence = **2** providers: `groq:TRUE`, `cerebras:TRUE`.
- **Rome** → `verdict=VETO`, evidence = **2** providers: `groq:FALSE`, `cerebras:FALSE`.
- `providersUsed` / `familiesUsed` / `provider` = **undefined** in the 1.3.0 response mapping (the backend
  did not populate `signals.providers_used` on this path); the only observable provider signal is the
  `evidence[]` array.

**Stamp: the live quorum the published client sees is N = 2 (groq + cerebras), not 6.** Any "6/6" claim is
not what a keyless caller measures today. Not a bug in the verdict (Paris PASS / Rome VETO are correct),
but the marketed provider breadth ≠ the observed quorum. No keys invented.

---
*CC2 · 2026-09-13 · dispatch #64 · published npm + git main + live prod. No mint, no publish, no merge.*
