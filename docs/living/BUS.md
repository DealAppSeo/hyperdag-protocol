# BUS — launch prep after #754 + #161
Updated 2026-09-16 (XC1 L2–L9 close-out).

## Closed (code on main)
Engine #754 merged `987c8c17` (harness E1/E2/E7–E9, settle fixtures, unique SQL written). TrustShell #161 merged `912360fc` (T4–T6, A7, evaluate alias, JWT refuse, packed e2e). MERGE_POLICY live.
Protocol **#26** XC1 L2 `VISITOR_E2E.md` + L7 `COMMONS_PIN.md` + L8 `AUTHORS.md` + L9 `ECOSYSTEM.md` / README table (this PR).

## Sean-only (do not idle waiting — agents take L-ids)
F-DDL — apply `migrations/2026-09-15_kind_custody.sql` after reading unique is `evidence_id` only.
F-PUBLISH — `npm publish` `@hyperdag/trustshell@1.4.0` after pack audit. GitHub Release same hour.
F-E2E-PUB — `e2e:mvp` vs `@latest` after publish.
F-SITE-PIN — site badge = published number. No "MVP launched."
F-PINS — profile pins: trustshell, repid-engine, hyperdag-protocol, trust-commons, proof-verifier, example-agent.
F-DISCUSSIONS — enable Discussions on trust-commons; pin the L7 thread.
F-FRIENDS — after visitor pass green.
F-EXPERTS — Marco / Vitto / Leonard after friends.
F-LIVE-SETTLE — one Sepolia `service_contracts` row `settled`, metadata `pre-mvp`.
F-GROUND-ENFORCE — only after a day of shadow logs.

## OPEN — agents start now. Empty mailbox = next L-id.

| ID | Lane | Work | Done-when |
|---|---|---|---|
| L1 | XC2 | Refresh `DealAppSeo/example-agent` onto TrustShell main API (1.4.0 unpublished). README: install → verify Paris/Rome → getRepID → presentProof. Depend on `github:DealAppSeo/trustshell` until F-PUBLISH, then flip to `@hyperdag/trustshell@1.4.0`. | Clone + those four commands work |
| L3 | XC2 | Honest STATUS block on trustshell README + site: npm 1.3.0 until F-PUBLISH; after publish 1.4.0; quorum 2 answering / 8 configured; Sepolia not mainnet; grounding shadow; no MVP-launched. | PR green, merge under policy |
| L4 | XC2 | Issue templates on trustshell: `bug-stranger-install.yml`, `break-the-gate.yml`. | Templates in `.github/ISSUE_TEMPLATE` |
| L5 | XC2 | `SECURITY.md` on trustshell if missing — one contact, no extra product claims. | File on main |
| L6 | XC2 | Site footer shows live engine `/health` `deployed_commit` (today `987c8c17`). Fail-closed if fetch fails. | Visible on trustshell.dev preview |
| L10 | XC2 | Draft GitHub Release notes for `v1.4.0` in `docs/handoff/RELEASE_1_4_0.md` from CHANGELOG. Do not `gh release create`. | Draft only |

## Locks
XC1 = hyperdag-protocol living docs + AUTHORS + commons pin. **L2/L7/L8/L9 done this PR — lock empty.** No trustshell package.json. Do not start XC2 L-ids from this lock.
XC2 = example-agent + trustshell STATUS/templates/SECURITY/footer/release draft. No engine scoring.
CC = same standing order; pick an unclaimed L-id.
Do not open a new product surface. Do not say MVP launched.
