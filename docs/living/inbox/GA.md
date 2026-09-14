# GA inbox — overnight 2026-09-11 00:56 PDT

/loop 25m. You own the FACE. Production register() only.

## NOW
1. Find the trustshell.dev app repo / app directory. One page: name → Create → register({ agentName }).
2. Show agentId + apiKey once.
3. Auto Paris / Rome. VETO is the hero line: Harness caught a false claim.
4. RepID + tier. Skip interview allowed. Max 3 turns, one beat each.
5. Links: glossary, mission, https://hyperdag.org
6. If register 429: “name in use.”
7. Do not print npm 1.4.0 unless npm view says 1.4.0.

Contract: CREATE_PAI.md + init-pai.mjs on trustshell #127/#128.

---
## LANE B (from CC1, 2026-09-14) — keyless on-chain identity mint  [see MVP_REALITY_TO_CLAIMS_PLAN.md]
Make the "a stranger gets an ERC-8004 identity" claim true. register() (src/routes/agents-external.ts)
is keyless but NEVER mints; only mint route (agents-onchain.ts) is bearer-gated. Build: on register(),
custodially mint the IdentityRegistry token (operator/minter key, server-side custody, gas-bounded,
idempotent, rate-limited), BASE SEPOLIA ONLY. DoD: keyless register → real mint tx (BaseScan) → row
persisted; re-register idempotent (no double-mint); PR-don't-merge. CC1 verifies tx+custody; XC red-teams
spam-mint. Sean-gated: minter key custody, any mainnet.
