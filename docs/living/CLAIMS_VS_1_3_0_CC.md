# CLAIMS_VS_1_3_0_CC — trustshell.dev claims vs the PUBLISHED npm 1.3.0 (CC, 2026-09-12) [V]

What a stranger who runs `npm install @hyperdag/trustshell` actually gets is **1.3.0** (npm latest; `1.4.0` → 404, published versions are 1.0.0–1.3.0 [V `npm view`]). The site advertises **v1.4.0**. This table maps each site claim to whether it's in the *installed* package. Surface verified by `npm pack @hyperdag/trustshell@1.3.0` and grepping `dist/`.

## ⚠ Headline: version overclaim
**trustshell.dev shows "v1.4.0" + `npm install @hyperdag/trustshell`.** npm latest is **1.3.0**. So the install command yields 1.3.0, and every 1.4.0-only capability below is **not installable today**. This is an overclaim on a surface strangers hit (the version badge + install command).

## Honest table — claim | in published 1.3.0? | evidence
| Site claim | In 1.3.0? | Evidence |
|---|---|---|
| **HAL cross-LLM verification** (5 metrics, sub-0.85 queues peer verify) | **YES** | `verifyOutput` PRESENT in dist; runs against live engine (5-metric detail is engine-side) |
| **ERC-8004 portable RepID** (earned, on-chain Base Sepolia) | **YES** | `getRepID` + `getRepIDStake` PRESENT; on-chain read |
| **ZKP Plonky3 proofs** — site says *"prover shipping today is a stub: produces no real proof"* | **YES (honest caveat)** | `presentProof` + `verifyProofLocally` PRESENT; site's stub caveat is honest (and conservative — real Plonky3 rows exist in prod, but under-claiming is the safe direction) |
| **x402 payments** — "Pay agents that pass HAL… settlement on Base via standard x402" | **PARTIAL** | `buildX402Payment` (raw EIP-3009 signer) + `executeA2A` PRESENT. But the **fail-closed gating** that makes "don't pay ones that don't" automatic — `guardedX402Payment`, origin gate (`assertOriginCanPay`), `auditThenAct` — is **ABSENT from 1.3.0** (it's 1.4.0/main only). In 1.3.0 the caller must enforce that composition themselves. |
| **`x402_eligible` field in output** | not on SDK surface | engine response field, not an exported symbol — not verifiable from the package |
| **Leaderboard / service discovery** | **YES** | `getLeaderboard`, `listServices` PRESENT |
| **Latest on-chain anchor** | **YES** | `lastAnchorTx` PRESENT |
| **Spend cap / allowance** (`getAllowance`, TrustKeys readAllowance-as-cap) | **NO** | `getAllowance` ABSENT in 1.3.0 — 1.4.0/main only (#131/#134/#135) |
| **Smaller-disclosure proof** (`presentEnvelope`) | **NO** | ABSENT in 1.3.0 |
| **Privacy: vault AES-GCM/IndexedDB, passphrase never leaves device, history on-device, ≤200-char prompt preview** | runtime, not SDK export | Can't verify from the package `.d.ts`. Note: `verifyOutput` **sends the prompt to the engine** (HAL is a server call), so "no server-side copy" holds only with the site's own "200-char prompt preview" caveat. |
| **v1.5 features** (permission tiers, Telegram) — labeled "Upcoming" | N/A (honest) | correctly future-tagged |

## What to fix (site owner's call — no site edit made here)
1. **Version**: either publish 1.4.0 to npm, or change the site badge to **v1.3.0** so the install command matches what ships. Right now "v1.4.0" + `npm install` disagree.
2. **x402 framing**: 1.3.0 ships the *signer*, not the automatic HAL/origin/cap **gate**. Either scope the "don't pay ones that don't" claim to 1.4.0, or note the caller composes the gate in 1.3.0.
3. ZKP + v1.5 claims are already honest — leave them.

## Method (read-only, reproducible)
```
npm view @hyperdag/trustshell version          # → 1.3.0
npm view @hyperdag/trustshell versions          # → [1.0.0,1.1.0,1.2.0,1.3.0]  (no 1.4.0)
npm pack @hyperdag/trustshell@1.3.0 ; tar -xzf … ; grep -r <symbol> package/dist
```
---
*CC · 2026-09-12 · TrustShell-tests lane · WebFetch trustshell.dev + npm pack 1.3.0. No site edit, no publish.*
