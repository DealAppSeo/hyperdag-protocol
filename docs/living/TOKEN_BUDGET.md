# TOKEN_BUDGET — free-tier inventory 2026-09-10
**Owner:** Grok (first writer). CC reviews; does not overwrite.
**Rule:** `allow_paid=false` until Sean writes `paid <loop>` (env `SEAN_PAID_LOOP`).
**No secret values in this file.** Presence only.

Sources: Railway `describe-service` names (not values) — trinity-gcm, trinity-litellm, repid-engine production. Local process env in this session (no dotenv load).
CC (parallel) reported 24h `llm_call_log` [R]: groq 13/0-fail, openrouter 9/1-fail, deepseek 1; spend ≈ $0.0019. Grok could not query the log (Supabase MCP unauthenticated).

## Inventory

| provider | env var present? (yes/no) | tagged free or paid in code | last 24h calls if visible in llm_call_log | status |
|---|---|---|---|---|
| Groq | **yes** Railway gcm + litellm + engine (`GROQ_API_KEY`). Local: no | free (TS + V4) | [R CC] 13 calls, 0 fail | wired |
| Cerebras | **yes** Railway gcm + litellm + engine (`CEREBRAS_API_KEY`). Local: no | free | NOT_CHECKED | wired; V4 now has a PROVIDERS.cerebras row |
| OpenRouter | **yes** Railway gcm + litellm + engine (`OPENROUTER_API_KEY`). Local: no | **was paid** (`deepseek/deepseek-chat`). **Now free** iff model id ends `:free`. Default `meta-llama/llama-3.3-70b-instruct:free` | [R CC] 9 calls, 1 fail | wired; paid ids skipped unless `SEAN_PAID_LOOP` |
| NVIDIA NIM | **no** on gcm, litellm, engine (`NVIDIA_API_KEY` / `NVIDIA_NIM_API_KEY` absent). Local: no | free-try slot | NOT_CHECKED | **MISSING** for Sean EOD |
| DeepSeek | **yes** Railway gcm + litellm + engine (`DEEPSEEK_API_KEY`). Local: no | tagged free in TS; **not** in FREE_TRY_ORDER (Groq→Cerebras→OR :free→NIM→Together) | NOT_CHECKED | present; skipped in free gate |
| Together / Llama | **yes** Railway gcm + engine (`TOGETHER_API_KEY`). Local: no | free | NOT_CHECKED | wired |
| SambaNova (Llama host) | **yes** Railway gcm + litellm (`SAMBANOVA_API_KEY`). Engine: no. Local: no | free in TS PROVIDERS | NOT_CHECKED | wired on agents, not in FREE_TRY_ORDER |

## Gate (shipped in trinity-symphony-shared, not deployed)

- `lib/free-tier-gate.js` + `tests/free-tier-gate.test.js` PASS.
- Default `allowPaid()===false`. Paid only if `SEAN_PAID_LOOP` is a non-hold value.
- 429 / `insufficient_quota` → `exhausted_until` next UTC midnight. No failover to paid.
- All five FREE_TRY_ORDER exhausted → throw `FREE_EXHAUSTED`. Then stamp TODAY.md `FREE_EXHAUSTED` and Linear `FREE-EXHAUST — hold or paid?`. **Not stamped this hour** — no 24h log, no live 429 observed.
- Engine LLM proxy skipped unless allow_paid (avoids paid HAL spend).

## Missing for Sean EOD

- `NVIDIA_API_KEY` / `NVIDIA_NIM_API_KEY` — **not listed** on gcm, litellm, or repid-engine `describe-service` names. CC TODAY says NIM present-unused — **unreconciled**. Treat as MISSING until Sean confirms the var name and service.
- Local shell has none of the listed keys (this session).
- `llm_call_log` 24h counts: NOT_CHECKED.

Do not invent keys. Do not `paid` without Sean.

---

## CC REVIEW [V] — 2026-09-10 (verifier lane; append-only, Grok owns above)
Verified Grok's `lib/free-tier-gate.js` out-of-lane against Sean's spec + live DB.

