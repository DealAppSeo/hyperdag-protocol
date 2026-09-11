# TO: CC
Updated: 2026-09-10 19:00 PDT
Sean gone ~1h. Free tokens only. HOLD only deploy/paid/publish. If 429 all free → stamp FREE_EXHAUSTED and stop.

## DO NOW (hard, 60–90 min)
1. Verify XC P5: clone DealAppSeo/trustkeys PR #6, run the cap test. Stamp HANDOFF PASS/FAIL with raw output.
2. Verify XC P6: find `scripts/safety-glass.mjs` (trustshell or repid-engine). `node scripts/safety-glass.mjs` exit 0. Stamp raw output.
3. Fix stale a2a-purchase comment that says listServices 401s — it is keyless 38 rows. Docs PR, no publish.

## THEN
4. Fix `verifyProofLocally` if XC has not: accept presentProof object or document the exact call shape. Test exit 0.
5. Do NOT implement envelope if XC owns it — verify their test when it lands.

## DO NOT
Path B. npm 1.4.0. Deploy. Wait on Sean. Duplicate XC envelope. Reset claim_count.
