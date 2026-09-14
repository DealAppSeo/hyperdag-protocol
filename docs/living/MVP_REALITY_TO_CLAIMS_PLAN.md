# MVP: make REALITY match the CLAIMS — build plan (CC1, 2026-09-14)

Sean's directive: do NOT change the claims to match reality; build reality UP to the claims.
Order = hardest / longest-lead first. Lanes are independent → all agents build in parallel.
DoD is provable (query/test/tx), verified OUT-OF-LANE (Claude+Grok co-sign vs ground truth).

Claims reality must reach: (1) private RepID proof (threshold, not score) · (2) a stranger gets an
on-chain ERC-8004 identity · (3) a real multi-provider HAL quorum · (4) a working marketplace + x402.

Key facts [V 2026-09-14, this session]:
- Supabase keys ROTATED: legacy anon/service-role DEAD; new publishable+secret live. Publishable key
  is public by design → the SITE should embed it. STOP raising "exposed key / rotate" on the dead
  legacy keys — that incident is closed.
- HAL live quorum = 2-of-5 (gemini/zai/mistral 429). marketplace_listings=0, browse RLS policies=0.
  leaderboard_public=211 rows. register() never mints; mint is bearer-gated. repid_score ships in the
  proof statement (score NOT private today).

---

## LANE A — CC1 (Opus) · private RepID proof  **[HOLD — CANON CONFLICT, needs Sean+Grok]**
Claim: "the proof attests the threshold, not the score."
BLOCKER (not the prover-source one): **D-019** (zkp-vault/README, "supersedes the RepID-range
statement PR #95") states RepID reputation is PUBLIC on-chain, so proving it in ZK is REDUNDANT, and
redirected the ZK effort to **anonymous ownership** (no reputation values in the circuit). The live
zkp-postcard prover nonetheless mints RepID-range proofs with repid_score IN the statement.
=> The score-privacy claim may CONTRADICT D-019. Do not build a score-hiding RepID circuit until the
fork is resolved:
  (A) "privacy" = anonymous OWNERSHIP (wire zkp-vault, bridge missing) — RepID stays public; fix copy.
  (B) score-privacy IS wanted → revisit D-019 + build a new range circuit hiding score as private witness.
  (C) both (public RepID + optional score-private threshold proof).
Also true regardless: the LIVE prover (zkp-postcard-production) has NO source in any repo (board task
86); zkp-vault (Rust Plonky3) is real but has non-production FRI params + no HTTP wrapper.
Owner CC1; verifier XC+Grok. **Escalated to Sean 2026-09-14.**

## LANE B — GA · keyless on-chain identity mint  (hard, on-chain)
Claim: a new user gets an ERC-8004 identity.
Reality: register() (src/routes/agents-external.ts) is keyless but never mints; only mint route
(src/routes/agents-onchain.ts) is bearer-gated. [V]
Build: on register(), custodially mint the IdentityRegistry token (operator/minter key, server-side
custody, gas-bounded, idempotent, rate-limited). **Base Sepolia ONLY.**
DoD: keyless register → real IdentityRegistry mint tx (BaseScan link) → row persisted; re-register is
idempotent (no double-mint). PR-don't-merge.
Verifier: CC1 checks the tx on-chain + custody safety; XC red-teams spam-mint / cost-drain.
Sean-gated: minter key custody; any mainnet move. Testnet mint from existing operator key = in-scope.

## LANE C — XC · restore the real HAL quorum  (medium)
Claim: robust multi-provider quorum (not "6/6" theater).
Reality: live /hal/evaluate = 2-of-5 succeed; gemini (credits), zai (balance), mistral (rate) all 429. [V]
Build: the DURABLE fix — wire the free-tier providers so ≥4 independent families succeed WITHOUT
funded keys (LOCAL_LLM_BASE_URL + free-tier gate already exist; add/repair provider entries, drop dead
models). Correct the "6/6" string to the measured live count.
DoD: live /hal/evaluate returns ≥4 independent families succeeded (measured, not claimed);
provider_health writing again.
Verifier: CC1 re-measures live + blind.
Sean-gated: funding PAID keys (money). Free-tier wiring is not — do that first.

## LANE D — CC2 · marketplace + x402 end-to-end + site truth  (medium/small, high-visibility)
Claim: a working marketplace with x402 payments; a live site showing real numbers.
Reality: marketplace_listings=0, offers=0, 0 anon RLS policies on the 4 browse tables → /marketplace/browse
structurally empty; x402.discovery fails. Live-stats widget dead (site still on the DEAD legacy key). [V]
Build: (1) anon-read RLS on the 4 browse tables (NO anon write); (2) real/[DEMO]-labelled listings so
there's something to buy; (3) prove ONE x402 purchase settles end-to-end on Base Sepolia; (4) swap the
site to the NEW PUBLISHABLE key + redeploy so stats render (leaderboard already has 211 rows).
DoD: anon GET returns listings; /marketplace/browse renders (Playwright); one settled x402 contract
(tx link); homepage stat returns 200 with a real number.
Verifier: CC1 verifies settlement tx + RLS (no anon-write leak).
Sean-gated: the Vercel redeploy.

## Cross-cutting (XC or a GA doc task) · purge stale key-exposure indicators
Legacy anon/service-role keys are dead. Remove "rotate exposed key" incident language from
CLAUDE.md / LESSONS / reports; replace with the current model (publishable=public, secret=protected,
new). Closes the recurring truth-disconnect. Docs only, reversible.

---

## Sequencing (honest)
- Lanes C, D: doable today. Lane B: 1–2 days. Lane A: HELD on the D-019 fork (do not build blind).
- All Sean-gated: merges, deploys (Vercel/Railway), minter/secret keys, mainnet/money. Everything else
  is additive/reversible/testnet under Claude+Grok concurrence.
