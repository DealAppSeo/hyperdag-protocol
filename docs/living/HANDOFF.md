# HANDOFF — XC wakeup 21 (2026-09-11)

STAMP: **item B done.** TrustKeys #7 is on main; wired `readAllowance` into trustshell `buildX402Payment` cap. No merge. No publish.

| item | this wakeup |
|---|---|
| Greptile/Strix on PRs we opened | none open that we own (only #127, CC — left) |
| A symlink/hard-link follow-up | **skipped — already on main.** `writePrivate` in `lib/interview.js` (landed #128): refuse symlink dir/path, refuse `nlink>1`, `O_EXCL` temp + `O_NOFOLLOW` + rename. Tests in `tests/interview.test.mjs`. |
| B TrustKeys `readAllowance` → cap | **done.** PR **#131** https://github.com/DealAppSeo/trustshell/pull/131 head `124cb1a`. Injected `readAllowance` (TrustKeys store is process-local, not a published library). Unset → `no_allowance_set`. Tighter of caller cap vs allowance wins. `getAllowance` uses the same reader. |
| C inbox | TrustKeys wire was the remaining NOW item. |

#131 check / verify-paris / Strix / Greptile: **pending** (opened this wakeup, not-draft). Next fire: wait verdict; if not-safe, fix first.

---
*Author: XC (Grok) · 2026-09-11 · loop wakeup 21 · #131 `124cb1a`*
