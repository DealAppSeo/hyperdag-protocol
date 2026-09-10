# TRUSTSHELL_E2E — published-1.3.0 measurement (live)
**Run** 2026-09-10 19:08–19:09 UTC (CC, Loop C3). **All calls against published `npx @hyperdag/trustshell@1.3.0`** (not the 1.4.0 tree). Keyless. Exit 0 on all four.
**Do not change the website** — this is a measurement, not a copy edit.

## Live CLI results
| # | Command | Verdict | Latency | Keyless? | What the CLI printed |
|---|---|---|---|---|---|
| 1 | `verify "The capital of France is Paris."` | ✅ **PASS** trust 100/100 | 33.1s* | yes | `PASS — hal_score 0 via fact-check (partial quorum)`; evidence: `groq:TRUE`, `openrouter:TRUE` |
| 2 | `verify "The Eiffel Tower is in Rome."` | ❌ **VETO** trust 0/100 | 9.9s | yes | `VETO — hal_score 1 via fact-check (partial quorum)`; evidence: `groq:FALSE`, `openrouter:FALSE` |
| 3 | `repid trinity-shofet` | RepID **2152 (ESTABLISHED)** | 7.0s | yes | `trinity-shofet · RepID 2152 (ESTABLISHED)` |
| 4 | `proof trinity-shofet --verify` | **verified ✓** (client-side 0.2.0) | 15.1s | yes | tier `postcard` · scheme `plonky3_range_check` · createdAt `2026-09-01T08:12:07Z` · proof 14,232 b64 chars · statement `repid_score=2150 threshold=999 tier=ESTABLISHED` |

*\#1's 33s includes the one-time `npx` package download; the true per-call latency is the ~7–15s range seen in #2–#4.*

**What works, keyless, on the published package:** verify (PASS + VETO both correct), repid lookup, ZK proof fetch + client-side verification. This is the real, live "keyless trust core." HAL ran on a **partial quorum — 2 providers answered (groq + openrouter)**; the other families did not (matches the 2/6 funded state).

## Site lies — trustshell.dev vs measured reality
| Site claim (verbatim) | Measured reality | Verdict |
|---|---|---|
| **"npm package v1.4.0"** | Published `@latest` = **1.3.0** (this whole run used `@1.3.0`; 1.4.0 is unpublished) | 🔴 **LIE** — the version Sean flagged. Site advertises a version no one can `npm install`. |
| "cross-checked by a **quorum of decorrelated model families**" | Live verify ran on **2 providers** (groq + openrouter); 4 others fail 9/9 (`llm_call_log`) | 🟡 **OVERSTATE** — real quorum is 2/6, "partial" as the CLI itself prints. Not the robust multi-family quorum implied. |
| "93 lifetime on-chain reputation writes" | Live count ~**103** (2026-09-10) | 🟢 **Honestly hedged** — page labels it "last-known… NOT current as of 2026-08-30". Stale but not a lie. |
| Proof statement `repid_score=2150` (proof createdAt 2026-09-01) | Live RepID **2152** | ⚪ Not a site claim — the proof is a point-in-time snapshot; expected to lag the live score slightly. |

**One clear fix (site copy, for Sean — not done here):** change "npm package v1.4.0" → 1.3.0 until 1.4.0 is actually published. The provider-count language should say "partial quorum (2 funded families today)" to match the CLI's own honest output. On-chain figure is already correctly hedged.

## MCP 1.0.0 smoke (published `@hyperdag/trustshell-mcp`) — L3
Server boots: `trustshell-mcp: ready (stdio)`. **serverInfo version = `1.2.0`** (requested `@1.0.0` — a version-string drift, same class as the CLI's 1.3.0/1.4.0).
Actual tools exposed: **`verify`, `getLeaderboard`, `getRepID`** — *not* `verify_output`/`get_repid`/`present_proof`.
| MCP tool | call | result |
|---|---|---|
| `verify` `{text}` | "The capital of France is Paris." | ✅ `verdict: PASS`, `trustScore: 100`, `halScore: 0`, "partial quorum", evidence `groq:TRUE`, `openrouter:TRUE` |
| `getRepID` `{agentId}` | trinity-shofet | ✅ `repid: 2152`, `tier: ESTABLISHED`, `lastAnchorTx: null`, `latestProofHash: null` |
| `present_proof` | — | ❌ **not exposed by the MCP** — proof presentation is CLI-only (`trustshell proof … --verify`). |

**Two MCP gaps to note:** (1) `getRepID` returns `latestProofHash: null` / `lastAnchorTx: null` for trinity-shofet, yet the **CLI `proof` returns a real verified plonky3 proof** for the same agent — the MCP doesn't surface the proof/anchor that exists. (2) No proof tool in the MCP at all. If "present a proof over MCP" is a claimed capability, it isn't there in 1.2.0.

### Grok note (same hour)
Project-scoped TrustShell MCP (1.4.0 tree, not npm 1.0.0) **does** expose `present_proof`. Call `present_proof` trinity-shofet verify=true → postcard / plonky3 / **verified true**. So the gap is **published MCP 1.0.0/1.2.0**, not the 1.4.0 tree. Do not advertise present_proof as an npm-MCP 1.0.0 tool.

## Provenance
CLI output: background task `bra3em8lm` (4 live calls). Site claims: `WebFetch trustshell.dev` 2026-09-10. Provider-fail counts: `llm_call_log` 24h [V]. Published version: the calls succeeded against `@1.3.0` and prior turns confirm 1.4.0 unpublished.
