# TODAY — 2026-09-10
**Derived from:** TRUE_NORTH + STATE LAST_VERIFIED 2026-09-10 + Linear HYP-6  
**Expires:** 2026-09-11 00:00 PT  
**Cast:** CC + T12. Grok/Claude agree on unheld merges. Sean-only items listed at the bottom, not blocking the day.  
**Inherit rule:** tomorrow AM starts here. No new sweep.

**PROGRESS 2026-09-10 (CC):** ✅ Loop 1 DONE — G3 (`/state` false-positive fixed) + G1 (`v_agent_liveness` applied to prod, wraps `deriveLoopHealth` over `agent_health_probes`, proof run; `/state` skill + STATE generator repointed). Verified truth: **loops advancing ×12, but not_claiming ×12 (8–83d)** — live loops / zero throughput, not dead. ✅ Loop 2 — #710 conflict resolved → **MERGEABLE**, CI re-running on merge commit; awaiting Sean `merge` (verified #710 still needed: contracts stuck `fulfilled` since 09-05, #707 didn't close it). ✅ Loop 4 — `AGENT_RESTART_CHECKLIST.md` written (living-docs; mirror to GitHub). Reports in `E:\dev\reports\2026-09-10\`.

Night forbidden (repeat): npm publish · Railway restart · MODE=full · column rename · new product folder · PHI · SECURITY DEFINER revoke · HOLD merge · public launch language · spend · Gemini/ChatGPT inventories.

---

## Vital-never-miss

| Vital | Status now | Done-when |
|---|---|---|
| Money-path settlement beat | #707 merged; **#710 merged** | Next living-proof captures USDC (or testnet USDC) after `/satisfy` accepts criterion ratings — i.e. a `service_contracts` row reaches `settled` again (stuck `fulfilled` since 09-05) |
| Honesty claim=code | #121 APPROVE-HOLD | README three-state table matches live HAL 2/6; no unpublished npx pin; no `evaluate()` as live on 1.3.0 |
| Live instrument health | ✅ **DONE** — `v_agent_liveness` live + `/state`/generator repointed; `artifact_url` false-positive fixed | met: view returns honest advancing/hung/down + not_claiming_24h; `/state` no longer uses bare `artifact_url IS NULL` |
| Next Ready under HYP-6 | HYP-5 CALLSITES 13→0 is Backlog | Only after the three rows above move or are Sean-blocked |

---

## Loops (≤4)

### Loop 1 — G3 + G1  ·  Owner: CC  ·  Ready
Fix the lying instruments. Do not invent a second liveness definition.

- **G3:** one-line `/state` fix. Read `result` / `requires_external_artifact`, not `artifact_url IS NULL`.
- **G1:** additive `v_agent_liveness` that **wraps** existing `deriveLiveness` / `agent_health_probes`. Recency + last claim + loopCount. Never read `agent_heartbeat.status`.
- Prove with a SELECT that shows 10/12 “online” vs actually-dead.
- Point `/state` and the STATE generator at the view.

**Done-when:** a live query returns honest dead/stale/live and the `/state` false-positive is gone.  
**Forbidden:** G2 column rename. G4 session hook. G6 restart.

### Loop 2 — Money path #710  ·  Owner: CC review + Sean merge  ·  Ready for review
`/satisfy` must settle. This is traction.

**Done-when:** CI still green on #710 AND Sean types `merge` on the PR / Linear AND the next daily living-proof leaves a settlement row that is not stuck `authorized`.  
**Sean-only step:** merge.  
**If held:** write the restart-checklist is NOT this loop. Stay on settle.

### Loop 3 — Honesty close #121  ·  Owner: CC must-fixes + Sean HOLD  ·  HOLD that branch
Four must-fixes. Then Sean `merge` for docs only.

**Done-when:** #121 merged. **1.4.0 stays unpublished** until HAL/claim parity.  
**Forbidden:** npm publish. Marketplace copy. “MVP launched.”

### Loop 4 — Railway checklist, not restart  ·  Owner: CC writes / Sean reads  ·  Ready
0 claims/24h makes restart **justified**, not automatic.

Write one page:

1. Per service: `HEARTBEAT_MODE`, `loopCount`, `lastIterationAt`, last `llm_call_log`, `RAILWAY_GIT_COMMIT_SHA`
2. Restart **only** frozen+unhealthy
3. Revived services start `HEARTBEAT_MODE=throttled` — never `full`
4. First-claim success criteria (one real claim in 30 min, no 8.6M/day write storm)
5. Peer-verify producer stays behind a churn filter (drop `EVERGREEN_AUDIT` / `diag_probe` / `SHADOW_REJECT`)

**Done-when:** checklist exists on both living-docs and GitHub.  
**Forbidden:** CC pressing restart. That is Sean-only (G6).

---

## If tokens remain — pull order

1. Finish Loop 1 proof query.
2. If #710 still open and CI green, ping Sean on Linear: `merge` + link.
3. Draft drain-filter design (no drain execution).
4. HYP-5 CALLSITES 13→0 **tests only**, no prod flip.
5. Tombstone remaining stale numbers CC already listed. Loud banners, no silent delete.
6. STOP at 6 sprints / 4h per ticket. Write NEXT.

Do not: SECURITY DEFINER rewrite, 58-view revoke, marketplace pages, new inventories, Vision Doc v2.

---

## Sean-only tonight (EOD, 10–15 min)

Reply on Linear with HYP-6 verbs.

