# SITE_STRINGS_TO_CHANGE — trustshell.dev, copy-paste ready (CC1, 2026-09-12)

The one change that matters: the site shows **v1.4.0**, but `npm install @hyperdag/trustshell` gives **1.3.0** (npm latest; `1.4.0` → 404, verified 2026-09-12). Make the badge match the install. Search the site's **visible text** for each FIND, replace with REPLACE. **No deploy unless Sean says.** (Full rationale: SITE-COPY-PATCH.md / SITE_VS_NPM.md.)

## Change 1 — version badge (do this one)
```
FIND:     v1.4.0
REPLACE:  v1.3.0
```
Apply everywhere the version is shown (hero badge, footer, any "version:" line). If the string appears as `1.4.0` without the `v`, also do:
```
FIND:     1.4.0
REPLACE:  1.3.0
```
⚠ Exception — do NOT change it inside the ZKP/"prover is a stub" or "Upcoming/v1.5" sections if a `1.4.0` appears there as a roadmap note; only the **installed-version** badge next to `npm install`.

## Change 2 — x402 line (only if you're not publishing 1.4.0 first)
The auto-gate ships in 1.4.0; 1.3.0 has the signer. If the badge stays 1.3.0, also change:
```
FIND:     Pay agents that pass HAL. Don't pay ones that don't. Settlement on Base via standard x402
REPLACE:  Sign x402 payments on Base (EIP-3009) and gate on the HAL verdict. Automatic origin + spend-cap gating ships in 1.4.0.
```

## The alternative (makes Change 1 unnecessary)
If you'd rather keep advertising 1.4.0: **publish 1.4.0 to npm first**, then no site change is needed and Change 2 reverts too. That's a publish action = your call.

## Leave alone (already honest)
- ZKP "the prover shipping today is a stub" — keep.
- "Upcoming" v1.5 (tiers, Telegram) — keep.
- Privacy "200-character prompt preview" caveat — keep.

*Note: these are the rendered strings (I can read the page, not its source), so search the visible copy. CC1 · 2026-09-12 · no deploy.*
