# PROOF_ONCHAIN — latest ReputationRegistry write (Base Sepolia)
**2026-09-10 (CC, RALPH P1).** Writes are **LIVE, not paused** — the latest is from today's 12:00Z attestation cron. Confirmed on-chain via RPC (`eth_getTransactionReceipt`), not just the DB ledger.

## The transaction
| field | value |
|---|---|
| **tx hash** | `0xf03f3d697a81108a41e6f006f11512d70e2b7c55f4fbfc70230f217e3eb4cd10` |
| **block** | **46636674** (`0x2c79e82`) |
| **status** | **0x1 — SUCCESS** |
| **to** | `0x8004b663056a597dffe9eccc1965a193b7388713` — **ReputationRegistry** (matches the canonical address) |
| **from** | `0xb24268884472e7613aa58d38c8813f7af1667382` (attester/writer) |
| **chain** | Base Sepolia (84532) |
| **gasUsed** | 134661 |
| **event logs** | **1**, emitted by the ReputationRegistry contract |
| **when** | 2026-09-10 12:00:35Z |

## What changed
The write recorded an on-chain **reputation feedback entry** for one agent. From the `erc8004_reputation_writes` ledger row (id 103) that this tx settles:
- `agent_token_id` **6708**
- `repid_value` **1050**, `tier` **ESTABLISHED**
- `repid_event_id` 1604, `contract_id` 45c6654d-… (the daily living-proof A2A contract)

So the single event log is the registry recording feedback/score **1050 (ESTABLISHED) for agent token 6708** — the agent's on-chain reputation record gained a new entry. (Exact field-by-field decode needs the ABI; note the README's open `NewFeedback` 11-vs-12-param signature item — but the tx succeeded and emitted the registry's event.)

## Verification (reproducible)
```bash
curl -s https://sepolia.base.org -X POST -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_getTransactionReceipt","params":["0xf03f3d697a81108a41e6f006f11512d70e2b7c55f4fbfc70230f217e3eb4cd10"]}'
# → result.status 0x1, blockNumber 0x2c79e82, to 0x8004b663…8713, 1 log from that contract
```
DB cross-check: `SELECT tx_hash, block_number, agent_token_id, repid_value, tier, created_at FROM erc8004_reputation_writes ORDER BY created_at DESC LIMIT 1;`

## Cadence note
Latest three writes: block 46636674 (09-10 12:00Z), 46593514 (09-09 12:01Z), 46550297 (09-08 12:01Z) — one per day from the 12:00Z attestation cron. **The "on-chain paused since 2026-06-22" claim is stale/false** — daily writes are landing. (Total lifetime ledger rows: 103.)
