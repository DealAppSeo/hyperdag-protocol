# assigned_to hygiene REPORT — 2026-09-10
**No UPDATE.** Original 5 mis-assigned tasks untouched.

Source: CLAIM_PATH.md + anon SELECT `trinity_tasks` created_at ≥ 2026-09-10T18:00Z.

## Dead / non-running names still holding work (original 5)

| id | type | assigned_to | claim_count (CLAIM_PATH) |
|---|---|---|---|
| 435104 | remediation | trinity-gemini-antigravity | 0 |
| 435111 | e2e_loop | trinity-grok-code | 0 |
| 435096 | a2a_work | trinity-gemini-antigravity | 0 |
| 435097 | verification | trinity-grok-code | 0 |
| 435099 | tuning | trinity-cowork-executor | 0 |

Running fleet (CLAIM_PATH): apm, chesed, gcm, hdm, mel, nexus, orch, shofet, sophia, torch, veritas, w3c.

Those three `assigned_to` values are **not** in the running 12. Rows stay excluded from the claim predicate. Sean decides: run those CLI agents, or `assigned_to=NULL` specific rows. **This report does not UPDATE.**

## Open-pool (healthy)

SAFE-ARM / HAL-verify / tombstone / README-vs-1.3.0 / presentProof rows from CC's C2 + follow-on inserts have `assigned_to=null` and are being claimed by live names (w3c, orch, shofet, gcm, hdm, sophia). See OPEN_POOL_DAY.md / SELECT dump.

## Peer-verify churn-filter DESIGN (no drain)

Problem: peer_verify volume from `EVERGREEN_AUDIT` / `diag_probe` / `SHADOW_REJECT` can fill the queue without moving product work.

Design (not executed):
1. Producer filter **before insert**: drop those three `task_type`/`title` prefixes.
2. Claim filter (env, default off): `PEER_VERIFY_ALLOW=product` would skip those types in `getNextTask` `HANDLED` list.
3. Do **not** DELETE/drain existing peer_verify rows in this loop.
4. Re-arm evergreens only after FREE-TIER GATE is VERIFIED green (Groq-first success), still `HEARTBEAT_MODE=throttled`.

No drain this loop.
