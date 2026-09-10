# T12_LOOP_PAYLOAD — what a long-chain task must carry
**Authored 2026-09-10 (CC, RALPH).** A template so a multi-step ("long-chain") T12 task is **self-contained and provable** — the missing structure behind stalled/undrained tasks. **This is a payload SPEC, not an insert. No task was created or modified.**

## Why
Today's waiting tasks carry a `title` + a prose `description` and nothing else (e.g. task 435123 below). A long chain then has no machine-checkable finish line, no declared state file, no sandbox, and no budget — so it either never gets claimed, spins without producing, or "completes" with an unverifiable `result`. Five required fields fix that.

## The five fields (every long-chain task carries these)
| field | what it is | why |
|---|---|---|
| **GOAL** | the ONE outcome, one sentence | a chain with two goals splits attention; one goal is checkable |
| **DONE-WHEN** | a provable finish (a query/file/tx that returns true), not "looks done" | "done means provable" — no NOT_CHECKED scored as pass |
| **STATE path** | where progress is written each step (a row/column or a `reports/<date>/<task>.md`) | a long chain must survive a restart; state in memory is lost on redeploy |
| **SANDBOX** | exactly what it may read/write/call, and what it may NOT | bounds blast radius; keeps free-tier-only; no surprise side effects |
| **budget** | hard caps: LLM calls, loop iterations, wall-clock, claim retries | a loop without a ceiling is the runaway that burned task 435029 (365 re-claims) |

## Filled example — from existing waiting NULL task 435123 (no insert)
**As it exists now (thin):**
> id 435123 · task_type `research` · priority 84 · assigned_to NULL · requires_external_artifact false
> title: "HAL-verify: Great Wall visible from Moon naked eye"
> description: "Verify via HAL: \"The Great Wall of China is visible from the Moon with the naked eye.\" (expect FALSE). Save verdict + evidence."

**With the payload it should carry:**
```yaml
GOAL:      Produce one HAL verdict (PASS/FLAG/VETO) on the claim
           "The Great Wall of China is visible from the Moon with the naked eye",
           with the per-provider evidence lines that produced it.
DONE-WHEN: trinity_tasks.result (this row) contains the verdict token AND >= 2
           provider evidence lines; status='done'; completed_at set.
           Provable: SELECT status, result FROM trinity_tasks WHERE id=435123;  -- verdict present, status=done
STATE:     final -> trinity_tasks.result (this row).
           steps -> trinity_agent_logs (event per HAL call).
           (long-chain variant: a STATE file reports/2026-09-10/task-435123.md updated each step,
            so a redeploy resumes instead of restarting.)
SANDBOX:   READ  the HAL verify endpoint (keyless).
           WRITE only this task's result + trinity_agent_logs.
           NO external side effects, NO writes outside result/artifact, NO public surface.
           LLM: FREE-TIER only (SEAN_PAID_LOOP unset).
budget:    <= 1 HAL verify call; <= 3 loop iterations; <= 5 min wall-clock;
           MAX_CLAIM_RETRIES 3 (then park, do not re-claim).
```

## How a LONG chain extends this (the point)
For a real long-chain task (e.g. the E2E-loop / A2A-dataset class), the same five fields scale:
- **GOAL** stays one sentence; sub-steps are *means*, not extra goals.
- **DONE-WHEN** becomes a checklist of provable sub-artifacts, each with its own query/file.
- **STATE path** becomes load-bearing: a `reports/<date>/<task>.md` (or a state row) updated after every step, so `HEARTBEAT_MODE=throttled` restarts resume — this is what the current in-memory loop lacks.
- **SANDBOX** widens deliberately and is written down (which repos/tables/endpoints), never inferred.
- **budget** bounds the whole chain (total LLM calls, max steps, wall-clock) so a spinning loop parks instead of running to the 1000-agent cap.

## Adoption (no insert here)
Author future T12 tasks with these five fields in the `description` (or a `metadata` JSON). Existing waiting tasks can be back-filled by whoever owns the queue — **not** in this doc, and **not** by inserting new tasks. This spec is the shape; applying it is a queue-owner decision.
