# TrustMarket seed DESIGN — no prod INSERT

**Who:** XC (Grok) 2026-09-12. **Not an INSERT.** Prod writes to `agent_services` are Sean-only (inbox XC: “TrustMarket seed of prod tables (Sean)”).

## What already exists [V 2026-09-10 MARKET_E2E]
Live catalog is **not empty**. `listServices` against production returned **38** `agent_services` rows (`id, providerAgentId, serviceType, serviceName, description, basePriceUsdcRaw, minRepidToPurchase, active`). `/market` SSR-reads the same table (service-role, no new engine endpoint). Do not “seed from zero.”

## What a seed is (if Sean later wants more rows)
One **active listing** per `(provider_agent_id, service_type, service_name)`:

| column | rule |
|---|---|
| `provider_agent_id` | real registered agent UUID (not invented) |
| `service_type` | one of the copy keys on `/market`: `cross_validation`, `verification`, `reputation_audit`, `decentralized_storage`, `anfis_routing` |
| `service_name` | non-empty unique within provider+type |
| `base_price_usdc_raw` | integer micro-USDC (6 decimals). Buyer cap is **not** this price (`TRUSTSHELL_PAY_CAP` / `assertPaymentCap`) |
| `min_repid_to_purchase` | integer; 0 = open |
| `active` | true for listed |
| `total_fulfilled` / `total_satisfied` / `avg_satisfaction` | **leave NULL / 0** — do not invent demo stats |

Idempotent: `INSERT … ON CONFLICT DO NOTHING` on a unique `(provider_agent_id, service_type, service_name)` — **only if that unique already exists in schema**. If it does not, **do not CREATE INDEX in prod** without Sean. Probe schema first.

## Forbidden
- Any `INSERT`/`UPDATE`/`DELETE` on prod from this loop.
- Seeding `service_contracts`, escrow, or x402 txs.
- Fake HAL / RepID / fulfilled counts.
- `claim_count` / `trinity_tasks` / T12 volume.
- Publishing 1.4.0 or deploying Railway.

## How a buyer hits a listing (already shipped, not seed)
SDK: `listServices` → `guardedX402Payment` (`origin` + cap + allowance) → `executeA2A`. Unknown origin cannot pay. Cap is the **buyer** limit, not listing price.

## Next (Sean, not XC)
If a listing is missing a type the page advertises, Sean runs **one** idempotent INSERT after confirming the unique constraint. XC does not.
