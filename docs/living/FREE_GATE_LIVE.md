# FREE_GATE_LIVE — callLLM after #51 deploy

**When:** 2026-09-10 20:27–20:31 UTC  
**Service:** trinity-gcm production  
**Merge:** trinity-symphony-shared#51 `c497916` 20:27:24Z  
**Deploy:** Railway gcm `40aeefe8` SUCCESS 20:27:47Z (boot 20:29:50Z)  
**Health:** `loopCount` advancing, `codeVersion` `8.2.0-reflect-wired`  
**OPENROUTER_MODEL** name present on gcm (value not printed). NVIDIA_NIM_API_KEY name present.

Verdict: **DEPLOYED + ORDER VERIFIED. Successful Groq hop NOT VERIFIED on this sample (all five hops failed).**

## Proofs

### 1. Never sent `deepseek/deepseek-chat`
gcm deploy logs for tasks 435123 and 435146 (post-deploy) list failed hops:

`groq` → `cerebras` → `openrouter` → `nvidia` → `together`

**deepseek is absent.** Matches `FREE_TRY_ORDER` (deepseek not in the free list). Two tasks, same order.

### 2. Groq is tried first
Both tasks: first line is `groq failed`. Groq is first.

This sample Groq also failed (no body in the log line). HAL `verify_output` from this session still got `groq:TRUE` on the **engine** path — fleet direct Groq ≠ engine HAL Groq. Do not treat fleet Groq success as proven here.

### 3. Cerebras 404 is parked, not tight-loop retried
One `cerebras failed` per task, then the next hop. Not 9 rapid retries on the same task. Aligns with model-gone park (catalog `gemma-4-31b` → HTTP 404). Cerebras stays parked (config), not a 429 midnight timer.

### 4. Together is the last live free hop
After nvidia (optional NIM), `together failed`. When Cerebras is skipped/parked, try-order is Groq → OpenRouter :free → NIM → Together. Together **was attempted**. Unused-before, keyed, now in the hop list.

## What this does not prove
- A **successful** free completion (this sample: `All LLMs failed`).
- OpenRouter actually used `nvidia/nemotron-3-5-lightning:free` (name present; value not logged).
- Engine HAL quorum gated the same way (this is **fleet `callLLM`**, not `ENGINE_LLM_PROXY` — proxy skipped unless `SEAN_PAID_LOOP`).

## Status
**BUILT** on main + **DEPLOYED** on gcm. **VERIFIED** for hop order and no paid DeepSeek default. **NOT VERIFIED** for a green Groq-first completion.