- [ ] `merge` repid-engine#710 if CI green
- [ ] `merge` trustshell#121 if must-fixes pass — do not `publish`
- [ ] Read Railway checklist; restart only after MODE/loopCount printed — or HOLD until morning
- [ ] Copy these three living files to `E:\dev\living-docs\` AND GitHub `docs/living/` in the same hour
- [ ] Overnight contract: **yes, continue Loops 1 remainder + NEXT list** / or **stop**

---

## CLAIM-PATH LOOP — CLOSED 2026-09-10 18:35 UTC (CC)
Root cause NAMED (not a code bug): all 5 pending tasks were `assigned_to` non-running agents (`trinity-gemini-antigravity`, `trinity-grok-code`, `trinity-cowork-executor`), so the claim predicate excluded them for every one of the 12 live agents → open pool empty *for the fleet*. Full falsification H1–H5 in `CLAIM_PATH.md`. **PROVEN healthy:** open-pool probe (task 435116, `meta`) claimed by `trinity-gcm` in **11s** and completed. `claim_count`-exhaustion (H5-cap) refuted (=0).

**Sean decision (not done by CC):** the 5 real tasks stay assigned to the CLI agents — either run those agents (Gemini Antigravity / Grok Code / Cowork), or explicitly `assigned_to=NULL` specific rows to release to the fleet. CC did not reassign (PURGE-public-surfaces etc. are specialized + risky).

## NEXT (execute in order — nobody waits on chat)
1. ✅ Loop 1 (G3+G1) done. ✅ Claim-path named + proven. ✅ Loop 2 #710 MERGEABLE (Sean merge).
2. **Push TODAY.md + TOKEN_BUDGET.md + CLAIM_PATH.md + AGENT_RESTART_CHECKLIST.md → hyperdag-protocol/docs/living/** (branch + PR; Sean merges). Grok owns TOKEN_BUDGET.md (first writer). CC owns CLAIM_PATH.md.
3. **#121 trustshell must-fixes only** — no merge, no publish.
4. Evergreen re-arm: **HOLD** until Sean confirms FREE-TIER providers for the fleet (do not arm volume that spends).

## FREE-TIER GATE 2026-09-10 (CC) — 🟢 NOT EXHAUSTED
Inventory in `TOKEN_BUDGET.md`. Truth: 24h LLM spend ≈ **$0.0019 total** (groq $0.0014 + openrouter $0.0005). Working: groq(13,0-fail), openrouter(9,1-fail), deepseek(1). Failing 9/9: cerebras, gemini, mistral, zai. Present-unused: NVIDIA_NIM, Together, Fireworks, SambaNova, SiliconFlow. **Do NOT stamp FREE_EXHAUSTED** (3 providers live).
- **Only real paid vector:** OpenRouter runs a **paid** model id (`deepseek/deepseek-chat`), not `:free`. Fix = env `OPENROUTER_MODEL=<verified :free id>` (Sean, Railway) — but V4 hardcodes it, so the code must be env-overridable first (small PR).
- **Router fix location:** `ConstitutionalAgent.ts` is a DEAD SCAFFOLD (fixing = theater). Real router = `ConstitutionalAgentV4.js callLLM` → repid-engine proxy + direct fallback. Working copy is mid-merge (edit only on a clean worktree). Full `allow_paid=false` + try-order + 429-exhaustion spec in `TOKEN_BUDGET.md`; the primary paid-gate belongs in **repid-engine** (separate PR).
- **MISSING for Sean:** `NVIDIA_API_KEY` (only `_NIM_` present); no standalone Llama key (LiteLLM-hosted).

## SESSION CLOSE 2026-09-10 (CC) — all 4 NOW-tasks done
1. ✅ Claim-path named + proven (probe 435116 claimed by gcm in 11s; 5 pending all `assigned_to` non-running CLI agents). 2. ✅ Docs → hyperdag-protocol PR #21 (4 files). 3. ✅ #121 must-fixes all present; greptile P2 verified FALSE POSITIVE (SHAs pinned + contents:read); Strix APPROVED — ready for Sean docs-only merge, not merged/published. 4. ✅ Free-tier gate: Grok's `free-tier-gate.js` logic verified CORRECT by CC; NOT exhausted.

**NEXT (real work):** wire `free-tier-gate.js` into `ConstitutionalAgentV4.callLLM` + repid-engine proxy (inert until wired) + add `cerebras`/`nvidia` rows to V4 `PROVIDERS` (FREE_TRY_ORDER names them, map lacks them). **Sean:** merge #121; set `OPENROUTER_MODEL=:free` + NVIDIA key on Railway; decide the 5 mis-assigned tasks; resolve the mid-merge `trinity-symphony-shared` working tree (5+ conflict markers). **Held:** G2/G4/G6, evergreen re-arm, 58-view SECDEF (P0-7 parked).

**Do not start a new sweep. Free-tier only until Sean authorizes paid.**

## NEXT 2026-09-10 (Grok verifier, ENGINE_HAL_DEPLOY FAIL)

1. ENGINE_HAL_DEPLOY: service name **PASS**; SQL **FAIL** (`'<DEPLOY_TS_UTC>'` not a timestamptz). CC keeps engine lane.
2. Unclaimed: **22** open-pool NULL + **5** original dead-assigned = 27 pending unclaimed. Claim path healthy. No UPDATE of the 5.
3. claim=code: site `v1.4.0` / `evaluate()` vs npm 1.3.0 still FAIL (reports/CLAIM_CODE_TRUSTSHELL_DEV.md). No Path B deploy.

