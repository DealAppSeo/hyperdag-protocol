# HANDOFF — init-pai (XC → CC)

STAMP: **PASS (feature) — CC verified 2026-09-10. One robustness defect flagged (XC's call whether it blocks).**

**claim:** `node scripts/init-pai.mjs --name pai-night-1 --answers "write weekly research|wasted hours|grok"` exits 0 and writes `.trustshell/credentials.json` + `profile.json`. Four answers cap at 3 (no 4th question). `.trustshell/` already gitignored.

**evidence (XC):** https://github.com/DealAppSeo/trustshell/pull/128 · `ff2cc99` · Paris PASS, Rome VETO.
**check run (CC):** isolated worktree on `feat/init-pai` HEAD `ff2cc99`, `npm ci`.

## CC verdict
- **CHECK 1 — `node --test tests/interview.test.mjs`: PASS**, 3/3 (incl. `toolPack always verify + present_proof; pay/market adds x402-cap`).
- **CHECK 3 — 4 answers `a|b|c|d`: PASS.** Wrote both `.trustshell/` files, **no 4th question** (capped at 3), `verify Paris: PASS`, `verify Rome: VETO` + "Harness blocked a false claim before you saw it." Cap-at-3 claim **verified**.
- **CHECK 2 — canonical 3-answer run: the FEATURE passes, the LITERAL command does not.**
  - With a **fresh name** (`pai-cc-verify-0910a`): **node-exit 0**, both JSON files written, Paris PASS + Rome VETO. Claim reproduced. ✅
  - With the HANDOFF's exact `--name pai-night-1`: **uncaught crash** — `TrustShellError: Agent registration failed: 429 — Duplicate registration: same agent name from this IP within last 24h`, **no files written**. (The `EXIT=0` in my first pass was the shell pipeline's `tail`, not node — node threw and printed a stack trace.)

## Defect (real, separable) — register() 429 is uncaught
`scripts/init-pai.mjs` lets `client.register()` throw on a 429 duplicate-name, so **re-running onboarding with a name used in the last 24h from the same IP hard-crashes with a stack trace** instead of degrading. The engine's duplicate guard is correct anti-abuse; init-pai should catch the 429 and either reuse the existing credentials or print a friendly "already registered — reusing / pick another name." Two consequences: (1) XC's own evidence run consumed `pai-night-1`, so the literal HANDOFF check is not reproducible by the next person; (2) a real user who restarts onboarding sees a crash.

**Suggested fix (XC's branch, XC's call):** wrap the `register()` call so a `TrustShellError` with `status === 429` is caught → load/keep local credentials + print the friendly line, exit 0.

**next:** commented on #128 (issue-comment 5630090298) with the above. Did NOT push to `feat/init-pai` (no invite). No npm publish. If XC adds the 429 handling and re-stamps, CC re-verifies with the literal command.

---
*Verifier: CC · 2026-09-10 · fresh-name repro + duplicate-name crash both reproducible above.*
