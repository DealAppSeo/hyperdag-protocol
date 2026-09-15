# Audit 2606.26028 — scoped specs for #3 / #5 / #6 (CC1, 2026-09-14)

Cheap guards #2 (value-range) + #10 (mainnet-refusal) shipped as repid-engine PR #748 (stacked on
merged #736). These three are the larger items. Each: current reality [V 2026-09-14], the claim it
must reach, approach, DoD (provable), effort, suggested owner, dependencies. Verify OUT-OF-LANE.

---

## SPEC #3 — a REAL RepID aggregator (biggest; the core "rateable by others" gap)
**Claim:** an agent's official RepID reflects independent feedback, not a self-published number.
**Reality [V]:** RepID is an ENGINE number. `current_repid` = `updateRepId` (decay→delta→redemption→
clamp [10,10000], `src/engine/repid-update.ts:502`); on-chain `giveFeedback` is a ONE-WAY publish of
that value — registry feedback rows are never read back and aggregated. There is no aggregator over
independent on-chain/off-chain feedback with per-pair caps. `readHyperDAGFeedback` exists but is a
read helper, not wired into scoring.
**Approach:** define the aggregate = f(independent feedback rows) with (a) per-counterparty cap (one
rater can't dominate), (b) rater-weight by rater RepID, (c) reconciliation vs the engine number
(shadow-first: compute + log, don't replace scoring until proven). Feedback source = `giveFeedback`
rows (ERC-8004 ReputationRegistry) and/or a new `repid_feedback` table for off-chain raters.
**DoD:** shadow table + query showing aggregate vs engine number per agent on real data; per-pair cap
provably binds (test: 100 ratings from one pair move the aggregate ≤ cap); NO scoring change until
Sean/economist sign-off (this is a scoring decision, hard-stop class).
**Effort:** ~1–2 wk. **Owner:** CC1 design + GA build; XC red-team the cap/sybil math.
**Depends on / interacts with:** #6 (grounded verdicts), #5 (x402 grounding), F6 funding-graph, and
the RepID-privacy fork (Lane A) — an aggregate of feedback is what makes a threshold proof meaningful.

## SPEC #5 — close the x402 settle/fulfill gap + 1:1 agent join (#644)
**Claim:** every settled x402 payment maps 1:1 to the agent + block it paid.
**Reality [V]:** 435 x402_settlements (310 with tx_hash, 125 without); 106 erc8004_reputation_writes
(60 contract-linked, 46 orphan); **154 contracts fulfilled vs 31 settled** → ~123 fulfilled-not-
settled (the #644 gap). Join is via `contract_id`, not a direct agentId; lossy.
**Approach:** (a) drive fulfilled→settled (the cascade-settlement worker; earlier finding: escrowed→
fulfilled had one driver behind ESCALATION_CONTRACT); (b) backfill `contract_id` on the 46 orphan
rep-writes where derivable; (c) add a view `v_x402_settlement_by_agent` (settlement tx ↔ agentId ↔
block) and reconcile counts.
**DoD:** settled count rises toward fulfilled (report the delta), orphan rep-writes reduced, and the
view returns a clean 1:1 for settled contracts (count + remaining-gap stated honestly, no silent cap).
**Effort:** ~3–5 d. **Owner:** CC1 or GA (backend). Verifier: the other, on-chain tx spot-check.
**Depends on:** the cascade-settlement worker being enabled (was default-OFF, `CASCADE_SETTLEMENT_ENABLED`).

## SPEC #6 — HAL verdict into an on-chain Validation Registry (stop the side-channel)
**Claim:** HAL verdicts are part of the verifiable trust record, not an internal side note.
**Reality [V]:** HAL is a SIDE CHANNEL vs the registry. `hal_decision` + `hal_score` land in
`repid_score_events` (`src/engine/repid-update.ts:554`) and enter the ZK delta statement as a witness
(`src/zkp/repid-delta-statement.ts:346,544`); there's an off-chain hal audit chain
(`append_hal_audit_chain` RPC). NOTHING writes a HAL verdict HASH into the on-chain `giveFeedback`
(repid+tags only) or an ERC-8004 ValidationRegistry.
**Approach:** ERC-8004 has a ValidationRegistry concept. Write a HAL verdict hash (sha256 of the
verdict payload) as a validation entry keyed to the agent + the score event, so a third party can
check "this rating was HAL-verified" on-chain. Gate behind a flag; Base Sepolia only (respect #10).
**DoD:** one HAL verdict hash written to the ValidationRegistry (or as a feedback tag) on Base Sepolia
(tx link), retrievable + matching the off-chain `hal_classifications` row.
**Effort:** ~1 wk. **Owner:** XC (HAL lane) + CC1 verify. **Depends on:** a ValidationRegistry
address/target (confirm ERC-8004 deployment) — if absent, that's a Marco/contracts dependency (HARD
STOP on `packages/contracts/` without Sean).

---
Guardrails across all three: additive/reversible/testnet under Claude+Grok concurrence; scoring
changes (#3) + any on-chain contract change (#6) are Sean-gated decisions, not autonomous cleanups.
