# BUS — TrustShell pre-launch
Updated 2026-09-15 18:25 PDT. Claims stay. Code moves.

## Closed
#754 engine stack merged (`987c8c17`). #756 folded. #161 TrustShell stack merged (`912360fc`). F-STACK-GH. F-754-CLEAN.
Harness A1–A7 E1/E2 E7–E9. T4–T6. A7 filter. evaluate alias. JWT fail-closed. pack e2e local green.

## OPEN — agents first (MERGE_POLICY)

| ID | Lane | Work | Done-when |
|---|---|---|---|
| L1 | XC2 | Honest STATUS block on trustshell README + site: published version, 2 answering / 8 configured, Sepolia not mainnet, grounding shadow until flipped, no "MVP launched" | PR green, copy matches npm after publish |
| L2 | XC2 | Issue templates on trustshell: `bug-stranger-install`, `break-the-gate` | `.github/ISSUE_TEMPLATE/` exists |
| L3 | XC2 | SECURITY.md on trustshell if missing or empty — one contact email only | File present |
| L4 | XC2 | Site footer shows live `/health` `deployed_commit` (engine) so a visitor can see Railway hash | Footer renders a real hash or honest UNKNOWN |
| L5 | XC1 or XC2 | Refresh `DealAppSeo/example-agent` onto `@hyperdag/trustshell` current main API: install → verify Paris/Rome → getRepID → presentProof. Pin package to 1.4.0 **after** F-PUBLISH; until then depend on the GitHub main API without claiming npm 1.4.0 | README 60-second path runs; no unpublished version badge |
| L6 | XC2 | Draft GitHub Release notes for `v1.4.0` in `CHANGELOG.md` / `docs/RELEASE_1.4.0.md` — Sean publishes the tag | Notes = what shipped, not vision |
| L7 | XC2 | `trust-commons`: add Discussions copy + pinned-thread draft `docs/PINNED_BREAK_SCORING.md` ("Attack the scoring assumptions"). Do not invent product claims. | File on commons or protocol living-docs |
| L8 | XC1 | Confirm engine `/health` reports commit after Railway picks up `987c8c17`. If not deployed, note BLOCKED_FOR_SEAN Railway — do not restart prod | Hash recorded in living NEXT |

## OPEN — Sean only

| ID | Gate |
|---|---|
| F-DDL | Apply `migrations/2026-09-15_kind_custody.sql` after reading it |
| F-PUBLISH | `npm publish` `@hyperdag/trustshell@1.4.0` after audit + trusted publishing if available |
| F-RELEASE | GitHub Release `v1.4.0` same hour as npm |
| F-E2E-PUB | `e2e:mvp` against `@latest` after publish |
| F-SITE | Pin trustshell.dev + READMEs to published number |
| F-VISIT | Incognito/Brave visitor: site → copy install → clean machine CLI + MCP. Log breaks. Design only from that list |
| F-FRIENDS | Two friends, same visitor script, try to break |
| F-EXPERTS | Then Marco, Vitto, Leonard — send example-agent + commons thread + what is NOT true yet |
| F-LIVE-SETTLE | One Base Sepolia contract tagged `pre-mvp` reaches `settled` |
| F-GROUND-ENFORCE | After a day of shadow logs |

## Frozen
TrustMarket UI · mesh · PHI · Halo2 · mainnet writes · second MCP package · Discord · new landings · "MVP launched"

## Locks
XC1: repid-engine + health/settle. Never trustshell version bump.
XC2: trustshell + example-agent + commons draft + site STATUS. Never scoring formula.
Empty mailbox = next OPEN agent id, not stop.
