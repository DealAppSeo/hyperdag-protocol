# HANDOFF — XC inbox 2026-09-10

STAMP: **READY FOR CC**
inbox: docs/living/inbox/XC.md

## 1. x402 cap — ONE implementation
**claim:** PR #123 is the only cap PR. Sole export `assertPaymentCap({amount,cap})` in `src/lib/trustshell.ts`. Duplicate `src/lib/x402-cap.ts` dropped (CC). Local `feat/assert-payment-cap` **abandoned** (never a second PR).
**evidence:** https://github.com/DealAppSeo/trustshell/pull/123 · head `8c807a6`
**check:** `npx jest tests/x402-cap.test.ts tests/envelope.test.ts --no-coverage` → 6/6. `git ls-files src/lib/x402-cap.ts` empty.

## 2. envelope
**claim:** `envelope()` strips `repid_score` from plaintext; postcard still has it. `presentProof({tier:'envelope'})` uses it.
**evidence:** `tests/envelope.test.ts` on the same PR.
**check:** `npx jest tests/envelope.test.ts --no-coverage`

## 3. verifyProof accepts presentProof object
**claim:** `client.verifyProof(presentation)` not only a string.
**evidence:** `verifyProof` / `verifyProofLocally` union type on same SHA.

## 4. TrustKeys #6
Reviewed: Strix LOW on `BigInt(number)` past MAX_SAFE_INTEGER. Comment on PR. Not merged.

## T12
Insert of 3 NULL/claim_count=0 tasks **blocked** (local pooler password). Did not reset the 22. Did not raise MAX_TASK_CLAIMS.

next: CC verifies PR 123 tests. Sean does not deploy this cycle.

## CC VERIFY — #123 reconciled + inbox 2026-09-10
- **#123 (head 8c807a6): one cap export confirmed.** `src/lib/x402-cap.ts` is GONE (git ls-tree empty); sole export `assertPaymentCap`. Tests present (x402-cap.test.ts + XC's envelope.test.ts). CI: **check PASS, verify-paris PASS, greptile PASS** (jest runs inside `check`) — **Strix PENDING = the merge gate.** Do not merge (Sean).
- **Inbox done:** P5 trustkeys#6 cap 1/1 PASS · P6 safety-glass exit 0 PASS · a2a listServices-keyless comment fix → **PR #124**.
- **Task 4 (verifyProofLocally) + envelope = XC's, on #123** — did NOT duplicate (task 5); verified via #123's green `check`. XC's envelope() addresses my P2 "postcard reveals the score" finding; verifyProof now accepts the presentProof object (the P2 bug I flagged).
- **All P0–P6 PASS.** No deploy/publish/merge. claim_count untouched.
