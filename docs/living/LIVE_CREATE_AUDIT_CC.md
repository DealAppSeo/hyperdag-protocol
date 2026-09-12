# LIVE_CREATE_AUDIT_CC — www.trustshell.dev/create friction + WALK_MAIN gap (CC1, 2026-09-12) [V-partial]

Ran the real page (the **public** `https://www.trustshell.dev/create`, HTTP 200 — not the SSO-gated preview). "Break it" = friction audit. **Scope caveat:** WebFetch sees **server-rendered HTML only**; the post-submit flow (key modal, VETO reveal, error toasts) runs client-side and is NOT captured — those points are "not in initial render," and a browser click-through is needed to confirm they don't appear after **Create**. Flagged per point. No fix applied (create page is CC2/`trustshell.ts` lane).

## Friction found (initial render)
| # | check | finding |
|---|---|---|
| 1 | Heading / first CTA | **OK** — "Create your PAI" + "Name your PAI" input + **Create** button; obvious. |
| 2 | One primary button | **OK** — single "Create", no competing CTAs. |
| 3 | Value before key/commit | **FRICTION** — must name + submit before any value; no HAL/VETO demo precedes it. |
| 4 | HAL **VETO** moment | **MISSING (in SSR)** — no "we caught a false claim" beat visible. (browser-confirm post-submit) |
| 5 | Key-once warning | **MISSING (in SSR)** — copy says *"the one it returns is yours to keep"* but **no** "shown once / copy now / never leaves device / no recovery". Lost-key risk. |
| 6 | Empty / duplicate-name error copy | **MISSING (in SSR)** — no visible guidance for empty submit or name-taken (429). |
| 7 | Dead-ends | nav has **Agents** → `/agents` route returns **HTTP 200** (page loads, not a route-level dead-end). The recorded trap was an **API/action-level 401** ("get an agent"), which is client-side — **still needs a browser to confirm.** |
| 8 | Steps to create | 2 fields (name + Create); full generation flow client-side, not in SSR. |
| — | Version | not on `/create`. **Homepage shows `v1.4.0` AND a stray `1.1.9`** [V curl] — fix the `v1.4.0` badge to `1.3.0` (SITE_STRINGS_TO_CHANGE) and check what the `1.1.9` refers to (even staler). |

## WALK_MAIN (SDK/CLI) vs live page — one table
What the SDK `init-pai` walk surfaces (WALK_MAIN) vs what the live page shows:
| capability | SDK `init-pai` (WALK_MAIN) | live /create (SSR) | gap |
|---|---|---|---|
| HAL VETO demo | **YES** — `verify Rome: VETO` "harness blocked a false claim" | not in SSR | **surface the VETO beat** (copy ready: CREATE_PAI_UI "VETO line") |
| Key-once warning | CLI writes `.trustshell/credentials.json` (local) | no one-time/copy-now warning | **add key-once modal** (copy ready: CREATE_PAI_UI "key-once warning") |
| Name-taken / register-fail handling | CLI: `name taken, pick another` (exit 1, no stack) | no error copy | **add error states** (copy ready: CREATE_PAI_UI "Error + empty-state copy") |
| Keyless start | verify/presentProof keyless | page gates value behind name+create | consider showing a HAL demo pre-commit |
| Mint status | `register is NOT_MINTED until a keyed mint` | not shown | optional: state NOT_MINTED honestly |

## For CC2 (fixes — their lane; copy already drafted)
Every gap above has paste-ready copy in **`CREATE_PAI_UI.md`** (VETO line · key-once warning · error/empty-state block · friction checklist). This audit is the verify half ("break it"); the fix is CC2's on the create page. Two need a **browser click-through** to close: does the VETO beat + key-once modal appear *after* Create (points 4/5), and does the `Agents` nav 401 a new visitor (point 7)? I can run those if given a way to click (the page is public, but the interactive assertions need a real browser).

---
*CC1 · 2026-09-12 · docs+verify lane · live page fetched (SSR); interactive flow NOT CHECKED (needs browser). No fix, no publish, no src touch.*
