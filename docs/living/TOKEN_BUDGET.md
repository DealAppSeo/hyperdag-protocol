# TOKEN_BUDGET — free-tier gate inventory
**Generated** 2026-09-10 (CC, standing-order FREE-TIER GATE). Key **names** from `C:\Users\Cash4\repos\.env.master` (values never read/printed). Usage from `llm_call_log` (last 24h). Code tags from `trinity-symphony-shared`.
**STATUS: 🟢 NOT FREE-EXHAUSTED — do NOT hold.** 3 providers working (groq, openrouter, deepseek); actual 24h spend ≈ **$0.0019 total**. No paid authorization needed yet.

## Inventory
| provider | env var present? | tagged free/paid in code | 24h calls (llm_call_log) | status |
|---|---|---|---|---|
| **Groq** | ✅ `GROQ_API_KEY` | free-tier (not tagged paid) | **13, 0 fail, $0.0014** | 🟢 WORKING — the workhorse |
| **OpenRouter** | ✅ `OPENROUTER_API_KEY` (+`_PROVISIONING_KEY`,`_REFERRER`) | **mistagged `paid`** (V4 PROVIDERS uses paid model `deepseek/deepseek-chat`, not `:free`) | **9, 1 fail, $0.0005** | 🟡 WORKING but on a PAID model id → switch to `:free` (only real paid vector) |
| **DeepSeek** | ✅ `DEEPSEEK_API_KEY` | free-tier | 1, 0 fail, $0 | 🟢 WORKING (daily cron only) |
| **Cerebras** | ✅ `CEREBRAS_API_KEY` | free-tier | 9, **9 fail**, $0 | 🔴 FAILING all calls (quota/credit or dead model) |
| **NVIDIA NIM** | ✅ `NVIDIA_NIM_API_KEY` | not wired into runtime order | **0** | ⚪ PRESENT, UNUSED — wire into free order |
| **Together** | ✅ `TOGETHER_API_KEY` | not wired into runtime order | 0 | ⚪ PRESENT, UNUSED — wire into free order |
| Gemini | (GEMINI/GOOGLE key — not in target set) | free-tier quorum member | 9, **9 fail**, $0 | 🔴 FAILING all calls |
| Mistral | (MISTRAL key — not in target set) | free-tier quorum member | 9, **9 fail**, $0 | 🔴 FAILING all calls |
| zai | (ZAI key — not in target set) | free-tier quorum member | 9, **9 fail**, $0 | 🔴 FAILING all calls |
| Fireworks | ✅ `FIREWORKS_API_KEY` | — | 0 | ⚪ present, unused |
| SambaNova | ✅ `SAMBANOVA_API_KEY` | — | 0 | ⚪ present, unused |
| SiliconFlow | ✅ `SILICONFLOW_API_KEY` | — | 0 | ⚪ present, unused |
| Llama host | via `LITELLM_CONFIG_YAML` (no standalone key) | — | — | ⚪ hosted through LiteLLM, not a direct key |

Note: `llm_call_log.tier` is a **quorum label (`0a`)**, NOT free/paid. Free/paid must be read from code + model id + `cost_usd`. Ground-truth 24h cost is the numbers above.

## MISSING keys (for Sean EOD — not invented)
- **`NVIDIA_API_KEY`** — only `NVIDIA_NIM_API_KEY` present. If the router expects the plain var, it's MISSING; if NIM is the intended one, wire the router to `NVIDIA_NIM_API_KEY`.
- **No standalone Llama host key** — Llama is served via `LITELLM_CONFIG_YAML`. If a direct free Llama endpoint is wanted, its key is MISSING.
- Everything else in the target set (Groq, Cerebras, OpenRouter, DeepSeek, Together) is **present**.

## Router fix — where it actually lives (truth-over-flattery)
- ❌ **`lib/ConstitutionalAgent.ts` is a DEAD SCAFFOLD** — imported by nothing (verified: `server.js` + `apm/gcm/hdm/mel/index.js` all `require('./lib/ConstitutionalAgentV4')`). Its `openrouter: tier:'paid'` line is real but **fixing it changes nothing at runtime** (theater — the exact anti-pattern the repo warns against).
- ✅ **Real router = `lib/ConstitutionalAgentV4.js` `callLLM` (:2587)**: primary path is `ENGINE_LLM_PROXY` → **repid-engine** (the quorum that logs the 24h calls above); direct-provider fallback iterates `PROVIDERS` (:158) where `openrouter` (:163) is **priority 1 with a hardcoded paid model, not env-overridable**.
- ⚠️ **The on-disk working copy of `ConstitutionalAgentV4.js` is mid-merge (5+ unresolved conflict markers; `git status` shows `AA`).** HEAD is clean, but **do not hand-edit/commit from this dirty tree** — author any code change on a fresh clean worktree.

### The fix, ordered by safety
1. **ENV-FIRST, zero code risk (Sean, Railway):** set `OPENROUTER_MODEL=<a verified `:free` id>` on the repid-engine + trinity services. This is the single change that closes the only real paid vector ($0.0005/24h). *I did not guess a `:free` model id — an invalid one would 404 and break the one working OpenRouter path.*
2. **CODE (clean-branch PR, deploy = Sean):** in `ConstitutionalAgentV4.js` PROVIDERS, make openrouter model `process.env.OPENROUTER_MODEL || <default>` (currently hardcoded — the env fix above can't work until this lands), add an `LLM_ALLOW_PAID` gate (default **false**) that filters the provider loop, set try-order **Groq → Cerebras → OpenRouter(:free) → NIM → Together/Llama**, and on `429`/`insufficient_quota` mark the provider `exhausted_until` next UTC midnight **without** failing over to a paid model.
3. **Cross-repo:** the same `allow_paid=false` gate must also apply in **repid-engine**'s proxy/quorum (that's the primary spend path) — separate PR in that repo.

## Exhaustion protocol (per standing order §3)
Trigger `FREE_EXHAUSTED` only when **groq AND openrouter(:free) AND deepseek AND cerebras/NIM/together** all report exhausted. **Not the case now** (groq + openrouter + deepseek working). When it happens: stamp `TODAY.md FREE_EXHAUSTED`, Linear HYP-6 `FREE-EXHAUST — hold or paid?`, stop calling models. No silent paid.
