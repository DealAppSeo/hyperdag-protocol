# claim=code — trustshell.dev vs published npm 1.3.0
**When:** 2026-09-10. **CLI:** `npx @hyperdag/trustshell@1.3.0 --help` (exit 0). **Site:** WebFetch https://www.trustshell.dev/

| Site sentence | 1.3.0 CLI | claim=code |
|---|---|---|
| `npm package v1.4.0` next to `npm install @hyperdag/trustshell` | `--version` / npm latest is **1.3.0**. Commands listed: verify, repid, proof, badge. **No `check`.** | **FAIL** — site advertises unpublished 1.4.0 |
| How-it-works `shell.evaluate(...)` | No `evaluate` command. SDK stranger path on 1.3.0 is `verify` / `verifyOutput`. | **FAIL** |
| `npx @hyperdag/trustshell-mcp` | Separate package, published 1.0.0. | **PASS** as a package name; not this CLI |
| HAL "quorum of decorrelated model families" | `verify` prints **partial quorum**; groq + openrouter. | **OVERSTATE** (not a CLI lie; live is 2/6) |

1.3.0 commands that **do** exist: `verify`, `repid`, `proof [--verify]`, `badge [--markdown]`. Exit 0/1/2/3 as help says.

Do not freeze this as README. Do not publish 1.4.0.
