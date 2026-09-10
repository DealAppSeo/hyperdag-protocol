# UNCLAIMED_DIAGNOSIS — 22 NULL open-pool sit unclaimed
**2026-09-10. XC. No UPDATE. Original 5 untouched.**

## Root cause (one)
**Concurrency cap: `claim_count` already at `MAX_TASK_CLAIMS` (12).** CLAIM_SQL will not serve them. Claim path is healthy; these 22 are exhausted, not missing.

## Query
```sql
SELECT id, claim_count, task_type, title
FROM trinity_tasks
WHERE status = 'pending'
  AND claimed_by IS NULL
  AND assigned_to IS NULL;
```
Live 2026-09-10: **n=22, all `claim_count=12`, `claim_count<12` = 0.**

## Code
`lib/ConstitutionalAgentV4.js` `CLAIM_SQL`:
```
AND COALESCE(claim_count, 0) < $6
```
`$6` = `ConstitutionalAgentV4.maxTaskClaims()` default **12** (`DEFAULT_MAX_TASK_CLAIMS`). Comment at getNextTask: exhausted task stays `pending` but stops being served; recovery is `scripts/ops/claim-exhausted.js` (not run here).

## Not the cause
Predicate `assigned_to IS NULL` matches. Types `research|review|meta|critique` are in default `AGENT_TASK_TYPES`. `v_agent_liveness`: 12/12 responding, loop_count ~73. Original 5 are a **different** pile (`assigned_to` dead names).

## One-line default (inserts, not these 22)
`assigned_to` must stay **NULL** (or a live `v_agent_liveness` name). These 22 already are NULL; the cap is why they sit.

Do not raise the cap. Do not run claim-exhausted.js unless Sean says so.
