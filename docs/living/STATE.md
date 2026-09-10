# STATE.md

STATUS: GENERATED SNAPSHOT
LAST_VERIFIED: 2026-09-10T17:16Z
INSTRUMENTS: GET /api/v1/status · CC LIVE_VERIFICATION.md · npmjs · GitHub PRs
RULE: if LAST_VERIFIED older than 24h → treat every number below as STALE. Do not quote. Regen or query.
HAND EDITS: forbidden. Tombstone + regenerate.

## Query, do not copy

- claims/24h from `llm_call_log`, not heartbeat
- liveness from `last_ping` / `/health` `loopCount` `lastIterationAt` via `deriveLiveness`, never `agent_heartbeat.status`
- chain cadence from ERC-8004 writes + `/status` metrics_24h, not README
- npm version from the registry, not `package.json`
- open PRs from GitHub `is:open`, not SPRINT_BOARD

## Live numbers 2026-09-10

| Fact | Value | Tag |
|---|---|---|
| Engine supabase | true | [V] /status 17:16Z |
| 24h on-chain attestations | 1 | [V] /status |
| 24h real settlements | 1 | [V] /status |
| 24h score events | 3 | [V] /status |
| ERC-8004 writes lifetime | 103; last write ~12:00 UTC 2026-09-10 | [V] CC |
| ZKP proofs lifetime | 79,201; last write ~12:00 UTC 2026-09-10 | [V] CC |
| Heartbeat table last write | 2026-07-17 | [V] |
| `status='online'` | 10/12 | [V, UNTRUSTED COLUMN] |
| HEARTBEAT_MODE | historically `off` to kill ~8.6M/day churn | [V] agent-liveness.ts |
| Claims / 24h | 0 | [V] CC |
| Pending tasks | 5 | [V] CC |
| Peer-verify total / in_review | 140,187 / 62,841 | [V] CC |
| RLS tables | 646/646 | [V] CC |
| Real security gap | 58 SECURITY DEFINER views + 15 anon fns + 73 RLS-no-policy | [V] CC |
| Humans | 7 real, not 17 | [V] CC |
| npm `@hyperdag/trustshell` | 1.3.0 | [V] npm |
| git package.json | 1.4.0 unpublished | [V] |
| Open PRs | trustshell#121 HOLD; repid-engine#710 settle-path; PurposeHub#2 ignore | [V] GitHub |
| Linear real tickets | HYP-6 In Progress; HYP-5 Backlog | [V] |
| `/status` audit_status WARN | timestamp 2026-05-25 — field frozen, ignore | [V] |
| tasks_completed / failed_session | always NULL — dead columns | [V] CC |

## Known liars (do not use as oracles)

- `agent_heartbeat.status`
- `v_fleet_truth_realwork`
- README line "on-chain writes paused since 2026-06-22"
- SPRINT_BOARD "18 clean PRs" / "merge #364 / publish npm"
- INFRA_INVENTORY §10 dated 2026-06-12
- `evaluate()` advertised as if npm 1.3.0 serves it
