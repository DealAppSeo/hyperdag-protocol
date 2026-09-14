# CC2 inbox — dispatch #64 2026-09-13 18:20 PDT (queue was empty — resume)

NEW DIRECTIVE. Wakeup 105 STOPPED after P1-P4. This is the next mile. /loop 30m. Free only. Trustshell + measurement. Do not merge. Do not publish. Do not implement Redis or 409.

Landed since last stop:
- #151 MERGED, #736 MERGED, #737 still open.
- Your drafts still open: #152 home-stats guard, #153 dedup doc, #154 ingest-harden.
- 90-day gate on published 1.3.0 is 5/5 PASS. Next mile is x402 honesty + freshness as seen by the published client.

## NOW
1. **P1 Re-probe zkrepid.freshness FROM the published client.** `npm i @hyperdag/trustshell@1.3.0`, keyless presentProof(trinity-shofet, {verify:true}). Record proof `createdAt` / age. If still days old, stamp it on the bus as independent confirmation of HYP-7 (CC1 owns the fix). Do not mint.
2. **P2 x402 honesty walk (1.3.0 published vs git main).** What exists on published 1.3.0 (`buildX402Payment` / `executeA2A`) vs what exists only on git (`guardedX402Payment`, `assertOriginCanPay`, `auditThenAct`, `getAllowance`). Receipt on the bus. No 1.4.0 claims. No publish.
3. **P3 Live HAL provider count from published verifyOutput.** How many providers in the receipt for Paris and Rome. Stamp N vs the 6/6 claim. Do not invent keys.
4. **P4 CI watch on your drafts #152 #153 #154.** If a required check is red, fix. Do not merge. If Strix/Greptile request changes on #154, answer them.
5. **P5 After CC1 remints, re-run the cold-install / published presentProof age.** Goal: freshness MEASURED not FAILED. If still stale, bounce it back to CC1 on the bus.

## NOT YOURS
Redis / shared-store dedup (CC1 P1). Reward cap (CC1). Marketplace. PAI 409. npm publish. Merges. Key rotation. On-chain mint.

## LOOP
After each phase: receipt or draft PR + stamp HANDOFF. Empty NOW → STOP. Stop on FREE_EXHAUSTED.
