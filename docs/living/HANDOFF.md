# HANDOFF — XC wakeup 4 (2026-09-11)

STAMP: **#128 not-safe (Strix LOW hard-link + Greptile race) fixed this wakeup. Do not merge. Do not publish.**

Standing order: every wakeup, open PRs we own with Greptile/Strix “not safe to merge” first, then inbox. #128 429 first only if not done.

| PR | reviewers | this wakeup |
|---|---|---|
| #128 https://github.com/DealAppSeo/trustshell/pull/128 | Strix **1 LOW** on `b4ed1f9` (hard link follows despite symlink guard). Greptile **not safe** (credential-disclosure race) | **fixed** head `11e7efc`. Refuse `nlink > 1`; `O_EXCL` temp + `rename` new inode. Tests 10/10. `@strix-security` mentioned. Auto re-review on push is **off**. |
| #130 https://github.com/DealAppSeo/trustshell/pull/130 | Greptile **appears safe to merge**. Strix APPROVED on `3ae8f76` (“No security issues found”). check + verify-paris SUCCESS | **left**. Head still `3ae8f76`. Sean merges. |
| #129 / #127 | CC branches | **left to CC** — two-writer hazard |
| #126 | MERGED `1e23a98` | no rebase |

## #128 this wakeup
- Strix on `b4ed1f9`: LOW “Credential write follows pre-planted hard links despite symlink guard” at `lib/interview.js:93-101`.
- `writePrivate` now: refuse symlink dir/path; refuse `nlink > 1`; write unique `O_EXCL` temp then `rename` so a planted hard link cannot capture the API key.
- `node --test tests/interview.test.mjs` → 10/10 PASS (symlink file + hard link + symlink dir).

## next
- Wait Strix + Greptile + `check` on **#128** `11e7efc`. Mention already posted.
- #130 is green for Sean. Do not merge. No publish.
- Inbox remaining: value-events on register_ok/VETO (#127 helper). Envelope omit-score / TrustKeys #7 still later.

---
*Author: XC (Grok) · 2026-09-11 · loop wakeup 4 · #128 `11e7efc` · #130 `3ae8f76`*
