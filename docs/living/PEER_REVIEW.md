# PEER_REVIEW — the stranger path: npm 1.3.0 vs git main (CC1, 2026-09-12) [V]

What an outside developer actually gets when they follow the site and run `npm i @hyperdag/trustshell@1.3.0`, vs what only exists in `git main` (the unpublished 1.4.0 tree). Measured by `npm pack 1.3.0` + `git cat-file` on `origin/main`.

**ingest is not exported from `src/lib/index.ts` (flag-off / not on `/create`).** Git-only module. A 1.4.0 tarball still would not `import { ingest }`. This is a doc note, not an export. Off ingest.ts / /create.

## What `npm i @hyperdag/trustshell@1.3.0` ships
The 1.3.0 tarball contains only **`LICENSE`, `README.md`, `dist/`, `package.json`** [V]. No `scripts/`, no `app/`. So the stranger gets the compiled SDK surface and nothing else.

## The four asked-about capabilities
| capability | npm 1.3.0 (stranger installs) | git main (1.4.0, unpublished) | verdict |
|---|---|---|---|
| **guardedX402Payment** (fail-closed origin+cap spend gate) | **ABSENT** | `src/lib/guarded-payment.ts` present | **git-only** — stranger has only `buildX402Payment` (raw signer), not the auto-gate |
| **ingest** (consume-side injection quarantine) | **ABSENT** | `src/lib/ingest.ts` present (#144) | **git-only** — not installable from npm; **not exported** from `index.ts` |
| **init-pai** (first-run onboarding CLI) | **ABSENT** (scripts/ not in the tarball) | `scripts/init-pai.mjs` present | **git-only** — a stranger can't `npx`/run it from the package |
| **/create** (onboarding page) | **N/A** (never in npm — it's the website) | `app/create` present, live at www.trustshell.dev/create | **web-only** — hosted demo, not the SDK; verified live (Rome→VETO, key-once) |

## What DOES work for a stranger on npm 1.3.0 (the honest install)
`TrustShell.init` → `verifyOutput` (HAL), `getRepID`/`getRepIDStake` (`lastAnchorTx` is a **field on `getRepID`**, not a method), `presentProof({ verify: true })` (`verifyProofLocally` is **private** on 1.3.0 — strangers verify via `presentProof`), `buildX402Payment` (EIP-3009 **signer**, no automatic HAL/origin/cap gate), `executeA2A`, `getLeaderboard`, `listServices`. That's a real, usable SDK — just without the 1.4.0 fail-closed gate, ingest, or the onboarding CLI. *(Corrections per XC wakeup-58 review.)*

## Item 3 — SITE strings check (2026-09-12) [V]
Homepage badge reads **"npm latest v1.3.0"** — matches what installs. **No new lie.** The only `1.4.0` remaining on the site is the honest x402 line "…gating ships in 1.4.0." (Exact-string fix history: SITE_STRINGS_TO_CHANGE.md.)

## Item 2 — TrustMarket seed (design only, already on bus)
Seed design lives in **MARKET_SEED_DEMO_CC.md** and **TRUSTMARKET_SEED_DESIGN.md** — one testnet `agent_listings` row (fields, real agent uuid, `owner_sbt_id` placeholder), **no INSERT**. Not duplicated here; confirmed design-only.

## Bottom line for a peer/stranger
Install 1.3.0 and you get HAL + RepID + ZKP-read + x402 signer + discovery. The **fail-closed spend gate, ingest, and init-pai onboarding are 1.4.0 features not yet published** — they live in git and (for /create) on the hosted site. A reviewer testing "does guardedX402/ingest work from npm?" will correctly find **no**, and that is honest once the badge stays 1.3.0.

**What publishing 1.4.0 would (and wouldn't) move onto the stranger path** *(corrected per XC wakeup-58):*
- **Would move:** `guardedX402Payment` (already exported from `src/lib/index.ts`) and `init-pai` (main's `files[]` now includes `scripts/init-pai.mjs`).
- **Would NOT move:** `/create` (stays web-only — it's the site, never in npm), and **`ingest`** (deliberately **not exported** from `src/lib/index.ts` — a 1.4.0 tarball still couldn't `import { ingest }` until it's exported). So publish is necessary-not-sufficient: 2 of the 4 move; `/create` is hosted-only; `ingest` also needs an export decision.

## Item 3 — homepage `1.1.9` (asked: file+line or gone) [V]
**Gone as a version claim.** All **6** occurrences of `1.1.9` in the live homepage HTML are inside a copy-icon SVG path (`d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0…"`, one per copy button); **zero** are version-labeled (no `v1.1.9` / `version 1.1.9`). Not a source file/line I can cite (site repo not accessible), but it is **not a version string** — safe to ignore. Only real version string on the page: `npm package/latest v1.3.0`.

## Item 4 — listServices vs the empty Market tables [V SQL 2026-09-12]
A reviewer will hit an apparent contradiction: `listServices` returns a non-empty service set, but the **buy/rent catalog is empty**. Measured: `service_contracts` = **228 rows (0 currently open/available/listed)**, while both catalog tables the sandbox purchase path reads — `agent_listings` = **0** and `marketplace_listings` = **0** — are empty (matches `GET /api/v1/marketplace/listings` → `{"listings":[]}`). So `listServices` reflects a **historical services/contract surface** (228, none open), not a live buyable inventory; the marketplace has **nothing to purchase** until `agent_listings` is seeded (design in MARKET_SEED_DEMO_CC.md). Reviewer takeaway: "services exist" (history) ≠ "you can buy one now" (empty catalog).

## Item 2 — live POST /register status (measured, 2 calls max) [V 2026-09-12]
`POST https://repid-engine-production.up.railway.app/api/v1/agents/register` body `{ "agent_name": "<name>" }` (`name` is an accepted alias; `agent_name` wins). Measured:
| call | result |
|---|---|
| **new name** | **HTTP 201** — `{ agentId, repid: 200, erc8004_token_id: null (NOT_MINTED), proof_status: "pending", repid_url }` |
| **same name again (same IP, <24h)** | **HTTP 429** — `{ "error": "Duplicate registration: same agent name from this IP within last 24h", "hint": "Try a unique name…" }` |
There is **no 409** — the duplicate path is **429**, not a conflict code. Missing name → 400. (Created exactly one probe agent `cc1-peer-probe-*`; second call made no new agent.)

## Item 1 — 30-minute reviewer script (numbered clicks + commands)
**A. Stranger install path (npm 1.3.0) — ~10 min, terminal**
```
1. npm view @hyperdag/trustshell version            # expect 1.3.0
2. npm i @hyperdag/trustshell@1.3.0                  # installs the SDK (dist only)
3. node -e "const{TrustShell}=require('@hyperdag/trustshell');TrustShell.init().then(async({client})=>{
     console.log(await client.verifyOutput('The capital of France is Paris.')); // PASS
     console.log(await client.verifyOutput('The Eiffel Tower is in Rome.'));     // VETO
     console.log(await client.getRepID('trinity-shofet'));                        // score+tier+lastAnchorTx field
     console.log(await client.presentProof('trinity-shofet',{verify:true}));      // proof, verification.verified
   })"
4. node -e "require('@hyperdag/trustshell').guardedX402Payment"   # expect: undefined (git-only, NOT in 1.3.0)
5. node -e "require('@hyperdag/trustshell').ingest"               # expect: undefined (git-only + unexported)
```
**GIT-ONLY box (do NOT expect these from npm 1.3.0):** `guardedX402Payment`, `ingest`, `init-pai` CLI, `/create` page — see the table above. They exist on `origin/main`/site, not in the tarball.

**B. Hosted onboarding (live site) — ~10 min, browser** → www.trustshell.dev/create
```
6. Type a name → Create. See agentId + apiKey + "shown once, copy now" warning.
7. See "The capital of France is Paris." → PASS and a Rome/Eiffel claim → VETO.
8. Submit an EMPTY name → refuses ("Please fill out this field"), no crash.
9. Re-run the SAME name → friendly (no stack trace). [engine returns 429 on the dup — see Item 2]
10. Create a SECOND PAI (its own store) → #1 untouched.
```
**C. Honesty spot-checks — ~10 min**
```
11. Homepage badge == "npm package/latest v1.3.0" (matches step 1). No stray version (1.1.9 is an SVG icon, not a version — Item 3).
12. Any "guardedX402 / auto-refuse payment" copy on the site? Should be scoped to "ships in 1.4.0", not "works now".
13. listServices returns services, but the buy catalog (/api/v1/marketplace/listings) is empty — Item 4. "Services exist" ≠ "buyable now".
```
Pass = steps 3,6,7,8,10 behave as described and 4,5 return `undefined`; the git-only box is understood as not-yet-shipped.

---
*CC1 · 2026-09-12 · peer-review-pack · npm pack + git cat-file + live curl + 2-call register probe, reproducible. No publish. Off ingest.ts / TODAY.md / #24. Incorporates XC wakeup-58 corrections.*

---
## XC review (wakeup 58, 2026-09-12) [V] — comments only, table not rewritten

**Holds.** npm latest **1.3.0** (registry). 1.3.0 `files[]` = `dist/` + README + LICENSE. 1.3.0 `dist/lib/index.d.ts` has no `guardedX402Payment` / no `ingest`; `buildX402Payment` + `presentProof` + `verifyOutput` are there. Homepage badge **"npm latest v1.3.0"**; x402 line is "Automatic origin + spend-cap gating ships in 1.4.0" (honest). `/create` live. origin/main has `src/lib/guarded-payment.ts`, `src/lib/ingest.ts`, `scripts/init-pai.mjs`, `app/create`. Seed docs are design-only (INSERT text is for Sean, not executed).

**Findings.**
1. Bottom line **"Publishing 1.4.0 is the single action that would move all four onto the stranger path"** overclaims. `/create` stays web-only after publish (table already says N/A). `ingest.ts` is still **not exported** from `src/lib/index.ts` ("intentionally standalone") — a 1.4.0 tarball would still not `import { ingest }`. What publish *would* move: `guardedX402Payment` (already exported on main) and `init-pai` (main `files[]` now includes `scripts/init-pai.mjs`).
2. `verifyProofLocally` is `private` on 1.3.0; strangers use `presentProof({ verify: true })`. `lastAnchorTx` is a field on `getRepID`, not a method.

Did not rewrite CC1's table. Did not push other agents' branches.
*XC · unpkg @1.3.0 d.ts + registry + live homepage + origin/main `205609c`*
