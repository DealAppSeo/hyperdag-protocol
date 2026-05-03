# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`hyperdag-protocol` is the on-chain protocol layer for the HyperDAG Protocol Trust* ecosystem. It is a Hardhat-based Solidity workspace plus a circuits subpackage. The contracts implement ERC-8004 IdentityRegistry / ReputationRegistry plus HyperDAG-specific custodianship and trust-receipt adapters. Companion repo: `repid-engine` (off-chain RepID scoring).

## Layout

```
hyperdag-protocol/
├── packages/
│   ├── contracts/          # Solidity (Hardhat 3, viem-based testing, Node test runner)
│   │   ├── contracts/      # *.sol sources
│   │   ├── test/           # *.ts tests using node:test + viem
│   │   ├── scripts/        # deploy / upgrade / verify scripts
│   │   ├── ignition/       # Hardhat Ignition modules
│   │   └── hardhat.config.ts
│   └── circuits/           # ZK circuits (Plonky3-bound)
├── abi/                    # Published ABIs
└── docs/
```

## Commands

```bash
cd packages/contracts
npm test                                  # core + upgradeable suites
npm run test:core                          # node --import tsx --test test/core.ts
npm run test:upgradeable                   # test/upgradeable.ts
npx hardhat compile
npx hardhat node                           # local node
npm run local                              # full local deploy chain
```

Solidity profile: 0.8.24, evmVersion `cancun`, `viaIR: true`, optimizer 200 runs.

Networks configured: Mainnet (1), Sepolia (11155111), Base Sepolia (84532).

## Test pattern — important

Tests use **Node's built-in test runner** plus **viem** (not Mocha + chai), even though `chai` is in devDependencies. New tests should match the existing pattern in `test/core.ts`:

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, ... } from "viem";

describe("Suite", async function () {
  const { viem } = await network.connect();
  // ...
});
```

Run with `node --import tsx --test test/<file>.ts`. Mixing chai-style assertions into this pattern will work but breaks parallel reads of the existing suite.

## Architecture — what's already on-chain

- **IdentityRegistry** (ERC-8004) — agent-as-NFT, vanity-deployed to `0x8004A818BFB912233c491871b3d84c89A494BD9e` on Base Sepolia.
- **ReputationRegistry** (ERC-8004) — feedback / attestation surface keyed by agentId.
- **TrustCustodianshipAdapter** — Human SBT ↔ Agent DBT custodial linking.
- **HyperDAGReceiptAdapter** *(this branch's work)* — commit-reveal trust receipts binding ERC-8004 agentId + x402 payment hash + task/result hashes + HAL output commitment + RepID commitment.
- **MinimalUUPS / HardhatMinimalUUPS** — bootstrap proxies for vanity-deploying the registries (the proxy is created with a minimal implementation, then upgraded to the real one — this is how vanity addresses are achieved).

All registries are UUPS-upgradeable, OwnableUpgradeable.

---

## HyperDAG Protocol Rules (from Sean — non-negotiable)

### Canonical data facts
- Supabase project: qnnpjhlxljtqyigedwkb (AITrinitySymphony)
- SOPHIA RepID: 10,000 AUTONOMOUS (cap). repid_earned: 19,157
- Canonical tier names: CUSTODIED_DBT (0-999) / EARNING_AUTONOMY (1000-4999) / AUTONOMOUS (5000-10000)
- Pythagorean Comma: 531441/524288 ≈ 1.013643
- φ = 1.61803398875, ε = 1e-8, BFT_THRESHOLD = 0.618
- REPID_HITL_GATE = 70, CONFIDENCE_GATE = 0.8

### Table rules (CLAUDE-RULE-5)
- Canonical agent table: repid_agents (NOT agent_repid — that is stale)
- Canonical score table: repid_score_events
- repid_standings view reads from agent_repid — this is a known bug, do not propagate it
- trinity_tasks.id is BIGINT not UUID
- NEVER assume column names — read schema first or ask

### Execution rules
- CLAUDE-RULE-1: Before ANY code/SQL/file change — show what exists first, ask "improve existing or build new?" Wait for answer
- CLAUDE-RULE-2: Never auto-execute unless Sean says GO. Ask "shall I proceed?" and wait
- CLAUDE-RULE-3: Fix ONLY the specific error named. Never refactor adjacent code
- CLAUDE-RULE-4: Truth over flattery. Say "I don't know" rather than fabricate
- CLAUDE-RULE-6: Shortest path to done. No busywork. Verify → execute → next
- CLAUDE-RULE-7: Code agents do code only — backend, contracts, tests, schemas. NOT UI/frontend (v0.app handles that).

### Hard stops — never touch without explicit permission
- RepID scoring formula T=floor(2000×log₁₀...) — never appear in public docs
- ANFIS parameters — never in public docs
- Marco De Rossi's files: `packages/contracts/ERC8004SPEC.md`, the original ERC-8004 implementation files in `packages/contracts/contracts/` (IdentityRegistry, ReputationRegistry, ValidationRegistry), `packages/contracts/test/` Marco-authored cases, and `abi/`. New files alongside Marco's are fine; modifying his existing files is not.
- Sprint-3 stubs in repid-engine (EAS, ZKP) — do not remove or "fix" passing stubs
- StubRepIDVerifier (this sprint) — placeholder for v1.1 real Plonky3 verifier; do not "fix" the stub

### Infrastructure ownership (Sean-only)
- Railway, Vercel, Porkbun, DNS — Sean only
- `git push`, `npm publish` — Sean only
- This agent writes code and creates **local** commits only

### Heterogeneity-by-architecture
Receipt-related logic and trust-related contracts may exist across multiple paths (`packages/contracts/`, sibling repos `repid-engine`, `trinity-symphony-shared`). Do not consolidate without asking. Heterogeneity is intentional.
