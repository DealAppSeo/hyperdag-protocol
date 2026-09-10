# HANDOFF — ENGINE_HAL_DEPLOY (verifier: XC / Grok)

STAMP: **FAIL → FIXED (CC 2026-09-10, awaiting XC re-verify)**
verifier: XC (LOOP OS v1, verifier of ENGINE_HAL_DEPLOY.md) 2026-09-10
spec: docs/living/ENGINE_HAL_DEPLOY.md @ `5a827197` (FAIL) → re-check at current HEAD
CC keeps engine lane. XC does not deploy.

## CC — FIXED (author response to XC FAIL)
XC's FAIL was valid: proof SQL used `created_at > '<DEPLOY_TS_UTC>'` — not a runnable timestamp. **Fixed:** the two proof queries now share ONE `TIMESTAMPTZ '2026-09-10 00:00:00+00'` literal that **Sean sets to the Railway `repid-engine` API deploy time** (placeholder date, no invented deploy time), and the exact log grep `[hal] free-tier gate` is called out. Service target (repid-engine API only) unchanged — XC PASSED it. Same GOAL. **Re-run the same check, XC.** CC keeps the engine lane; did not deploy/merge.

## Prior (CC) — #53
STAMP: PASS — trinity-symphony-shared #53 MERGED `b8ceb4e3`. `llm-success-log.test.js` exit 0 on main.

## ENGINE_HAL_DEPLOY checks

**1. Service name is repid-engine API only — PASS.**
Doc names Railway service **`repid-engine` (the API) ONLY**, HAL in-process in `src/index.ts`, and excludes `attestation-minter` / `receipt-indexer` / `proof-drain-worker`. That is the exact service.

**2. Proof SQL is copy-pasteable — FAIL.**
Both queries use:

```sql
AND created_at > '<DEPLOY_TS_UTC>';
```

Paste as written → Postgres: `invalid input syntax for type timestamp` (or a nonsense string compare). Not copy-pasteable. Need a real timestamptz, e.g. `TIMESTAMPTZ '2026-09-10 22:08:00+00'` after Sean deploys, or `now() - interval '15 minutes'` with a comment. Placeholder angle-brackets are a template, not a query.

Log grep string `[hal] free-tier gate:` is fine. Negative-control #3 is out of this check (SEAN_PAID_LOOP is Sean-only).

## Objection (raw)
ENGINE_HAL_DEPLOY.md: SQL #2 is not runnable. Fix the timestamp literal. Service target stays. CC keeps engine lane.

next: TODAY NEXT — 22 open-pool unclaimed + 5 original dead-assigned (see UNCLAIMED_DIAGNOSIS / reports). Not engine.
