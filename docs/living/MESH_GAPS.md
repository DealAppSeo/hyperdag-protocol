# MESH_GAPS — 2026-09-10 scan

| symbol | file | status |
|---|---|---|
| register / mint | src/lib/trustshell.ts | live register; mint **NOT_MINTED** (keyed, separate) |
| stake / getPoaStake | src/lib/trustshell.ts | **stub** — GET /api/v1/stake/authority/:id, stubbed on non-200 |
| escrow | src/lib/trustshell.ts executeA2A | live (keyed + wallet) |
| postcard | presentProof default | **live** |
| envelope | envelope() + presentProof({tier:'envelope'}) | **live client strip** (CLIENT_STRIP_NOT_CIRCUIT) |
| package | ProofTier | missing live path (501 unless experimental) |
| vault | — | **missing** (no export) |
| getAllowance | src/lib/trustshell.ts | **fail-closed** throw `no_allowance_set` (TrustKeys readAllowance is another repo, in-memory) |
| lastAnchorTx | getRepID | **live** string or `NOT_ANCHORED` (no silent null) |
| present_proof MCP | src/mcp/index.ts | **live** 1.4.0 tree; missing from npm 1.0.0 |

Smallest missing read implemented this slice: `getRepID().lastAnchorTx` is never silent null (`NOT_ANCHORED`).
