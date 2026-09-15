# T3 finding — the 0% live-endpoint rate is a tokenURI POINTER MISMATCH, not a missing file (CC2)

ai_dispatch row 79 (board #63). All [VERIFIED] 2026-09-15 by CC2 via live eth_call / curl / code read.

## A1 — who controls the tokenURI host, and is tokenURI mutable?
- **tokenURI IS mutable.** `IdentityRegistry.setAgentURI(agentId, newURI)` exists (nonpayable);
  `tokenURI(tokenId)` is `view`. [VERIFIED src/contracts/IdentityRegistry.abi.json]
- **Flagship 6706 on-chain tokenURI = `https://trustrepid.dev/agents/trinity-w3c`** — read directly
  via `eth_call tokenURI(6706)` on IdentityRegistry `0x8004A818BFB912233c491871b3d84c89A494BD9e`
  (Base Sepolia 84532). Re-fetch → 307 to `www.trustrepid.dev` → **HTTP 404**. [VERIFIED eth_call+curl]
- **trustrepid.dev is a Trust* front-end (Vercel), NOT trustshell.dev (CC2's app) and NOT the engine.**
  Its `/agents/:slug` route does not serve the ERC-8004 registration JSON.
- **The minter builds a THIRD, different shape:** `buildAgentURI` = `${metadataBaseUrl}/${agentId}/metadata`,
  `metadataBaseUrl` defaults to `https://repid.dev/agents` (erc8004-minter.ts:120,126). So future mints
  point tokenURI at `repid.dev/agents/<id>/metadata` — also not the working file. [VERIFIED code]
- **The spec-compliant file already exists on the ENGINE:** `GET /api/v1/agents/:uuid/registration.json`
  → 200, valid `erc8004-registration-v1` (agent-registration-file.ts / agents-registration.ts). The route
  keys on `repid_agents.id` (uuid), requires `erc8004_token_id` populated. [VERIFIED curl 200]

**Root cause:** pointer mismatch across ≥3 URL shapes — on-chain `trustrepid.dev/agents/:slug`,
minter default `repid.dev/agents/:id/metadata`, and the real file at engine `/api/v1/agents/:uuid/registration.json`.
The file is NOT missing; the tokenURI points at hosts that don't serve it.

## A2 — 6706 resolving 200 with a valid file + a live endpoint, OR the blocker
- **A valid 200 file with LIVE endpoints already exists** for 6706 at
  `https://repid-engine-production.up.railway.app/api/v1/agents/d82b2ae5-1d1d-462e-87fb-57cb3e63017b/registration.json`.
  Of its 5 named services, **2 answer 200 keyless** (`/card`, `/reputation/payload.json`); 3 are 401
  (auth-gated). So it names ≥1 endpoint that actually answers — not the paper's dead-placeholder problem. [VERIFIED curl]
- **BLOCKER for CC2 to close the pointer** (both paths are outside CC2's fences):
  1. **On-chain re-point** `setAgentURI(6706, <engine registration.json url>)` — an ON-CHAIN WRITE
     (fenced: no mint/on-chain/keys; Sean/CC1). Also 6706's DB `erc8004_address = "pending-mint:trinity-w3c"`,
     so our own mint/owner record for it is incomplete — flag for CC1.
  2. **Serve/redirect at the tokenURI host** (`trustrepid.dev/agents/:slug`, `repid.dev/agents/:id/metadata`)
     — that is the repid.dev/trustrepid.dev **front-end repo**, NOT trustshell.dev (`_wt_cc2_reg`); not in CC2's worktrees.

## A3 — re-measure (real, not a claim)
- Flagship, re-read on-chain this session: `tokenURI(6706)` → `trustrepid.dev/agents/trinity-w3c` → **404**. Unchanged.
- Nothing CC2 can ship in-lane re-points tokenURI, so the **on-chain live-endpoint rate is UNCHANGED (still 0%)**.
  A genuine improvement requires the pointer fix below to land first; then re-run XC X2.

## Recommended fix (for the owners; CC2 cannot ship it in-lane)
- **Fastest, no on-chain writes (front-end owner):** make `trustrepid.dev/agents/:slug` **and**
  `repid.dev/agents/:id/metadata` 200-redirect/proxy to the engine `/api/v1/agents/:uuid/registration.json`
  for that agent. Fixes ALL tokens at once. Owner = repid.dev/trustrepid.dev front-end repo.
- **Per-token, on-chain (Sean/CC1):** `setAgentURI(tokenId, <engine registration.json url>)`.
- **Prevent recurrence (engine, CC1):** change `erc8004-minter.ts` `buildAgentURI` so new mints point tokenURI
  at the engine `registration.json`, not `repid.dev/agents/:id/metadata`.

## A4
No claim introduced beyond board #63.

*CC2 · 2026-09-15 · T3 finding. On-chain + front-end fixes are out of CC2's lane; artifacts above are ready for the owner.*
