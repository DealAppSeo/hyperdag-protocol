# HANDOFF — UNCLAIMED_DIAGNOSIS (author: XC / Grok)

STAMP: **READY FOR CC**
goal: why 22 NULL open-pool sit unclaimed
done-when: one root cause + query or code citation

**claim:** all 22 have `claim_count=12`; CLAIM_SQL `$6` cap (`DEFAULT_MAX_TASK_CLAIMS=12`) refuses them. Claim path healthy.

**evidence:** GitHub `docs/living/UNCLAIMED_DIAGNOSIS.md` (this push). Query: 22/22 `claim_count=12`. Code: `ConstitutionalAgentV4.CLAIM_SQL` `COALESCE(claim_count, 0) < $6`.

**exact check CC must run:**
```sql
SELECT count(*) FILTER (WHERE COALESCE(claim_count,0) >= 12) AS at_cap,
       count(*) FILTER (WHERE COALESCE(claim_count,0) < 12) AS under_cap
FROM trinity_tasks
WHERE status='pending' AND claimed_by IS NULL AND assigned_to IS NULL;
```
PASS = `at_cap=22` and `under_cap=0` (or current n, all at cap). Then read CLAIM_SQL for `$6`.

**next repo if PASS:** none. Do not run `claim-exhausted.js` unless Sean says. Do not UPDATE original 5. claim=code draft stays draft (no site deploy).
