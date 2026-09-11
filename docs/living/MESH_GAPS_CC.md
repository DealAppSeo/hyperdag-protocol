# MESH_GAPS_CC — mint / stake / escrow / proof across the mesh (CC, 2026-09-10)

Scan of four repos for the four capability families, each classified LIVE (hits the real engine/DB/chain) vs STUBBED (hardcoded/mock/local-only). Distinct from XC's `docs/MESH_GAPS.md` (their smallest-read = lastAnchorTx); mine = the stake read.

## repid-engine — the server. All four families are LIVE (verified in source + probed)
| family | route | file:line | status |
|---|---|---|---|
| mint | `POST /api/v1/agents/:id/mint` | `src/routes/agents-onchain.ts:54` | LIVE (Bearer-gated, gas) — see KEYLESS_MINT.md |
| stake | `GET /api/v1/stake/authority/:builder_id` | `src/routes/v1.ts:533` | **LIVE, keyless** — real `getCurrentStake`+`snapshotAuthority`; probed 200 |
| stake | `GET /api/stake/recent`, `/api/stake/seeded` | `src/routes/stake.ts:106,124` | LIVE — real Supabase (`repid_mvp_*`) |
| escrow | `POST /api/v1/contracts/:id/escrow` | `src/routes/v1/contracts.ts:264` | LIVE |
| proof | `GET /api/v1/agents/:id/proof/:job_id`, `/repid/:id/proof`, `/agents/:id/zkp/:type` | `agents-external.ts:1121`, `repid.ts:286`, `agents.ts:257` | LIVE |

> Correction to the sub-scan: it reported "no per-builder authority read exists." **False** — `GET /api/v1/stake/authority/:builder_id` exists, is keyless, and returns real computed authority (`{builder_id, stake_total, authority, authority_withheld, authority_detail, basis}`). Probed live 2026-09-10: `trinity-sophia` → `stake_total:0, authority:null, withheld:true` (honest — floor not passed).

## trustrepid — LIVE client, one stake gap (now filled)
| family | file:line | status |
|---|---|---|
| stake/proof/escrow(bounties) | `lib/engine.ts` getAgents/getAgent/getZKPDisclosure/getBounties | LIVE against engine |
| **stake authority** | `lib/engine.ts` (was absent) | **GAP → implemented** `getStakeAuthority()` (PR #8) hitting the live keyless endpoint |
| mint (metrics fallback) | `app/api/metrics/route.ts:34` | STUBBED — hardcoded `{agents:33,vdr:50,…}` on Supabase error (a fail-safe fallback, not a core read) |

## trustkeys — local-only by design
| family | file:line | status |
|---|---|---|
| stake (allowance/cap) | `src/allowance.ts`, `src/cap.ts` | STUBBED-by-design: in-memory Map + local cap check, "No mainnet". This is a sandbox spend-cap primitive, NOT an engine mirror — wiring it to the network would change its nature; left as-is. |

## trustmarket — proof stub awaiting HAL+x402
| family | file:line | status |
|---|---|---|
| proof | `lib/hal-verify-claim.ts:30,52` | STUBBED (shadow): `verifyClaimStub()` → `{outcome:'NOT_CHECKED', calledHal:false, bought:false}`; shadow listing `price_usdc:0, buy:false`. Awaiting real HAL wiring + x402. |
| cap (buy path) | `lib/pay-cap.mjs` + `lib/engine.ts` createRental | LIVE cap enforcement (#10) + live-catalog integration test (PR #11) |

## What I implemented (the one live read, stake-preferred)
`trustrepid getStakeAuthority(builderId)` → live `GET /api/v1/stake/authority/:builder_id`. Chosen over the trustkeys allowance stub (that one is a deliberate local sandbox primitive with no engine equivalent — `authority` ≠ `allowance cap`) and over the trustrepid metrics fallback (not stake). Contract probe PASS for trinity-sophia + trinity-shofet. PR: DealAppSeo/trustrepid#8.

## Remaining mesh gaps (not implemented tonight — flagged, not silently dropped)
- **trustmarket proof** is still a shadow stub (needs HAL wiring + x402) — biggest real gap.
- **trustrepid metrics** returns a hardcoded fallback on Supabase error — silent fake data; should surface an error/NOT_CHECKED instead.
- **mint** has no keyless path anywhere (by design) — KEYLESS_MINT.md documents the authed path for Sean.

---
*Scan: CC + Explore subagent · engine routes read in source + probed live · 2026-09-10. No publish.*
