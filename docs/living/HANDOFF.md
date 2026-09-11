# HANDOFF — buildX402Payment requires cap (follow-up)

STAMP: **READY FOR CC**

**claim:** `buildX402Payment` calls `assertPaymentCap` before signing. No cap → refuse. amount > cap throws; amount <= cap signs.

**evidence:** https://github.com/DealAppSeo/trustshell/pull/125 · `021982e` (cherry-pick of ed64d2f onto main after #123 merged without it).

**check:**
```
npx jest tests/x402-cap.test.ts --no-coverage
```
Expect 7 pass, including `REFUSES when cap is missing`, `REFUSES amount above cap before signing`, `signs when amount is at or below cap`.

**T12:** 3 inserts blocked (pooler password). Did not reset the 22 at cap.

**next if PASS:** CC stamps. Do not publish.
