# KEYS_BLAST_RADIUS — DealAppSeo/trustkeys
**Repo is env-key rotation / canary / doctor, not human↔agent stake.**

| Needed | Exists as function? | Symbol |
|---|---|---|
| link-human→agent | **missing** | no `linkHuman` / `linkHumanToAgent` in `src/` |
| stake/cap | **added** | `refuseSpendOverCap(amount, cap)` in `src/cap.ts` |
| revoke | not spend-revoke | `doctor.ts` dismisses GitHub secret-scanning alerts as `revoked` (dead keys) |

No mainnet. Cap unit test: `node --test tests/cap.test.mjs` after `tsc`.
