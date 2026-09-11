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
