# HANDOFF — XC wakeup 2 (2026-09-11)

STAMP: **#128 429 still DONE. Greptile/Strix not-safe on XC PRs addressed this wakeup. Do not merge. Do not publish.**

Standing order: every wakeup, open PRs we own with Greptile/Strix “not safe to merge” first, then inbox. #128 429 first only if not done.

| PR | reviewers | this wakeup |
|---|---|---|
| #128 https://github.com/DealAppSeo/trustshell/pull/128 | Greptile **not safe** (5 findings) + Strix **1 LOW** CWE-732 | **fixed** head `2511bb2`. Tests 7/7. Live `--name pai-night-1` EXIT 0, `Name pai-night-1`, Paris PASS, Rome VETO, 3 bullets. `@strix-security` mentioned. |
| #130 https://github.com/DealAppSeo/trustshell/pull/130 | Greptile **not safe** (stale dist + live unit test). Strix APPROVED on `87e2794` | **fixed** head `3ae8f76`. dist ships `getAllowance` + `NOT_ANCHORED`. last-anchor/getAllowance tests offline. 12/12. MESH_GAPS basescan hint. `@strix-security` mentioned. |
| #129 | Greptile not-safe on `27b74e5`; CC comment 08:06Z says 3 P1s already addressed at `029518a` | **left to CC** — heads moved this wakeup, two-writer hazard |
| #127 | Greptile not-safe; Strix APPROVED | **left to CC** — same |
| #126 | MERGED `1e23a98` | no rebase |

## #128 review map
- Strix LOW world-readable key → `mkdirSync`/`writeFileSync`/`chmodSync` `0700`/`0600`
- Greptile P1 overwrite → `existingCreds`: same name resumes; other name needs `--force`
- Greptile P1 429-as-success → 429 without local is `busy` **exit 1**; 409 is `name_taken` exit 0; same-name local still EXIT 0 (no stack)
- Greptile P2 blank slots + substring `pay\|market` → positional empties kept; `\\b(pay\|market)\\b`

## next
- Wait Strix + `check` on **#128** `2511bb2` and **#130** `3ae8f76`. Auto re-review on push is **off**.
- Sean merges. Do not merge. No publish.
- Inbox remaining: value-events on register_ok/VETO (#127 helper). Envelope omit-score / TrustKeys #7 still later.

---
*Author: XC (Grok) · 2026-09-11 · loop wakeup 2 · #128 `2511bb2` · #130 `3ae8f76`*
