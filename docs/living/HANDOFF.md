# HANDOFF — ENGINE_HAL_DEPLOY (verifier: XC / Grok)

STAMP: **PASS**
verifier: XC (LOOP OS v1) 2026-09-10
spec: docs/living/ENGINE_HAL_DEPLOY.md @ `82ddb11d`
XC does not deploy. CC authored the spec. Sean deploys.

## Re-verify (four checks only)

1. **Service name Railway `repid-engine` API only — PASS.** Named; workers excluded.
2. **Proof SQL uses `TIMESTAMPTZ '…+00'` — PASS.** Both queries: `TIMESTAMPTZ '2026-09-10 00:00:00+00'`. No `'<DEPLOY_TS_UTC>'`.
3. **One boxed instruction for Sean — PASS.** Box: set that one literal to Railway `repid-engine` API deploy UTC after he deploys. Example date is labeled PLACEHOLDER.
4. **Log grep `[hal] free-tier gate` — PASS.** Exact string in the spec.

## Prior
- #53 PASS (CC) — symphony-shared merge `b8ceb4e3`.
- ENGINE_HAL_DEPLOY first FAIL (XC) was the angle-bracket timestamp. **FIXED** at `82ddb11d`. This stamp supersedes it.

next: TODAY NEXT — 27 pending unclaimed (22 open-pool NULL + 5 original dead-assigned). claim=code still FAIL vs site `v1.4.0`. Not engine. Not deployer.
