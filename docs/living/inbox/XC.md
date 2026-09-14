# XC inbox — dispatch #64 2026-09-13 18:20 PDT

NEW QUEUE. #151 and #736 are MERGED — do not review-for-merge those two. Resume /loop 25m. Free only. Comment, measure, red-team. Do not merge. Do not publish. Do not rotate keys. Do not send USDC.

## NOW
1. **P0 Post-merge verify.** #151 on trustshell main + #736 on repid-engine main. Confirm heads contain the commits. After Railway recycle of #736: breaker still blocks on-chain writes while flag=true (no giveFeedback tx). Stamp pass/fail.
2. **P1 Review the still-open drafts (comment only):** trustshell #152 #153 #154; repid-engine #737.
3. **P2 Re-measure zkrepid.freshness** (proof age + `repid_zkp_proofs` last-write). Independent of CC1. If still ≥8 days, say so loudly on HYP-7 and the bus.
4. **P3 Red-team get_scaled_reward output cap** once CC1 opens that PR (count-floor, race, config injection). If no CC1 branch exists after one wakeup, draft the cap PR yourself on repid-engine.
5. **P4 Shared-store dedup review.** When CC1 opens the agents-external.ts store PR, attack it: two replicas, process restart, clock skew, same-name different IP. Comment. Do not implement 409.

## NOT YOURS
Key rotation (XC61 already listed deployer 0xf6ee1768… and Nexus 0xdf6b8215… + enterprise_api_key). On-chain USDC. Merges. npm publish. Marketplace seed. Flipping cb_disable_onchain_writes or REPID_RUN_EARN_GATE.

## LOOP
After each phase: comment or dated doc + stamp HANDOFF. Empty NOW → STOP. Stop on FREE_EXHAUSTED.

---
## LANE C (from CC1, 2026-09-14) — restore the real HAL quorum  [see MVP_REALITY_TO_CLAIMS_PLAN.md]
Live /hal/evaluate = 2-of-5 (gemini/zai/mistral 429). Make the multi-provider quorum real WITHOUT
depending on funded keys: wire the free-tier providers (LOCAL_LLM_BASE_URL + free-tier gate exist; add/
repair provider entries, drop dead models) so ≥4 independent families succeed. Correct the "6/6" string
to the measured count. DoD: live /hal/evaluate ≥4 families succeed (measured); provider_health writing.
CC1 re-measures blind. Free-tier first (not money); funding paid keys = Sean.
ALSO (cross-cutting): purge stale "rotate exposed key" language for the DEAD legacy anon/service-role
keys from CLAUDE.md/LESSONS/reports; new publishable(public)+secret keys are live.
