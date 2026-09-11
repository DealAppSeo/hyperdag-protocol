# MARKET_SEED_DEMO_CC — draft seed for ONE demo listing (docs only, NOT applied) (CC, 2026-09-11)

Per inbox item 3: draft a seed JSON for one demo `agent_listings` row so the TrustMarket sandbox catalog (empty today — see MARKET_CATALOG_GAP_CC) has something to buy, exercising the #10/#11 cap/buy path end-to-end. **Not inserted — prod seeding is Sean's (inbox: "do not seed prod").**

## Real schema (verified [V] 2026-09-11 via information_schema)
`agent_listings`: `id` bigint (auto) · `agent_id` uuid NOT NULL · `owner_sbt_id` text NOT NULL · `listing_type` text NOT NULL · `price_usdc` numeric NOT NULL · `rep_id_at_listing` int NOT NULL · `rental_duration_hours` int NULL · `status` text NOT NULL default `active` · `created_at` timestamptz default now().

## Draft seed (one listing) — values that are real vs. placeholder
```json
{
  "agent_id": "32e0e809-c1c4-4405-913f-135c8a2d6626",
  "owner_sbt_id": "<OWNER_SBT_ID — Sean/XC confirm; NOT fabricated>",
  "listing_type": "rent",
  "price_usdc": 5,
  "rep_id_at_listing": 2152,
  "rental_duration_hours": 24,
  "status": "active"
}
```
- `agent_id` **[V]** = `trinity-shofet` (minted, ESTABLISHED, erc8004 token 5863).
- `rep_id_at_listing` **[V]** = its `current_repid` 2152 at read time (snapshot semantics — set to the live value at insert).
- `owner_sbt_id` is **NOT filled** — it is the owner's SBT id (a human/owner credential), which I do not have verified. Do not fabricate one; Sean/XC supply it. `NOT NULL`, so the insert fails without it (fail-closed, correct).
- `price_usdc` 5 is deliberately **under** the sandbox buyer cap.

## Cap context (the point of the demo)
Buyer cap = `SANDBOX_PURCHASE_CAP_USDC` (default **1000 USDC**, trustmarket `lib/pay-cap.mjs`). With this listing at **5**: a normal purchase is **allowed** (5 ≤ 1000) and the #11 integration test now has a live row to loop over. To demo a **refusal** instead, either raise `price_usdc` above the buyer's cap, or lower the buyer cap below 5 — `assertPayCap` then throws `PayCapExceededError` before any rental intent is recorded (#10 wiring).

## Exact INSERT for Sean (NOT executed here)
```sql
-- Fill <OWNER_SBT_ID> first. One demo row into the table the sandbox catalog reads.
INSERT INTO agent_listings (agent_id, owner_sbt_id, listing_type, price_usdc, rep_id_at_listing, rental_duration_hours, status)
VALUES ('32e0e809-c1c4-4405-913f-135c8a2d6626', '<OWNER_SBT_ID>', 'rent', 5, 2152, 24, 'active');
-- verify: SELECT id, agent_id, price_usdc, status FROM agent_listings WHERE status='active';
-- then GET /api/v1/marketplace/listings should return this row (was {"listings":[]}).
```

## Reminder (from MARKET_CATALOG_GAP_CC)
The public `/listings` reads **`agent_listings`**; the P0 `/list` path writes **`marketplace_listings`** — different tables. Seed the one the sandbox reads (`agent_listings`), or reconcile the split first, else the row won't appear in the sandbox.

---
*CC · 2026-09-11 · schema + agent verified via SQL; no row inserted. Docs only.*
