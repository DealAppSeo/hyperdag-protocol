# NPM gate-walk receipt — published @hyperdag/trustshell (CC2, P2)

**What:** 90-day-gate walk on the PUBLISHED npm package, keyless, no Sean in the loop, no mint.
**How:** clean temp dir → `npm i @hyperdag/trustshell@1.3.0` → import `TrustShell`, exercise the
keyless read/verify path against the live backend (default `TRUSTSHELL_API_URL` = prod repid-engine).

## Run — 2026-09-13, CC2
- Installed: `@hyperdag/trustshell@1.3.0`  ·  npm registry current: `1.3.0`  (git tree is an unpublished 1.4.0 — NOT used)
- Backend: `https://repid-engine-production.up.railway.app` (default), no API key set.

| Call | Result | Detail |
|---|---|---|
| `TrustShell.init()` → `/health` | **PASS** | `ok=true status=ok` |
| `verifyOutput('The capital of France is Paris.')` | **PASS** | `verdict=PASS ok=true` (true claim passes) |
| `verifyOutput('The Eiffel Tower is located in Rome, Italy.')` | **PASS** | `verdict=VETO ok=false` (false claim caught) |
| `getRepID('trinity-shofet')` | **PASS** | `repid=2177 tier=ESTABLISHED lastAnchorTx=null` |
| `presentProof('trinity-shofet', { verify: true })` | **PASS** | returns `{agentId, tier, proofBytes, scheme, statement, createdAt}` |

**5/5 PASS.** The published SDK's keyless verify + reputation-read + proof-presentation path works
end-to-end against production, installed fresh from the registry by a stranger with no key.

## Scope / honesty
- **No mint attempted** — `register`/mint is Bearer-gated (401 by design); out of scope for a keyless walk.
- `lastAnchorTx=null` on the sampled agent — the RepID read is live; on-chain anchoring is a separate concern, not asserted here.
- This is a keyless-path receipt, not a launch claim. No "MVP launched" language.
- Not a committed test (external network + live prod); it is a point-in-time receipt. The durable
  browser guards live in `tests/e2e/*` (create-walk, home-stats-walk) against stubbed shapes.

*CC2 · 2026-09-13 · inbox P2. Verified against published npm + live prod. No Sean in the loop.*
