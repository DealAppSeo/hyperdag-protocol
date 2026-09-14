# CC inbox — dispatch #64 BACKEND LAUNCH 2026-09-13 18:20 PDT

NEW DISPATCH. Resume the cron. #63 was never pulled — you stopped on #62. #151 and #736 are MERGED. Freshness is still red. This queue is the TrustShell ENGINE launch path.

/loop 25m. Free only. Draft PRs on DealAppSeo/repid-engine. Do not merge. Do not publish. Do not rotate keys. Do not flip REPID_RUN_EARN_GATE. Do not restart-all off a NULL.

Measured this hour:
- trustshell #151 MERGED (hal.discrimination). Nightly e2e-honesty will keep failing until zkrepid.freshness is fresh.
- repid-engine #736 MERGED (cb_disable_onchain_writes now guards writeRepIDFeedback + postReputationSignal). Flag still true in prod — do not flip it.
- #737 still OPEN (BUILD_LOOP_MODEL). Sean merges.
- CC2 measured register dedup: 3 identical POST /register → 201/201/201 distinct ids. agents-external.ts L114-197 is a per-PROCESS in-memory Map. Dormant on multi-replica Railway.
- CC2 measured published @hyperdag/trustshell@1.3.0 keyless verifyOutput+getRepID+presentProof = 5/5 PASS (NPM_GATE_RECEIPT.md). Mint stays Bearer 401.
- Live HAL evaluate is a 2-provider quorum, not the 6/6 claim.

## NOW (engine only, in order)
1. **P0 HYP-7 zkrepid.freshness.** Served proof 8 days old (workflow 34786262489). Closed 2026-09-01, reopened, #549 class.
   - Measure last-write on `repid_zkp_proofs` and HEARTBEAT_MODE (full|throttled|off). Load-bearing table = `llm_call_log`.
   - Diagnose store-write / mint job. Draft the fix PR. After a real remint, a new proof age must be minutes not days.
   - Stamp last-write + root cause on this bus. This is what makes #151's merged gate green on main.
2. **P1 Shared-store register dedup.** Replace the in-memory Map in `agents-external.ts` L114-197 with the EXISTING shared store (`src/cache` or Supabase). Do NOT stand up a new Redis service unless Redis is already running in prod. Intent: same name+IP inside 24h is reliable across Railway replicas. Keep live semantics honest: a 201 is a fresh agent_id (never reuse). Do NOT invent global name uniqueness / 409 — that is Sean's call.
   - Test: two sequential POSTs against two simulated processes share the store and the second hits the documented 429 (or whatever the live intended status is). Draft PR.
3. **P2 get_scaled_reward OUTPUT CAP.** Live clamp is only `clampEventDelta ±9990`; one event fills the scale; parallel events unrate-limited; earn-gate shadow. Draft the output-cap PR so XC can red-team. Do not flip the prod earn-gate flag.
4. **P3 Post-merge verify #736.** After Railway has #736, prove the breaker actually blocks writeRepIDFeedback when the flag is true (no tx sent). Stamp evidence. Do not flip the flag.
5. **P4 HAL quorum measure.** Live POST /api/v1/hal/evaluate — how many providers fire vs the 6/6 claim. Code-to-claim. Draft only. #56 billing creds stay Sean-gated.
6. **P5 HYP-5 CALLSITES 13→0** only after P0-P2 have draft PRs. tests/provider-egress-guard.test.ts. Ceiling only lowers.

## NOT YOURS
Merge #737. Publish 1.4.0. Rotate keys. MODE=full restart-all. Marketplace. PAI 409. npm. Trustshell.ts rebase.

## LOOP
After each phase: draft PR + stamp HANDOFF + one line on trinity-vault#1. Empty NOW → STOP. Stop on FREE_EXHAUSTED.
