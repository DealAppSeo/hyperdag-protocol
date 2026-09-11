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

## CC verify — UNCLAIMED_DIAGNOSIS: **PASS** (2026-09-10)
Ran XC's query against prod. Result: **n=22, min_cc=12, max_cc=12, at_cap(=12)=22, under_cap=0.** Matches the diagnosis exactly — all 22 NULL open-pool tasks are at the durable `claim_count` cap (`MAX_TASK_CLAIMS`=12), so `CLAIM_SQL`'s `COALESCE(claim_count,0) < $6` excludes every one. Exhausted, not missing; claim path healthy. (Consistent with how they got there: inserted at claim_count=0, hammered by the failing-callLLM fleet — reclaim-on-fail — until capped.) **Did not touch UNCLAIMED_DIAGNOSIS.md (XC's file). Did not run claim-exhausted.js. Did not raise the cap.**

## CC authored this cycle (RALPH) — for XC to verify next
- `FLEET_LLM_DEPLOY.md` — target ONE service to surface #53 `[LLM]` log = **trinity-veritas** (measured freshest successful caller 21:33Z vs gcm 18:35Z); proof = grep `[LLM] provider=` + TIMESTAMPTZ-literal SQL. No deploy.
- `T12_LOOP_PAYLOAD.md` — 5-field long-chain payload spec (GOAL/DONE-WHEN/STATE/SANDBOX/budget), filled from waiting NULL task 435123. No insert.

## RALPH deliverables (CC)
- **P0 TrustShell published E2E: PASS.** `tests/e2e-published.mjs` vs published 1.3.0 + PRODUCTION engine → **exit 0, 7/7** (init health.ok, verifyOutput PASS+VETO, getRepID 2152/ESTABLISHED, presentProof verification.verified=true, register agentId + erc8004TokenId=null NOT_MINTED). PR: **https://github.com/DealAppSeo/trustshell/pull/122**. Finding: shipped 1.3.0 `register` needs `{agentName}` (not `{name}` → 400). No merge/publish.
- **P1 On-chain receipt: PROVEN.** Latest ReputationRegistry write tx `0xf03f3d69…4cd10`, block **46636674**, status **0x1 success**, to `0x8004b663…8713`, 1 log; token 6708 → repid 1050 ESTABLISHED (12:00Z cron). Writes **NOT paused**. `PROOF_ONCHAIN.md` (RPC-verified). 
- **P2 Plonky3 postcard: DONE + gap named.** `presentProof(trinity-shofet,{verify:true})` → verified:true, `plonky3_range_check`, 14232 b64 (saved `postcard-trinity-shofet.b64`). **Finding: NOT minimal disclosure** — public statement reveals the exact `repid_score:2150` (not just ≥threshold). Missing exports for smaller tiers: `envelope/package/box/vault` (all absent). Bug: `verifyProofLocally` fails on presentProof's object ("expected a string"). Next tier = a `disclose:'tier'` mode that hides the score + fix verifyProofLocally, with tests. `PLONKY3_POSTCARD.md`.
- **P3 x402 blast radius:** next.
