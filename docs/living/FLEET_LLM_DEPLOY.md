# FLEET_LLM_DEPLOY — deploy target + proof for #53 `[LLM]` success log
**Authored 2026-09-10 (CC, RALPH / LOOP OS author).** PR #53 (trinity-symphony-shared, **MERGED `b8ceb4e3`**) adds `[LLM] provider= model= task=` on **callLLM success** in `ConstitutionalAgentV4`. **Do not deploy — this is the target + proof spec; Sean deploys.**

## Deploy target — ONE service (measured, not guessed)
**Railway service `trinity-veritas`** (an agent service).

Measurement 2026-09-10 ~22:25Z — last task claim + completion, by agent:
| agent | last claim | done (6h) |
|---|---|---|
| **trinity-veritas** | **21:33:38Z** | 1 ← freshest successful caller |
| trinity-orch | 21:33:45Z | 1 |
| trinity-w3c | 20:30Z | 2 |
| trinity-gcm | **18:35Z** | 1 ← ~3h stale |

Between Sean's two candidates (**veritas / gcm**), **veritas is the fresher canary**: it completed a task — i.e. its `callLLM` **succeeded** — at 21:33Z, versus gcm's last at 18:35Z. The `[LLM]` line only fires on *success*, so redeploying the most-recently-successful caller surfaces it soonest. Redeploy `trinity-veritas` from **symphony-shared main @ `b8ceb4e3`** (#53). (`trinity-orch` is an equally fresh second canary if wanted.)

All 12 agent services run the same shared code, so any actively-cycling agent would eventually emit it; veritas is chosen because it is the most-recently-observed *successful* caller.

## Proof — after redeploying `trinity-veritas`
**1. Log grep (primary).** In the `trinity-veritas` Railway logs after deploy:
```
[LLM] provider=
```
#53 emits `[LLM] provider=<p> model=<m> task=<t>` on each `callLLM` success. Presence = #53 live on this service.

**2. SQL (corroborating, TIMESTAMPTZ-literal, copy-pasteable).** veritas actually called an LLM / did work after the deploy.
**Sean: set the ONE `TIMESTAMPTZ` literal to the `trinity-veritas` Railway deploy time (UTC), then run.** The example date is a PLACEHOLDER — replace it.
```sql
-- veritas made >= 1 attributed LLM call after its deploy:
SELECT count(*) AS veritas_llm_after_deploy
FROM llm_call_log
WHERE agent_id = (SELECT id FROM repid_agents WHERE agent_id = 'trinity-veritas')
  AND created_at > TIMESTAMPTZ '2026-09-10 00:00:00+00';   -- ← paste veritas deploy time

-- Fallback (llm_call_log agent_id attribution is sparse): a completed task implies a callLLM:
SELECT count(*) AS veritas_done_after_deploy
FROM trinity_tasks
WHERE claimed_by = 'trinity-veritas' AND status = 'done'
  AND completed_at > TIMESTAMPTZ '2026-09-10 00:00:00+00';   -- ← same deploy time
```
PASS = either count `> 0` (and the `[LLM] provider=` log line is present).

## Notes / scope
- The `[LLM]` line is a **stdout** signal (the primary proof); the SQL corroborates that veritas actually called an LLM / completed work after the deploy, since a merged-but-undeployed service can't emit the new log.
- Do **not** invent the deploy time — paste the Railway `trinity-veritas` deploy UTC into the one literal.
- Redeploying `trinity-veritas` does **not** revive the whole fleet's throughput (still XC's PROVIDERS-model + claim-path work); it only surfaces the #53 log on that one service. Do not deploy others to "prove" it — one canary is the ask.

**Do not deploy. #716 / #53 stay merged.**
