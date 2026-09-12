# WALK_MAIN vs live /create — one table (XC, 2026-09-12) [V]

CLI walk: `WALK_MAIN.md` against `init-pai.mjs` (SDK `verifyOutput` → `.verdict`).
Live page: production `https://www.trustshell.dev/create` HTTP 200, source = `origin/main` `1c760f2` (#139 FACE + #140 follow-up). Parser on prod still reads `verdict`/`hal_decision`. **#141** (not merged) maps live `decision`.

**Live HAL this fire** (`POST https://repid-engine-production.up.railway.app/api/v1/hal/evaluate`):
- Paris `"The capital of France is Paris."` → `{ decision: "clean", hal_score: 0 }` — **no** top-level `verdict`
- Rome `"The Eiffel Tower is located in Rome, Italy."` → `{ decision: "vetoed", hal_score: 0.9975 }` — **no** top-level `verdict`
- Empty register `POST /api/v1/agents/register` `{name:""}` → **400 empty body**

SSR HTML is name+Create only. Post-submit UI is client-side. Do not call VETO "missing" from SSR — the gap is the **parser**, not the copy.

| capability | SDK `init-pai` (WALK_MAIN) | live /create (prod `1c760f2`) | gap |
|---|---|---|---|
| HAL Paris true claim | **PASS** (`verifyOutput` → `.verdict`) | UI exists; parser reads `verdict`/`hal_decision` → live `{decision:"clean"}` → **"not checked"** | **#141** maps `clean`→PASS. Sean merge. |
| HAL Rome false claim (hero) | **VETO** + "Harness blocked a false claim before you saw it" | UI exists (`romeVerdict === 'VETO'` hero); same parser → live `{decision:"vetoed"}` → **"not checked"**, hero never fires | **#141** maps `vetoed`→VETO. This is the load-bearing gap. |
| Duplicate name | no stack; `name taken` / reuse (exit 0) | 429 → "That name is taken — pick another." Live empty 429 body is handled **only after #141** (`parseRegister(429, {})`). Prod `if (!res.ok \|\| !data.agent_id)` also maps 429, so 429 still says name-taken on prod. | Prod OK for 429. Empty-body 400/422 empty-name is **#141**. |
| Empty name | CLI requires `--name` | Client: "Give your PAI a name first." Live engine: **400 empty body** [V]. Prod 400 falls through to `data.error \|\| Register failed (400)` — empty error → **"Register failed (400)."** | **#141** maps 400/422 → same empty-name copy. |
| apiKey shown once | yes, on fresh register only; saved to `.trustshell/credentials.json` | yes, "Shown once. Copy the apiKey now". Reads `api_key` only; missing key → `(not returned)` after #141 also accepts `apiKey` | Minor. #141 camelCase. |
| Second PAI | `TRUSTSHELL_HOME=.trustshell/<name>` pointer (PowerShell) | **Create a second PAI** button resets the screen (#140). CLI pointer kept. | None. |
| Origin+spend-cap refuse | **YES** — `guardedX402Payment` Unknown origin / over-cap | **not on the page** (correct — 1.4.0/git; SITE_STRINGS). | Do not add. |
| Version badge | n/a (CLI prints tree 1.4.0) | none on `/create` (honest). Homepage badge is #142. | Homepage, not this page. |

**Verdict:** CLI walk is green (VETO fires). Live page **UI** is ready; live **HAL field** is `decision`, so production Rome is "not checked" until **#141** merges + Vercel deploys. CC1's earlier SSR-only table (`LIVE_CREATE_AUDIT_CC.md`) over-called VETO "MISSING"; the copy is there, the parser is not.

No src edit. No merge. No deploy. Did not register a named agent.

---
*XC · 2026-09-12 · wakeup 48 · live HAL + empty register probed; page source = origin/main `1c760f2`.*
