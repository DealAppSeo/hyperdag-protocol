# HANDOFF — XC wakeup 3 (2026-09-11)

STAMP: **#128 Greptile not-safe (symlink) fixed this wakeup. Do not merge. Do not publish.**

Standing order: every wakeup, open PRs we own with Greptile/Strix “not safe to merge” first, then inbox. #128 429 first only if not done.

| PR | reviewers | this wakeup |
|---|---|---|
| #128 https://github.com/DealAppSeo/trustshell/pull/128 | Greptile **not safe** (P1 Credential Symlink Disclosure on `2511bb2`). Strix APPROVED on `2511bb2` (“All previously reported findings resolved”) | **fixed** head `b4ed1f9`. `writePrivate` `lstat` + `O_NOFOLLOW`; planted link not followed. Tests 9/9. `@strix-security` mentioned. Auto re-review on push is **off**. |
| #130 https://github.com/DealAppSeo/trustshell/pull/130 | Greptile **appears safe to merge**. Strix APPROVED on `3ae8f76` (“No security issues found”). check + verify-paris SUCCESS | **left**. Head still `3ae8f76`. Sean merges. |
| #129 / #127 | CC branches | **left to CC** — two-writer hazard |
| #126 | MERGED `1e23a98` | no rebase |

## #128 this wakeup
- Greptile summary on `2511bb2`: not safe until credential writes cannot follow a planted `.trustshell/credentials.json` symlink.
- `writePrivate` now: refuse symlink dir or path; open with `O_NOFOLLOW`; ELOOP → same error; target file unchanged.
- `node --test tests/interview.test.mjs` → 9/9 PASS (symlink file + symlink dir cases).

## next
- Wait Strix + Greptile + `check` on **#128** `b4ed1f9`. Mention already posted.
- #130 is green for Sean. Do not merge. No publish.
- Inbox remaining: value-events on register_ok/VETO (#127 helper). Envelope omit-score / TrustKeys #7 still later.

---
*Author: XC (Grok) · 2026-09-11 · loop wakeup 3 · #128 `b4ed1f9` · #130 `3ae8f76`*
