# ENGINE_HAL_GATE — repid-engine HAL quorum is a SECOND ungated paid path
**2026-09-10 (CC, Loop C). DOCUMENT ONLY — do not patch repid-engine until XC finishes the fleet PROVIDERS fix. Different repo, different PR.**

## The finding
The #51 free-tier gate lives in the **fleet** (`trinity-symphony-shared` callLLM). It does **not** touch the **repid-engine HAL fact-check quorum**, which is a separate LLM spender and calls OpenRouter on a **paid** model.

- **File/function:** `repid-engine/src/hal/fact-check.ts:2015`
  ```js
  add({ name: 'openrouter', endpoint: 'https://openrouter.ai/api/v1/chat/completions', apiKey: or },
      'HAL_S2_OPENROUTER_MODEL', 'qwen/qwen-2.5-72b-instruct');
  ```
- **Model:** default `qwen/qwen-2.5-72b-instruct` — **PAID** (~$0.36/M in; code comment: "~$0 per verdict; we have OpenRouter balance"). Confirmed live in `llm_call_log` 2026-09-10 20:31Z (openrouter · `qwen/qwen-2.5-72b-instruct`).
- **Wrong env knob:** it reads **`HAL_S2_OPENROUTER_MODEL`**, *not* `OPENROUTER_MODEL`. So Sean's `OPENROUTER_MODEL=nvidia/nemotron-3-5-lightning:free` has **zero effect here** — exactly why the quorum kept using the paid qwen model. [confirms the L1 finding]
- **`:free` is not a trivial swap:** the code comment (fact-check.ts:2004-2010) records that `qwen/qwen-2.5-72b-instruct:free` was **RETIRED and 404s** on OpenRouter — that's why they moved to the paid slug. A known **live** free slug already in this file: `nvidia/nemotron-3-ultra-550b-a55b:free` (default of `HAL_S2_FRONTIER_FREE_MODEL`, verified live 2026-08-09). Any free swap must be checked against OpenRouter `/models` first (don't invent a slug).
- **Second openrouter cost path:** gemini fails back to OpenRouter (fact-check.ts:1893), putting gemini+openrouter on one account. And the escalation tier uses `openai/gpt-4o` / `anthropic/claude-sonnet-4` via OpenRouter (2179/2188) — paid, escalation-gated.

## Why it's not urgent (but is real)
Current spend is tiny (~$0.0005/24h on openrouter; balance exists). It is **not bleeding**. But it is a **paid vector that ignores both the fleet #51 gate and `OPENROUTER_MODEL`**, so "free-tier only" is not actually enforced end-to-end until repid-engine is gated too.

## The fix (LATER — separate repid-engine PR, after XC's fleet PROVIDERS fix)
1. Add a free-tier gate in the fact-check provider builder analogous to #51: `allow_paid=false` (env, default false) → skip any OpenRouter model not ending `:free`; skip the escalation frontier tier unless explicitly enabled.
2. Set `HAL_S2_OPENROUTER_MODEL` to a **verified-live** `:free` slug (candidate: `nvidia/nemotron-3-ultra-550b-a55b:free`) — verify against `/models` first.
3. Keep the escalation tier (`openai/gpt-4o` etc.) behind the same paid flag.

**Not patched. Not a PR. Documented for the repid-engine free-tier PR that follows the fleet fix.**
