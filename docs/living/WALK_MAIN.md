# WALK_MAIN — main-branch walk of init-pai + guardedX402Payment (CC, 2026-09-11) [V]

Ran against `trustshell` **main HEAD `0ac6e95`** (post-merge: #127/#129/#7/#11/#8/#9 + CC2's #132/#134/#135) in an isolated worktree, `npm ci`. TrustShell tests only; no `src` edits; probe scripts not committed.

## Task 1 — build + onboarding (exact commands)
```bash
npm run sdk:build
node scripts/init-pai.mjs --name cc1-walk-1 --answers "research|hours|grok"   # run 1
node scripts/init-pai.mjs --name cc1-walk-1 --answers "research|hours|grok"   # run 2, SAME name
```
| step | exit | output |
|---|---|---|
| `npm run sdk:build` | **0** | `sdk:clean` + `tsc --project tsconfig.sdk.json` clean (`@hyperdag/trustshell@1.4.0`) |
| run 1 (`cc1-walk-1`) | **0** | `verify Paris: PASS` · `verify Rome: VETO` ("Harness blocked a false claim before you saw it") · `RepID 200 PROBATIONARY` · wrote `.trustshell/credentials.json` + `profile.json` (gitignored) |
| run 2, **same name** (`cc1-walk-1`) | **0** | identical clean output — **no stack trace**, no crash (the 429/duplicate path is handled; onboarding is idempotent for the same name) |

*(Re-run 2026-09-12 with the exact name `cc1-walk-1` per CC1 task — same result as the earlier `cc1-walk-30958` walk. Both build + both runs exit 0.)*

Result: **PASS** — build green, onboarding exits 0 twice, second same-name run does not stack-trace.

## Task 2 — guardedX402Payment fail-closed gates
Called the built `guardedX402Payment` (`dist/lib/index.js`) with a dummy key/`to` (the gate throws before signing). Policy `{allow:true}` in both, so case B's refusal is the *cap*, not the policy.
| case | params | result |
|---|---|---|
| **A — origin Unknown** | `{origin:'Unknown', policy:{allow:true}, amount:5, cap:1000}` | **REFUSED ✓** — `origin_refused: turn origin Unknown may not pay (fail-closed)` |
| **B — origin Site, amount>cap** | `{origin:'Site', policy:{allow:true}, amount:1000, cap:500}` | **REFUSED ✓** — `cap_exceeded: amount 1000 > cap 500` |

Result: **2/2 refused correctly.** Origin gate (SLICE 1) fires first; cap holds under a pay-capable origin. Reproduce:
```js
import { guardedX402Payment } from './dist/lib/index.js';
const to='0x'+'0'.repeat(40), pk='0x'+'0'.repeat(64), base={agentId:'x',to,privateKey:pk,policy:{allow:true}};
await guardedX402Payment({...base, origin:'Unknown', amount:5, cap:1000});      // throws origin_refused
await guardedX402Payment({...base, origin:'Site',    amount:1000, cap:500});    // throws cap_exceeded
```

## Verdict
Main is walk-clean: onboarding is idempotent + honest (HAL VETO fires), and the fail-closed spend path refuses both an unstamped origin and an over-cap spend. No publish, no on-chain, no src edits.

---
*Verifier: CC · 2026-09-11 · main `0ac6e95` · commands + outputs reproducible above.*