**Gate logic: ✅ CORRECT.** `allowPaid()` default false (only `SEAN_PAID_LOOP`/`ALLOW_PAID` ≠ hold/false/0/no flips it); OpenRouter free iff model ends `:free`; `FREE_TRY_ORDER = groq→cerebras→openrouter→nvidia→together` (matches spec); `markExhausted`→next UTC midnight; `orderProviders` filters free+non-exhausted then ranks. Pure module, tests pass. Matches the standing order precisely.

**GAP 1 — NOT WIRED (inert).** `free-tier-gate.js` is exported but **no caller** — `ConstitutionalAgentV4.callLLM`/`detectProviders` don't import `orderProviders`/`isFreeSlot`, and the `ENGINE_LLM_PROXY` path (repid-engine, the primary spend path) doesn't consult it. Same correct-but-unwired shape as `deriveLiveness`. **Remaining step:** wire the provider loop (V4) + gate the engine proxy (repid-engine) to `orderProviders(...allowPaid:false)` and skip `isExhausted`. Until then the gate changes nothing at runtime.

**GAP 2 — order names ≠ provider map.** `FREE_TRY_ORDER` includes `cerebras` and `nvidia`, but V4's `PROVIDERS` (HEAD) has **neither row** (openai/anthropic/gemini/deepseek/openrouter/grok/together/deepinfra). Those two slots are dead until PROVIDERS gets `cerebras` + `nvidia` (envKey `NVIDIA_NIM_API_KEY`) rows with free/`:free` models.

**VERIFIED 24h usage (Grok had NOT_CHECKED — my Supabase MCP is authed):** groq 13/0-fail/$0.0014 · openrouter 9/1-fail/$0.0005 · deepseek 1/0 · **cerebras/gemini/mistral/zai 9/9-fail/$0** · NVIDIA_NIM/together/fireworks/sambanova/siliconflow 0 calls. **Total ≈ $0.0019/24h. 🟢 NOT FREE-EXHAUSTED** (groq+openrouter+deepseek live) → do not stamp FREE_EXHAUSTED.

**Reconcile on NVIDIA:** `NVIDIA_NIM_API_KEY` IS present in `.env.master` (name only) but Grok found it absent on the Railway services — so the key exists locally, not on the deployed services. Sean: confirm the var name + set it on repid-engine/gcm if NIM is to be a free slot.

## Grok follow-up 2026-09-10 — GAP 1+2 closed in PR, not deployed

https://github.com/DealAppSeo/trinity-symphony-shared/pull/51 (`feat/free-tier-gate` off clean `origin/main`).

- V4 `callLLM` now `orderProviders` + skip engine proxy unless `SEAN_PAID_LOOP`.
- PROVIDERS adds `groq`, `cerebras`, `nvidia` (`NVIDIA_API_KEY` or `NVIDIA_NIM_API_KEY`).
- OpenRouter model = `process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'` (no invented `:free` id). Paid id skipped while allow_paid=false.
- Dirty local merge tree was **not** the authoring tree.
- Not merged. No Railway restart. Runtime unchanged until Sean merges + deploys.

## Cerebras 9/9 — Grok 2026-09-10 (append; error class)

Source: Railway **repid-engine** deploy logs 2026-09-10T19:08Z (filter `cerebras`). Not a restart. Not `llm_call_log` rows (Grok MCP unauth); error text is the HAL quorum line.

| field | value |
|---|---|
| class | **model-gone** (not auth, not 429, not 8k cap) |
| HTTP | 404 `not_found_error` / `model_not_found` |
| vendor text | `Model does not exist or you do not have access to it.` |
| how chosen | `catalog NOT_CHECKED and no model configured` then substitute **`gemma-4-31b`** (family **gemini**) |
| exhausted_until | **parked until `HAL_S2_CEREBRAS_MODEL` is a real Cerebras id** — this is config, not UTC-midnight quota |
| 429? | no |
| auth fail? | no (key present; 404 on model) |

Together: **unused, key present** on gcm + engine. Already in `FREE_TRY_ORDER` after nvidia. When Cerebras is parked/exhausted, `orderProviders` skips it, so Together already runs after Groq (then OpenRouter :free, then NIM, then Together). **No `free-tier-gate.js` edit required.** Optional later: put Together immediately after Groq; that is a reorder, not a missing slot.

Do not stamp FREE_EXHAUSTED (Groq still working).
