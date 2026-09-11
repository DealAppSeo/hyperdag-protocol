# KEYLESS_MINT — the mint gap, measured (CC, 2026-09-10)

**The gap in one line:** an agent can `register()` (keyless, free) and get `erc8004TokenId: null` (NOT_MINTED), but the step that turns that into an on-chain ERC-8004 token — `POST /api/v1/agents/:id/mint` — is **Bearer-auth-gated and spends gas**, so nothing keyless can cross it. Verified below.

## Endpoint
`POST https://repid-engine-production.up.railway.app/api/v1/agents/:id/mint`
- Handler: `repid-engine/src/routes/agents-onchain.ts:54` — mints via `IdentityRegistry.register(string)`. Bearer required (global authMiddleware). `?dry_run=true` → gas estimate, **no tx**. Optional body `{ agent_uri }`.
- `mint` is **not** in the keyless allowlist (`src/middleware/auth.ts:458`); `mint-status` **is**.

## Keyless probe — MEASURED [V] 2026-09-10
| call | result |
|---|---|
| `POST /api/v1/agents/probe-keyless-cc/mint` (no key) | **HTTP 401** · `{"error":"Unauthorized: API key required"}` |
| `POST …/mint?dry_run=true` (no key) | **HTTP 401** · `{"error":"Unauthorized: API key required"}` — auth blocks before dry-run |
| `GET /api/v1/agents/trinity-sophia/mint-status` (no key) | **HTTP 500** · `invalid input syntax for type uuid` — reachable keyless (allowlist confirmed), just needs a real UUID |

Reproduce:
```bash
ENGINE=https://repid-engine-production.up.railway.app
curl -s -X POST -w '\nHTTP=%{http_code}\n' "$ENGINE/api/v1/agents/probe-keyless-cc/mint" -H 'content-type: application/json' -d '{}'
```

## Key path (documented; both present in env — NAMES only, values never read)
- **Client auth:** a Bearer token from `REPID_API_KEYS` (the engine's accepted-key allowlist). Present in `.env.master`.
- **Server signer:** `ERC8004_MINTER_PRIVATE_KEY` (Railway, server-side). The mint sends a real Base Sepolia tx from this key. Code note: *"ERC8004_MINTER_PRIVATE_KEY env var required. SEAN DOES THIS FIRST."*

## Why I stopped at 401 evidence (did NOT run an authenticated mint)
1. **A real mint is a live on-chain write that spends gas** — an original live-state change. Per the standing HOLD list and CLAUDE_RULES r23 (live-state → Sean-ratified), that is Sean's to run, not an autonomous agent's.
2. **Even a safe dry-run needs a secret *value*** in the Authorization header; the standing guardrail is names-only, never values. The client key exists, so the condition "a test key exists in env" is met — but exercising it crosses both lines above, so I hand it to Sean rather than run it.

## For Sean — the two authenticated commands (one complete block each)
Get a real agent UUID first (keyless): pick one from the public leaderboard / an agent card, or query the DB for `repid_agents.id`.

**A) DRY-RUN — safe, no tx, returns gas estimate + signer address:**
```bash
# PowerShell: set $KEY to one value from REPID_API_KEYS, $UUID to a real agent id
$ENGINE="https://repid-engine-production.up.railway.app"
curl -s -X POST "$ENGINE/api/v1/agents/$UUID/mint?dry_run=true" -H "content-type: application/json" -H "Authorization: Bearer $KEY" -d '{}'
# expect 200 {dry_run:true, estimated_gas, signer_address}
```

**B) REAL MINT — sends a Base Sepolia tx (gas), writes the on-chain token. BLOCKED_SEAN:**
```bash
curl -s -X POST "$ENGINE/api/v1/agents/$UUID/mint" -H "content-type: application/json" -H "Authorization: Bearer $KEY" -d '{}'
# 200 → {tokenId, txHash, …} ; 409 → already minted ; 503 → signer key missing
```

**next:** if Sean runs (A) and shares the estimate, CC records it here. (B) needs Sean's GO. No publish, no deploy.

---
*Verifier: CC · 2026-09-10 · keyless 401 reproducible above; authenticated path documented, not executed.*
