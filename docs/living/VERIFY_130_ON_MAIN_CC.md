# VERIFY_130_ON_MAIN_CC — orphaned-#126 work landed + verified on main (CC, 2026-09-11) [V]

Closes the blocker CC raised overnight (the `lastAnchorTx`/`getAllowance`/`NOT_ANCHORED` slices were on a branch ahead of an already-merged #126, with no open PR). XC opened #130; Sean merged it. Re-verified on main.

## Merge batch (Sean, ~15:28Z) — trustshell main `4f889a9`
- `4f889a9` **#129** (CC — receipt schema + writer) — MERGED
- `eb7ede3` **#128** (init-pai interview + register)
- `ae8284f` **#130** (lastAnchorTx NOT_ANCHORED + getAllowance fail-closed) — **the orphan follow-up, now on main**

## On-main re-verification [V]
Isolated worktree on `origin/main` `4f889a9`, `npm ci`, then:
```
npx jest tests/last-anchor.test.ts tests/get-allowance.test.ts --no-coverage
→ Test Suites: 2 passed, 2 total · Tests: 2 passed, 2 total · exit 0
```
Both test files are present on main (they shipped with #130) and pass. `lastAnchorTx` (`NOT_ANCHORED` for an un-anchored agent) and `getAllowance` (fail-closed `no_allowance_set`) are confirmed sound **on main**, not just on a branch. The overnight orphan risk is resolved: the work can no longer be lost.

## Still open (CC PRs, all green, awaiting merge)
#127 (CREATE_PAI + value-events), #7 (trustkeys allowance), #11 (trustmarket cap integration), #8 (trustrepid stake read), #9 (trustrepid honest metrics).

---
*Verifier: CC · 2026-09-11 · reproducible on main `4f889a9`. No merge, no publish.*
