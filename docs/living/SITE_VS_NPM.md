# SITE_VS_NPM — trustshell.dev vs npm 1.3.0 vs git main (CC1, 2026-09-12) [V]

Three sources, one question per capability: **LIVE** (in published npm 1.3.0 — a stranger who `npm install`s gets it), **GIT-ONLY** (on `main` = 1.4.0 but unpublished, so not installable today), or **LIE** (claimed but in neither).

- **trustshell.dev** [WebFetch 2026-09-12]: shows **"v1.4.0"** + `npm install @hyperdag/trustshell`.
- **npm**: latest is **1.3.0** (`npm view` → versions 1.0.0–1.3.0; `1.4.0` → **404**). Surface from `npm pack 1.3.0` + grep `dist/`.
- **git main**: `package.json` version **1.4.0**; surface from `git grep origin/main src/`.

## The one misleading thing (fix first)
**The site's "v1.4.0" badge sits next to `npm install`, but the install yields 1.3.0.** 1.4.0 is real *in git*, just unpublished — so it's not a fabrication, but the version a stranger installs does not match the number advertised, and the 1.4.0-only capabilities below are not installable. **Not a lie; a version overclaim.** Fix: publish 1.4.0, or show 1.3.0 on the site.

## Table — capability | site claims | npm 1.3.0 | git main | verdict
| Capability | site | 1.3.0 | main | verdict |
|---|---|---|---|---|
| HAL verification (`verifyOutput`) | yes | ✅ | ✅ | **LIVE** |
| RepID read (`getRepID`/`getRepIDStake`) | yes | ✅ | ✅ | **LIVE** |
| ZKP `presentProof` / `verifyProofLocally` | yes (+"prover is a stub") | ✅ | ✅ | **LIVE** — site *under*-claims (real Plonky3 rows exist in prod); honest-conservative |
| x402 **signer** (`buildX402Payment`/`executeA2A`) | yes | ✅ | ✅ | **LIVE** |
| x402 **fail-closed gate** (`guardedX402Payment` + origin `assertOriginCanPay` + `auditThenAct`) | implied by "pay ones that pass HAL, don't pay ones that don't" | ❌ | ✅ | **GIT-ONLY** — 1.3.0 ships only the raw signer; the automatic gate is 1.4.0 |
| Spend cap / allowance (`getAllowance`, readAllowance-as-cap) | cap implied | ❌ | ✅ | **GIT-ONLY** |
| Circuit breaker (`CircuitBreaker`) | not claimed | ❌ | ✅ | git-only (not advertised) |
| Leaderboard / discovery (`getLeaderboard`/`listServices`) | yes | ✅ | ✅ | **LIVE** |
| Latest on-chain anchor (`lastAnchorTx`) | on-chain implied | ✅ | ✅ | **LIVE** |
| Smaller-disclosure proof (`presentEnvelope`) | **not claimed** | ❌ | ❌ | neither — would be a LIE **if** claimed; it isn't |
| Privacy: AES-GCM vault / on-device / ≤200-char preview | yes | runtime (not an SDK export) | runtime | **UNVERIFIABLE from the package** — and note `verifyOutput` sends the prompt to the engine (server call), so "no server-side copy" holds only with the site's own 200-char-preview caveat |
| v1.5 tiers + Telegram | "Upcoming" | ❌ | ❌ | honest (future-tagged) |

## Verdict
- **LIVE (installable, works):** HAL, RepID, ZKP read, x402 signer, leaderboard/discovery, lastAnchorTx.
- **GIT-ONLY (on main, not published):** the fail-closed x402 **gate**, allowance/cap read, circuit breaker.
- **LIE (claimed, exists nowhere):** **none found.** The site is honest on ZKP (under-claims) and v1.5 (future). The single real problem is the **version badge (1.4.0) vs the install (1.3.0)** and the x402 "gate" language reading as if the automatic gate ships in the installed package.

## Method (read-only, reproducible)
```
npm view @hyperdag/trustshell version            # 1.3.0
npm view @hyperdag/trustshell@1.4.0 version       # 404
npm pack @hyperdag/trustshell@1.3.0 ; grep -r <sym> package/dist   # published surface
git grep -l <sym> origin/main -- 'src/**'         # git-main surface (1.4.0)
```
---
*CC1 · 2026-09-12 · docs+verify lane · WebFetch + npm pack + git grep. No site edit, no publish, no src touch.*
