# AGENT RESTART CHECKLIST — Sean-only (G6)
**Written** 2026-09-10 by CC (Loop 4). **CC does not press restart — this is a Sean action.**
**Mirror to GitHub** `repid-engine/docs/living/` in the same hour it lands here (parity rule).

> ⚠️ **Read this first — the framing changed on live evidence.** The `agent_heartbeat` table froze 2026-07-17, which *looks* like 12 dead agents. It is not. The live probe feed (`v_agent_liveness`, from `agent_health_probes`) shows **all 12 loops ADVANCING right now** (iterated 2–3 min ago, loop_count ~4100). The real defect is **throughput, not liveness**: none has **claimed a task in >24h** (`not_claiming_24h = true` for all 12; last claims range 8–83 days ago). So a blind "restart the dead swarm" can *restart healthy loops and still not fix the thing that's broken.* Diagnose the claim path first.

## Step 0 — Query the honest instrument before touching Railway
```sql
SELECT agent_name, loop_state, min_since_iteration, loop_count,
       hrs_since_task_claim, not_claiming_24h, probe_feed_stale
FROM v_agent_liveness ORDER BY loop_state, hrs_since_task_claim DESC;
```
- If `probe_feed_stale = true` → the prober itself is down; fix that first (the view is blind, don't trust it).
- `loop_state = advancing` + `not_claiming_24h = true` → **do NOT restart for liveness.** The loop is fine; the claim path or task supply is the problem (see Step 3).
- `loop_state = down` or `hung` → that specific service is a restart candidate (Step 2).

## Step 1 — Per-service readout (print BEFORE any restart)
For each of the 12 `trinity-*` services, capture from the Railway dashboard / `GET /health`:
| Field | Where | Healthy looks like |
|---|---|---|
| `HEARTBEAT_MODE` | service env var | `throttled` or `off` — **never `full`** (full = ~8.6M writes/day storm) |
| `loopCount` | `/health` body | advancing between two reads 5 min apart |
| `lastIterationAt` | `/health` body | < 15 min old |
| last `llm_call_log` | DB `llm_call_log` for that agent | a row in the last hour if it's meant to be working |
| `RAILWAY_GIT_COMMIT_SHA` | service env / deploy | matches `main` HEAD; a stale SHA = running old code |

**Restart ONLY a service that is both frozen (loopCount not advancing / `lastIterationAt` stale) AND unhealthy.** A service whose loop advances does not get restarted — you would be clearing the one piece of evidence that says where the real fault is.

## Step 2 — If (and only if) a service is genuinely frozen
1. Confirm the commit SHA it will boot (must be `main` HEAD, not a stale build).
2. Restart it.
3. **It comes back `HEARTBEAT_MODE=throttled`, NEVER `full`.** Full mode is the write-storm that got presence-writes switched off in the first place.
4. Watch `loopCount` advance and `lastIterationAt` refresh within one probe cycle (~5 min).

## Step 3 — First-claim success criteria (this is what "fixed" means)
A restart is successful only when work actually flows — not when `/health` says 200:
- **One real task claim within 30 minutes** (`trinity_tasks.claimed_by = '<agent>'` with a fresh `claimed_at`), on a real task — not a diagnostic.
- **No write storm** — `agent_heartbeat` / presence writes stay bounded (throttled mode), not the ~8.6M/day pattern.
- If loops advance but still no claim in 30 min → the fault is **task supply or the claim gate**, not the process. Only 5 tasks sit `pending`; check the open pool has claimable work and the claim filter isn't excluding it.

## Step 4 — Keep the peer-verify producer behind a churn filter
Before/while reviving anything that writes to `peer_verification_queue` (already 140k rows, drain stalled):
- **Drop `EVERGREEN_AUDIT`, `diag_probe`, and `SHADOW_REJECT`** from what the producer enqueues — these are the churn that inflated the queue without moving verification forward.
- A revived agent must not re-flood the queue faster than the drain can clear it.

## Hard stops (from TODAY.md "Night forbidden")
`MODE=full` · `column rename` · `SECURITY DEFINER revoke` · `npm publish` · `new product folder` · `public launch language` · `spend`. None of these are part of a restart.

---
**Bottom line for Sean:** run Step 0 + Step 1. If every agent reads `advancing`, the restart is likely the wrong lever — the claim path is — and it can wait for morning. Restart only a service that is provably frozen, throttled not full, and judge success by a real claim in 30 min.
