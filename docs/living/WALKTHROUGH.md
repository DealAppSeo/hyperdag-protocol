# WALKTHROUGH — Sean return pack (2026-09-10)

Public-safe. No secrets. No `service_role`.
Canonical for a stranger at **trustshell.dev** vs what actually works today.

## 1. Stranger at trustshell.dev — what they see vs what works

Live site (Vercel prod commit `cc0faeb` as of 2026-09-10):

| They see | What works |
|---|---|
| `npm install @hyperdag/trustshell` + caption **npm package v1.4.0** | npm **latest is 1.3.0**. The caption reads `package.json` in this repo (1.4.0 unpublished). |
| HAL as a live cross-LLM gate | Live, **keyless**, **live-degraded (2/6 providers)**. Groq + OpenRouter answer. Not 6/6. |
| ERC-8004 portable reputation | **Lookup** (`getRepID` / `presentProof`) is live keyless. `register()` does **not** mint. On-chain writes **paused** (last 2026-06-22). |
| x402 payments | Protocol on **Base Sepolia**. Needs API key + funded testnet wallet. Site does not spend for you. |
| Getting-started `trustshell --version` → 1.4.0 | That is this tree, not npm. After `npm i` a stranger gets **1.3.0**. |
| PAI / local mesh / BYOK | **Not shipped** for the stranger path. |

Working stranger path: install **1.3.0**, `verify` a sentence, `repid` a public agent. MCP `verify_output` / `get_repid` the same.

## 2. Exact commands (published 1.3.0)

```bash
npx @hyperdag/trustshell@1.3.0 verify "The capital of France is Paris."
```

Expect exit **0** on PASS/FLAG.

```bash
npx @hyperdag/trustshell@1.3.0 verify "The Eiffel Tower is located in Rome, Italy."
```

Expect exit **1** on VETO (HAL may FLAG instead — then exit 0; do not remap).

```bash
npx @hyperdag/trustshell@1.3.0 repid trinity-shofet
```

Expect a live RepID + tier (score moves; gate on **tier**).

Do **not** run `npx @hyperdag/trustshell@1.4.0` — that version is not on npm (`check` is 1.4.0-only).

## 3. MCP paste — Claude Desktop

`Claude Desktop → Settings → Developer → Edit Config` (or Cursor MCP config):

```json
{
  "mcpServers": {
    "trustshell": {
      "command": "npx",
      "args": ["-y", "@hyperdag/trustshell-mcp"]
    }
  }
}
```

Then ask the model to `verify_output` a sentence and `get_repid` `trinity-shofet`. Keyless.

## 4. What NOT to expect

- PAI wizard
- Local / on-device mesh (v2, not shipped)
- BYOK as the first-run path
- A **60–80% savings** claim
- HAL **6/6** providers
- **1.4.0** on npm (unpublished; `check` is not in 1.3.0)

## 5. EOD clicks when Sean returns

| Click | Why |
|---|---|
| Merge **trustshell #121** (docs/honesty close) | HOLD until you say merge. **Do not publish 1.4.0.** |
| Railway: set `OPENROUTER_MODEL` to a **verified `:free` id**; put NVIDIA key on gcm/engine if NIM is a free slot | Closes the only real paid OpenRouter vector; NIM is missing on those services |
| Decide the **5 mis-assigned tasks** (`assigned_to` CLI agents, not the running 12) | Claim-path is healthy (probe 435116 in 11s). Either run those CLI agents or `assigned_to=NULL` specific rows. |
| Merge+deploy **trinity-symphony-shared #51** only after you read the test list | `node tests/free-tier-gate.test.js`. Not money/schema/publish, but it **does** change LLM routing. Do not merge blind. |

BLOCKED_SEAN: those four. Nobody else merges #51 or publishes.
