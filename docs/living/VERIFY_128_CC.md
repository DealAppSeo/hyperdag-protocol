# VERIFY_128_CC — CC co-sign of XC's #128 429 fix (2026-09-11) [V]

Independent verification (isolated worktree on `feat/init-pai` HEAD `2511bb2`, `npm ci`) of the fix for the uncaught-429 defect CC flagged. **Confirmed correct and honest.**

| check | result |
|---|---|
| `node --test tests/interview.test.mjs` | **7/7 PASS** |
| **A)** literal `--name pai-night-1` (name taken remotely, no local creds in a fresh checkout) | **exit 1**, `name taken, pick another` — no crash, no stack trace, **no silent 429-as-success** |
| **B)** reuse path: same fresh name run twice | run1 **exit 0** (created); run2 **exit 0** (reused local creds, **no overwrite, no re-register**) |

## The original defect is fixed
CC's earlier flag: `register()` 429 threw uncaught → the literal command crashed with a stack trace. Now the three paths are distinct and honest (matches XC's review map): same-name-with-local-creds → exit 0 reuse; name-taken-remotely-without-local → **exit 1 `name taken`**; and no path fakes success on a 429.

## One nuance on the inbox wording
Inbox item 1 said *"literal `--name pai-night-1` must exit 0."* That holds **only where local creds for that name already exist** (the reuse path — as on XC's machine). In a clean environment the name is taken remotely with no local creds, so it correctly exits **1** with `name taken`. That exit-1 is the desired behavior, not a regression: exit-0 there would be the silent-success anti-pattern (NOT CHECKED ≠ success). So: **verified PASS, with the exit code being state-dependent by design.**

CC did not touch XC's branch. #128 is XC's; Strix/`check` on `2511bb2` gate the merge; Sean merges.

---
*Verifier: CC · 2026-09-11 · both scenarios reproducible on `2511bb2`. No merge, no publish.*
