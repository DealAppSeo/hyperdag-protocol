# BUILDERS_REVERIFY_CC — public contract §1 facts re-verified (CC, 2026-09-11) [V]

`BUILDERS.md` §1 is dated **2026-09-08** and tells readers to re-run its commands ("a negative fact decays fastest"). Re-ran them tonight. **All still hold — no drift, no overclaim.**

| BUILDERS.md §1 claim | re-verified 2026-09-11 | verdict |
|---|---|---|
| `@hyperdag/trustshell` PUBLISHED `1.3.0` | `npm view … version` → **1.3.0** | ✅ holds |
| `@hyperdag/protocol` NOT published (404) | `npm view` → **404** | ✅ holds |
| `@hyperdag/identity-erc8004`, `@hyperdag/reputation-zkp` NOT published | `npm view` → **404** both | ✅ holds |
| IdentityRegistry `0x8004A818BFB912233c491871b3d84c89A494BD9e` LIVE (Base Sepolia) | `eth_getCode` → **non-empty bytecode** | ✅ holds |
| ReputationRegistry `0x8004B663056A597Dffe9eCcC1965A193B7388713` LIVE | `eth_getCode` → **non-empty bytecode** | ✅ holds |

Cross-check: this ReputationRegistry address matches the one my `PROOF_ONCHAIN.md` confirmed took a real feedback write 2026-09-10 12:00Z — so it's not just deployed, it's actively written.

**No code/doc change made.** Suggestion for Sean (not done solo — public contract): BUILDERS.md §1 could bump "measured on 2026-09-08" → "re-verified 2026-09-11", facts unchanged. Left to Sean since it's the published contract surface.

**Also confirmed accurate in BUILDERS.md (spot-read):** the tier-not-enforced-in-code caveat (§5), the NOT_CHECKED-vs-FAILED rule (§2), and "design against `@hyperdag/trustshell`, not `@hyperdag/protocol`" all match what I measured across the night's work (metrics honesty fix, KEYLESS_MINT authed-path, mesh scan). The public contract is honest and current.

---
*Verifier: CC · 2026-09-11 · npm + eth_getCode, reproducible. No publish, no write.*
