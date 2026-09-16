# BUS — launch prep after #754 + #161
Updated 2026-09-15 18:22 PDT.

## Closed (code on main)
Engine #754 merged `987c8c17` (harness E1/E2/E7–E9, settle fixtures, unique SQL written). TrustShell #161 merged `912360fc` (T4–T6, A7, evaluate alias, JWT refuse, packed e2e). MERGE_POLICY live.

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
| L2 | XC1 **claimed** | Write `docs/living/VISITOR_E2E.md` — incognito script: trustshell.dev → copy install → CLI verify/getRepID/proof --verify → MCP present_proof. Sean runs it; you write the checklist. | File on branch `feat/xc1-2026-09-15-l2-l9` |
| L3 | XC2 | Honest STATUS block on trustshell README + site: npm 1.3.0 until F-PUBLISH; after publish 1.4.0; quorum 2 answering / 8 configured; Sepolia not mainnet; grounding shadow; no MVP-launched. | PR green, merge under policy |
| L4 | XC2 | Issue templates on trustshell: `bug-stranger-install.yml`, `break-the-gate.yml`. | Templates in `.github/ISSUE_TEMPLATE` |
| L5 | XC2 | `SECURITY.md` on trustshell if missing — one contact, no extra product claims. | File on main |
| L6 | XC2 | Site footer shows live engine `/health` `deployed_commit` (today `987c8c17`). Fail-closed if fetch fails. | Visible on trustshell.dev preview |
| L7 | XC1 **claimed** | Draft pinned thread text in `docs/living/COMMONS_PIN.md` for trust-commons: "Attack the scoring assumptions." Code stays in trustshell/engine. | File on branch `feat/xc1-2026-09-15-l2-l9` |
| L8 | XC1 **claimed** | `AUTHORS.md` on hyperdag-protocol: created/maintained by Sean Goodwin; GitHub faces = commit counter not credit. Optional `.mailmap` note. | File on branch `feat/xc1-2026-09-15-l2-l9` |
| L9 | XC1 **claimed** | Ecosystem table in hyperdag-protocol README + same table snippet in `docs/living/ECOSYSTEM.md`. Include trust-commons as debate commons, not a download. | File on branch `feat/xc1-2026-09-15-l2-l9` |
| L10 | XC2 | Draft GitHub Release notes for `v1.4.0` in `docs/handoff/RELEASE_1_4_0.md` from CHANGELOG. Do not `gh release create`. | Draft only |

## Locks
XC1 = hyperdag-protocol living docs + AUTHORS + commons pin. No trustshell package.json.
XC2 = example-agent + trustshell STATUS/templates/SECURITY/footer/release draft. No engine scoring.
CC = same standing order; pick an unclaimed L-id.
Do not open a new product surface. Do not say MVP launched.
