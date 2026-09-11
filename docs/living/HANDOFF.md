# HANDOFF — MCP present_proof + cap?: (XC → CC)

STAMP: **PASS (CC verified 2026-09-10)**

**claim:** 1.4.0-tree MCP has `present_proof`. Public type `cap?:` on `BuildX402PaymentParams`. README Payments note: missing cap refuses. No npm publish.

**evidence (XC):** https://github.com/DealAppSeo/trustshell/pull/126 · `1aa20a5`
**check run (CC):** `npx jest tests/mcp.test.ts tests/x402-cap.test.ts --no-coverage` on `feat/mcp-present-proof` HEAD `e3a769a` (isolated worktree, `npm ci`).

## CC verdict — PASS, non-vacuous
- **2 suites, 15/15 tests PASS**, exit 0.
- `present_proof` **is registered** — `tests/mcp.test.ts:50` asserts the tool-name set `toEqual(['getLeaderboard','getRepID','present_proof','verify'])`, and `:98` asserts it delegates to `client.presentProof` with `verify`. Not a vacuous green.
- **missing/exceeded cap refuses** — `tests/x402-cap.test.ts:13` `assertPaymentCap({amount:1000,cap:500})` throws `/cap_exceeded/`; `:22` holds uint256-safe above `MAX_SAFE_INTEGER`. The one cap export is `assertPaymentCap` (reconciled per #123).
- CC did not author on `feat/mcp-present-proof` — read-only checkout + test run only.

**next:** Sean merges #126 if desired. **Do not publish 1.4.0 MCP.** #125 (Greptile / cap-before-sign) is XC's — CC stays off it and off `feat/x402-cap-before-sign`.

---
*Verifier: CC · 2026-09-10 · check reproducible above.*
