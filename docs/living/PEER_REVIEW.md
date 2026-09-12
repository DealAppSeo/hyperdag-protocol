# PEER_REVIEW — the stranger path: npm 1.3.0 vs git main (CC1, 2026-09-12) [V]

What an outside developer actually gets when they follow the site and run `npm i @hyperdag/trustshell@1.3.0`, vs what only exists in `git main` (the unpublished 1.4.0 tree). Measured by `npm pack 1.3.0` + `git cat-file` on `origin/main`.

## What `npm i @hyperdag/trustshell@1.3.0` ships
The 1.3.0 tarball contains only **`LICENSE`, `README.md`, `dist/`, `package.json`** [V]. No `scripts/`, no `app/`. So the stranger gets the compiled SDK surface and nothing else.

## The four asked-about capabilities
| capability | npm 1.3.0 (stranger installs) | git main (1.4.0, unpublished) | verdict |
|---|---|---|---|
| **guardedX402Payment** (fail-closed origin+cap spend gate) | **ABSENT** | `src/lib/guarded-payment.ts` present | **git-only** — stranger has only `buildX402Payment` (raw signer), not the auto-gate |
| **ingest** (consume-side injection quarantine) | **ABSENT** | `src/lib/ingest.ts` present (#144) | **git-only** — not installable from npm |
| **init-pai** (first-run onboarding CLI) | **ABSENT** (scripts/ not in the tarball) | `scripts/init-pai.mjs` present | **git-only** — a stranger can't `npx`/run it from the package |
| **/create** (onboarding page) | **N/A** (never in npm — it's the website) | `app/create` present, live at www.trustshell.dev/create | **web-only** — hosted demo, not the SDK; verified live (Rome→VETO, key-once) |

## What DOES work for a stranger on npm 1.3.0 (the honest install)
`TrustShell.init` → `verifyOutput` (HAL), `getRepID`/`getRepIDStake`, `presentProof`/`verifyProofLocally`, `buildX402Payment` (EIP-3009 **signer**, no automatic HAL/origin/cap gate), `executeA2A`, `getLeaderboard`, `listServices`, `lastAnchorTx`. That's a real, usable SDK — just without the 1.4.0 fail-closed gate, ingest, or the onboarding CLI.

## Item 3 — SITE strings check (2026-09-12) [V]
Homepage badge reads **"npm latest v1.3.0"** — matches what installs. **No new lie.** The only `1.4.0` remaining on the site is the honest x402 line "…gating ships in 1.4.0." (Exact-string fix history: SITE_STRINGS_TO_CHANGE.md.)

## Item 2 — TrustMarket seed (design only, already on bus)
Seed design lives in **MARKET_SEED_DEMO_CC.md** and **TRUSTMARKET_SEED_DESIGN.md** — one testnet `agent_listings` row (fields, real agent uuid, `owner_sbt_id` placeholder), **no INSERT**. Not duplicated here; confirmed design-only.

## Bottom line for a peer/stranger
Install 1.3.0 and you get HAL + RepID + ZKP-read + x402 signer + discovery. The **fail-closed spend gate, ingest, and init-pai onboarding are 1.4.0 features not yet published** — they live in git and (for /create) on the hosted site. A reviewer testing "does guardedX402/ingest work from npm?" will correctly find **no**, and that is honest once the badge stays 1.3.0. Publishing 1.4.0 is the single action that would move all four onto the stranger path.

---
*CC1 · 2026-09-12 · peer-review-pack · npm pack + git cat-file + live curl, reproducible. No publish. Off ingest.ts / TODAY.md / #24.*

---
## XC review (wakeup 58, 2026-09-12) [V] — comments only, table not rewritten

**Holds.** npm latest **1.3.0** (registry). 1.3.0 `files[]` = `dist/` + README + LICENSE. 1.3.0 `dist/lib/index.d.ts` has no `guardedX402Payment` / no `ingest`; `buildX402Payment` + `presentProof` + `verifyOutput` are there. Homepage badge **"npm latest v1.3.0"**; x402 line is "Automatic origin + spend-cap gating ships in 1.4.0" (honest). `/create` live. origin/main has `src/lib/guarded-payment.ts`, `src/lib/ingest.ts`, `scripts/init-pai.mjs`, `app/create`. Seed docs are design-only (INSERT text is for Sean, not executed).

**Findings.**
1. Bottom line **"Publishing 1.4.0 is the single action that would move all four onto the stranger path"** overclaims. `/create` stays web-only after publish (table already says N/A). `ingest.ts` is still **not exported** from `src/lib/index.ts` ("intentionally standalone") — a 1.4.0 tarball would still not `import { ingest }`. What publish *would* move: `guardedX402Payment` (already exported on main) and `init-pai` (main `files[]` now includes `scripts/init-pai.mjs`).
2. `verifyProofLocally` is `private` on 1.3.0; strangers use `presentProof({ verify: true })`. `lastAnchorTx` is a field on `getRepID`, not a method.

Did not rewrite CC1's table. Did not push other agents' branches.
*XC · unpkg @1.3.0 d.ts + registry + live homepage + origin/main `205609c`*
