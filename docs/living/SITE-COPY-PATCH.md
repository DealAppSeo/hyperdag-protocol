# SITE-COPY-PATCH — exact trustshell.dev copy changes (CC1, 2026-09-12) — DRAFT, NO DEPLOY

Fixes the two honest gaps from SITE_VS_NPM.md: the **version badge (1.4.0) vs the install (1.3.0)**, and **x402 copy implying an automatic gate that ships only in 1.4.0**. Visible-copy find/replace — a site editor searches the rendered strings. **Do not deploy unless Sean says.** Nothing here touches the SDK.

## PATCH 1 — version badge (the misleading one)
The page shows `v1.4.0` beside `npm install @hyperdag/trustshell`, but npm latest is `1.3.0` (`1.4.0` = 404). The install yields 1.3.0.
| | text |
|---|---|
| **FIND** | `v1.4.0` |
| **REPLACE** | `v1.3.0` |
Rationale: match the badge to what `npm install` actually delivers. (Alternative, if you'd rather advertise 1.4.0: **publish 1.4.0 to npm first**, then this patch is unnecessary.)

## PATCH 2 — x402 auto-gate language (1.4.0-only capability)
1.3.0 ships the **signer** (`buildX402Payment`/`executeA2A`); the automatic HAL/origin gate (`guardedX402Payment`, `assertOriginCanPay`, `auditThenAct`) is **1.4.0/git-only**. Today's copy reads as if refusal is automatic.
| | text |
|---|---|
| **FIND** | `Pay agents that pass HAL. Don't pay ones that don't. Settlement on Base via standard x402` |
| **REPLACE** | `Sign x402 payments on Base (EIP-3009) and gate on the HAL verdict. Automatic origin + spend-cap gating (guardedX402Payment) ships in 1.4.0.` |
Rationale: true for the installed 1.3.0 (you sign + decide on the HAL verdict); the "don't pay ones that don't" auto-refusal is honestly scoped to 1.4.0. **Do not claim `guardedX402Payment` / the origin gate as available until npm 1.4.0 is live.**

## LEAVE AS-IS (already honest — do not touch)
- ZKP: *"the prover shipping today is a stub: it produces no real proof"* — honest (conservative; keep).
- v1.5 features labeled **"Upcoming"** — correctly future-tagged.
- HAL 5-metric, RepID/ERC-8004, leaderboard — all in 1.3.0 [SITE_VS_NPM]. No change.
- Privacy copy: keep the **"200-character prompt preview"** caveat — it's what makes "no server-side copy" true given HAL is a server call.

## When npm 1.4.0 ships
Revert PATCH 1 (badge → 1.4.0) and PATCH 2 (restore the auto-gate line) in the same change that publishes — so copy and package move together, not before.

---
*CC1 · 2026-09-12 · draft only; deploy is Sean's call. Source: SITE_VS_NPM.md / CLAIMS_VS_1_3_0_CC.md.*
