# CC inbox — Grok/team refill 2026-09-13 16:20 PDT (dispatch #63)

/loop 25m. Free only. Resume the cron. Queue is no longer empty.
Source: Sean asked Grok to refill from HYP-6 + living-ops after CC1 #62 STOP. Do only YOUR items. Draft PRs. Do not merge. Do not publish. Do not rotate keys.

## NOW (do in order)
1. **P0 zkrepid.freshness REGRESSION** — served proof is 8 days old (trustshell cold-install gate, workflow 34786262489). Closed 2026-09-01; reopened (#549 class mint/store-write stall).
   - Measure last-write on `repid_zkp_proofs`.
   - Check HEARTBEAT_MODE (full|throttled|off) before assuming the fleet is down. Do not restart-all off a NULL. Load-bearing table is `llm_call_log`.
   - Diagnose the canonical ZKP store-write / mint path. Draft a fix PR on repid-engine. Do not merge.
   - Stamp measured last-write + root cause on this bus and on trustshell #151 (finding already commented).
2. **P1 get_scaled_reward OUTPUT CAP PR** — XC61: no cap PR exists. Live clamp is only `clampEventDelta ±9990`; one event can fill the scale; parallel events are not rate-limited; earn-gate still shadow unless `REPID_RUN_EARN_GATE=true`.
   - Draft the output-cap PR so XC can red-team (count-floor / race / config injection).
   - Do not flip `REPID_RUN_EARN_GATE` in prod.
3. **P2 HYP-5 CALLSITES 13→0** — tests-only ratchet in `tests/provider-egress-guard.test.ts` (repid-engine #696). Files do NOT overlap #736/#737. Adapters/probe/noise may stay; callsites must shrink. Ceiling only lowers.
4. **P3 HAL quorum measure** — live 6/6 vs the claim. Code-to-claim. Draft only. #56 billing creds stay Sean-gated; do not invent keys.

## WAITING ON SEAN (not yours to merge)
- Merge drafts #736 / #737 / #151 after review.
- Optional repo var `BUILD_LOOP_MODEL` (default on #737 is valid today).
- #56 provider-billing creds.
- Key rotation (XC61 list).

## NOT YOURS
Merge. Publish 1.4.0. Rotate wallets or enterprise_api_key. MODE=full restart-all. Marketplace prod INSERT. PAI name uniqueness. Trustshell.ts rebase while XC is on a PR.

## LOOP PROTOCOL
Work phases in order. After each: open a draft PR (never merge), stamp HANDOFF, one-line status on trinity-vault#1 + this inbox. When the NOW list is empty, STOP the cron and post "CC1 queue empty — stopped." Free tokens only. Stop on FREE_EXHAUSTED.

---
# CC inbox — overnight refill 2026-09-11 00:56 PDT

/loop 25m. Free only. If NOW empty, next undone MESH_GAPS_CC or verify newest XC PR.

## NOW (prior refill — treat as DONE unless a check fails)
1. Re-verify #128 after XC 429 fix — literal `--name pai-night-1` must exit 0.
2. TrustKeys #7 — confirm tests still 3/3; if Sean has not merged, leave it; if merged, write one trustshell snippet that reads readAllowance as cap.
3. MARKET_CATALOG_GAP — do not seed prod. Draft seed JSON for ONE demo listing (agent + price + cap) in docs only.
4. #127 CI stay green. If red, fix.
5. KEYLESS_MINT.md — if missing exact HTTP status, run the script again and stamp.
6. Verify #126 mergeable + README bearer wording still present after rebases.

## NOT YOURS
trustshell.ts rebase while XC is on it. Prod INSERT into agent_listings.
