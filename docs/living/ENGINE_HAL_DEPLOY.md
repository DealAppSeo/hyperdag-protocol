# ENGINE_HAL_DEPLOY — deploy target + proof for the HAL free-tier gate (#716)
**Authored 2026-09-10 (CC, LOOP OS author cycle).** #716 is **MERGED** to repid-engine main (merge commit `913473c5`, 2026-09-10 22:08Z). **Do not merge. Do not deploy — this is the target + proof spec; Sean deploys.**

## What #716 does
`src/hal/hal-free-gate.ts` + a wire at `fact-check.ts:~2015` make the HAL fact-check **OpenRouter backfill** refuse the paid slug `qwen/qwen-2.5-72b-instruct` (default AND any paid `HAL_S2_OPENROUTER_MODEL` override) while `allow_paid=false`, falling back to the verified-live `nvidia/nemotron-3-ultra-550b-a55b:free`. A `:free` operator override is honoured. `allow_paid` is false unless `SEAN_PAID_LOOP` (or legacy `ALLOW_PAID`) is set to a non-hold value.

## Deploy target — exactly one service
**Railway service `repid-engine` (the API) ONLY.** The HAL fact-check quorum runs **in-process inside the API server** (`src/index.ts`), so the gate ships with the API deploy.
- ❌ **NOT** `attestation-minter` (cron `scripts/cron/mint-attestation.mjs`), **NOT** `receipt-indexer`, **NOT** `proof-drain-worker` — none runs the fact-check quorum, so redeploying them changes nothing here.
- Redeploy the `repid-engine` API service from **main @ `913473c5`** (or newer main HEAD).

### Precondition for the gate to engage
`SEAN_PAID_LOOP` must be **unset / `hold` / `false`** on the `repid-engine` service (that is the default). If it is set to a loop value, paid `qwen` is intentionally allowed (the escape hatch).

## Proof — after the deploy (three signals)
Let `<DEPLOY_TS_UTC>` = the deploy completion time of the `repid-engine` API service.

**1. Run log (positive — the gate fired).** Grep the `repid-engine` API service logs after `<DEPLOY_TS_UTC>`:
```
[hal] free-tier gate: allow_paid=false — paid default suppressed, using nvidia/nemotron-3-ultra-550b-a55b:free
```
(or `… REFUSED paid HAL_S2_OPENROUTER_MODEL=…` if that override is set). Presence on a HAL verify = gate live.

**2. SQL (negative — the goal met).** No OpenRouter call uses the paid qwen after the deploy. **These run as-is** (last-15-min window). Once the API deploy time is known, swap the interval line for a precise pin — e.g. `AND created_at > TIMESTAMPTZ '2026-09-10 23:00:00+00'` (substitute the real `repid-engine` API deploy timestamp):
```sql
-- MUST return 0 while SEAN_PAID_LOOP is unset:
SELECT count(*) AS paid_qwen_calls
FROM llm_call_log
WHERE provider = 'openrouter'
  AND model = 'qwen/qwen-2.5-72b-instruct'
  AND created_at > now() - interval '15 minutes';   -- or: > TIMESTAMPTZ '<API deploy ts>+00'

-- Free slug should appear instead (or openrouter absent if the nvidia family
-- collapses with nvidia-nim and the slot is skipped):
SELECT model, count(*) AS calls, max(created_at) AS last
FROM llm_call_log
WHERE provider = 'openrouter'
  AND created_at > now() - interval '15 minutes'     -- or: > TIMESTAMPTZ '<API deploy ts>+00'
GROUP BY model ORDER BY calls DESC;
```
PASS = `paid_qwen_calls = 0`; the grouped query shows `nvidia/nemotron-3-ultra-550b-a55b:free` (or no openrouter row). *(Fixed 2026-09-10 per XC FAIL: angle-bracket placeholder was not a runnable timestamp; now runs as written.)*

**3. Negative control (proves it's the gate, not luck).** Temporarily set `SEAN_PAID_LOOP` to a loop value, trigger one HAL verify → the count query returns **>0** qwen rows again; unset it → back to 0 / `:free`. **Do not leave `SEAN_PAID_LOOP` set.**

## Scope caveats (so the proof isn't over-read)
- This gate covers the **fact-check OpenRouter backfill** only. The **escalation/frontier** tier (`or-gpt` = `openai/gpt-4o`, `or-claude` = `anthropic/claude-sonnet-4` via OpenRouter, `fact-check.ts:~2179/2188`) is a separate, escalation-gated paid path — **not** covered by #716.
- The **adversarial-judge** path (`src/services/adversarial-judge.ts`) and the broader 26-file provider-egress surface are also out of scope.
- So "no qwen unless SEAN_PAID_LOOP" is the specific, provable claim; "HAL never spends" is **not** — the frontier + judge paths remain a separate decision.

## One-line verdict for Sean
Deploy the **`repid-engine` API service** from main `913473c5` with `SEAN_PAID_LOOP` unset; then `paid_qwen_calls = 0` (SQL #2) + the `[hal] free-tier gate:` log line proves the OpenRouter backfill stopped calling paid qwen. Not deployed by CC.
