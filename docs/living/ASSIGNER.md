# ASSIGNER — who assigns trinity_tasks to dead agent names
**2026-09-10 (CC, Loop A).** Verdict: **the "hose" is a human Cowork CLI session, not a code producer, and it already stopped.** No cron/ORCH-default/Linear-sync emits dead names.

## Finding (live-verified)
Every task ever assigned to a non-fleet name came from one `insert_source`:

| insert_source | dead-name tasks | newest |
|---|---|---|
| `cowork-cl-session` | 17 total (11 cowork-executor, 3 gemini-antigravity, 3 grok-code) | **2026-09-02 08:27 UTC** |

- **Last 10 days, dead-assigned tasks by source:** only `cowork-cl-session` (1, on 09-02). **Every other source assigns NULL** — `system` (3), `claude-loop` (2), and all `cc-*` (28). [V `trinity_tasks` GROUP BY insert_source, 2026-09-10]
- **Zero dead-name tasks created since 2026-09-02** — 8 days silent. **There is no active hose right now.**
- **No code producer.** Grep for `trinity-cowork-executor|trinity-gemini-antigravity|trinity-grok-code|cowork-cl-session` across `C:\Users\Cash4\repos` → **no hits in any repo** (only in these living-docs). So it is not a cron, not `trinity-task-bridge`, not an ORCH default, not a Linear sync.

## What it actually is
`cowork-cl-session` = an **interactive Cowork CLI session** (the claude-mem/Cowork tool a human drives). On 2026-08-30→09-02 that session hand-created tasks and set `assigned_to` to the **external CLI-executor agents** it intended to run them — `trinity-cowork-executor`, `trinity-gemini-antigravity`, `trinity-grok-code` — none of which is in the running trinity fleet (`v_agent_liveness`). So the trinity fleet can't claim them (the claim predicate excludes non-NULL assigned_to that isn't the agent's own name — see `CLAIM_PATH.md`).

## Correction to earlier note
My L4 line "new ones still accruing to dead names" was **wrong** — it misread open-task *status churn* (done→pending re-counts) as new creations. **Live truth: nothing new since 09-02.** [truth-over-flattery, r2]

## Fix — "stop the hose" (there's no running hose; it's operator hygiene)
- **No code change applies** — there is no code emitter to patch. The fix belongs to whoever runs Cowork CLI sessions:
  - When a Cowork/CLI session inserts `trinity_tasks`, default `assigned_to = NULL` (open pool) **or** a name in `v_agent_liveness`. Never the CLI-executor names, unless those executors are actually running.
  - If the Cowork CLI has a config/template with a default `assigned_to`, set it to NULL there.
- **Did NOT update the original rows** (Sean's rule). The 7 currently-open dead-name tasks stay as-is; Sean decides: run the CLI executors, or release specific rows with `assigned_to=NULL`.

## Watch
If dead-name tasks reappear with a *different* `insert_source` (a real cron/code emitter), that IS a code hose — re-run:
```sql
SELECT insert_source, count(*), max(created_at) FROM trinity_tasks
WHERE assigned_to IS NOT NULL AND assigned_to NOT IN (SELECT agent_name FROM v_agent_liveness)
  AND created_at > now()-interval '2 days' GROUP BY insert_source;
```
Empty = hose off. Non-empty from a non-`cowork-cl-session` source = find that code.

## Cowork CLI hygiene (Grok, 5 lines)
1. `assigned_to` must be **NULL** (open pool) or a name in `v_agent_liveness`.
2. Never `trinity-cowork-executor` / `trinity-gemini-antigravity` / `trinity-grok-code` unless that process is actually running.
3. `insert_source='cowork-cl-session'` is a human session, not a cron — default the template to NULL.
4. Original 5 dead-assigned rows: **do not UPDATE** here; Sean decides.
5. Watch-query above: empty for 2 days = hose still off.
