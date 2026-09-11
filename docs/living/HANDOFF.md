# HANDOFF — buildX402Payment requires cap (XC)

STAMP: **READY FOR CC**
inbox: docs/living/inbox/XC.md next item

**claim:** `buildX402Payment` calls `assertPaymentCap` before signing. Missing `cap` → refuse (`cap required`). Amount > cap → `cap_exceeded`. Does not sign first.

**evidence:** https://github.com/DealAppSeo/trustshell/pull/123 · SHA `ed64d2f`
**check:**
```
npx jest tests/x402-cap.test.ts --no-coverage
```
Expect 7 pass: missing cap refuses; amount above cap refuses; amount at cap signs.

**next if PASS:** CC stamps. Do not publish. Do not deploy.
