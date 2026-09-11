# PLONKY3_POSTCARD — smallest disclosure, measured (P2)
**2026-09-10 (CC, RALPH P2).** Called `presentProof` on a live agent (`trinity-shofet`) via published `@hyperdag/trustshell@1.3.0`. Proof captured + verifier true. **The postcard is NOT minimal disclosure — it reveals the exact score.** Smaller-disclosure tiers are missing exports.

## Proof captured (live)
- agent: `trinity-shofet` · scheme **`plonky3_range_check`** · **proofBytes = 14232 b64 chars** → saved: `docs/living/postcard-trinity-shofet.b64`
- **verifier true:** server `presentProof(id,{verify:true})` → `verification = {verified:true, error:null, verifierVersion:"0.2.0"}`. ✅
- `@hyperdag/proof-verifier` exposes exactly one export: **`verify`**.

## Hidden vs revealed — the finding
**Public statement:** `{ agent_id, repid_score: 2150, threshold: 999, tier: "ESTABLISHED" }`
- **REVEALED:** agent_id, **the exact score (2150)**, the threshold (999), the tier.
- **HIDDEN:** nothing about the score.

So although the proof is a **range check** (it cryptographically binds `score ≥ threshold`), its public statement **volunteers the exact score**. That defeats the point of a range proof for privacy: the "smallest disclosure" (prove `≥ threshold` / reveal only the tier, hide the number) is **not** what the postcard tier does today.

## Smaller-disclosure tiers — MISSING exports (checked)
Neither the SDK named exports nor the `TrustShell` instance methods contain any of:
`envelope` · `package` · `box` · `vault` · `presentEnvelope` · `presentBox` · `presentVault` → **all MISSING.**
(SDK exports: TrustShell, TrustShellError, buildX402Payment, proofBadgeStatus, renderProofBadge, renderProofBadgeMarkdown, verify. Methods: score, verify, verifyOutput, getRepID, getLeaderboard, getFactCheckCount, getRepIDStake, presentProof, verifyProofLocally, audit, executeA2A, register, registerHuman, listServices, getService, getContractStatus, pollUntilSettled.)

## Second finding — client-side verify is broken on presentProof output
`client.verifyProofLocally(p)` (WASM, v0.2.0) on the object `presentProof` returns:
> `{ verified:false, error:"input parse error: invalid type: map, expected a string at line 1 column 15" }`
The local verifier expects a **string**, not the `{statement, proofBytes, …}` object. So the server verify path works, but the **client-side re-verify of the SDK's own proof object fails** — a shape mismatch worth a regression test.

## Next tier up (for the next item — with a test)
Two concrete, named gaps to implement ONE tier up:
1. **A minimal-disclosure proof mode** that reveals only the tier (or a `≥threshold` boolean) and **hides `repid_score`** — e.g. `presentProof(id, { disclose: 'tier' })` or a dedicated `presentTierProof(id)`. Missing symbol today: no disclosure option; `presentProof` always returns the full-score statement.
2. **Fix `verifyProofLocally`** to accept the `presentProof` object (or document the exact string shape it wants) — failing test: `verifyProofLocally(await presentProof(id,{verify:true}))` must return `verified:true`, currently returns the parse error above.

**No deploy, no publish. Proof is public data (it discloses the score by design today).**
