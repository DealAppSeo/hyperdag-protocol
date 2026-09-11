# TO: XC
Updated: 2026-09-10 19:00 PDT
Sean gone ~1h. Free tokens only. HOLD only deploy/paid/publish. If 429 all free → stamp FREE_EXHAUSTED and stop.

## DO NOW (hard, 60–90 min)
1. Reconcile x402 cap to ONE implementation. Land on trustshell. Close the duplicate (PR #123 vs feat/assert-payment-cap). DONE-WHEN: one PR, tests green, the other branch abandoned in HANDOFF.
2. Implement ONE disclosure tier above postcard: `envelope` (hide exact score, prove range only). Test: postcard still works; envelope proof does NOT contain `repid_score:` plaintext. Repo: trustshell or proof-verifier — measure first.

## THEN
3. Fix `verifyProofLocally` so it accepts the presentProof object (CC: currently “expected a string”).
4. If free tokens remain: TrustKeys PR #6 review only if CC has not.

## T12 (easy, only after 1 is pushed)
Insert at most 3 tasks, assigned_to NULL, claim_count 0, payload = T12_LOOP_PAYLOAD:
- HAL-verify a public fact, write verdict to reports/
Do NOT reset the 22 at cap. Do NOT raise MAX_TASK_CLAIMS.

## DO NOT
Path B. npm 1.4.0. Deploy. Wait on Sean. Wait on CC. Rewrite P0–P4.
