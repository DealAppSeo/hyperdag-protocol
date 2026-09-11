# MARKET_CATALOG_GAP_CC — why the TrustMarket catalog is empty (CC, 2026-09-10) [V]

Surfaced by PR #11 (live-catalog cap test saw 0 listings). Root-caused read-only: source + live SQL. **Not fixed here** — the fix is a design call (seed vs. reconcile tables), not a silent change to the shared engine.

## Two findings
**1. Seeding gap (the immediate blocker).** Both candidate tables are empty [V SQL 2026-09-10 on `qnnpjhlxljtqyigedwkb`]:
```
agent_listings        rows=0  active=0
marketplace_listings  rows=0  active=0
```
So `GET /api/v1/marketplace/listings` correctly returns `{"listings":[]}` — the endpoint works; there is simply nothing to sell. **End-to-end demo of the cap/buy path (#10 `assertPayCap` → #11 integration) cannot run** because there is no listing to purchase.

**2. Read/write table split (latent, will bite after seeding).** The public catalog and the P0 list/browse surface point at **different tables**:
| surface | route | file | table |
|---|---|---|---|
| public catalog (sandbox buy flow reads this) | `GET /api/v1/marketplace/listings` | `src/routes/v1/marketplace.ts:116` | **`agent_listings`** |
| sandbox rental (buy) | `POST /api/v1/marketplace/rentals` | `src/routes/v1/marketplace.ts` | `rental_records` |
| P0 "TrustMarket-light" | `POST /list`, `GET /browse` | `src/routes/marketplace.ts` (mounted first, but defines `/list`+`/browse`, **not** `/listings`) | **`marketplace_listings`** |

Consequence: seeding via the P0 `/list` path writes `marketplace_listings`, but the public `/listings` reads `agent_listings` — a listing created through P0 would **never appear** in the sandbox catalog. The two are parallel catalogs. (Mount order confirms GET `/listings` falls through P0 to `v1/marketplace.ts`, so `agent_listings` is authoritative for the sandbox.)

## Recommendation (Sean / XC decide — do not silently change the shared engine)
- **Fastest MVP unblock:** seed `agent_listings` with a few active rows (the table the sandbox actually reads), so the cap/buy path has something to exercise end-to-end.
- **Then reconcile the split:** pick ONE listings table for both the write (P0 `/list`) and the public read (`/listings`), or point them at the same one. Otherwise the P0 surface stays invisible to buyers. This is a schema/routing decision with consumers this repo can't enumerate → not a solo change.

## Not changed
No engine code touched; no rows written. Finding only. `agent_listings` schema not altered.

---
*Verifier: CC · 2026-09-10 · source read (v1/marketplace.ts:116, marketplace.ts) + live row counts. No publish, no write.*
