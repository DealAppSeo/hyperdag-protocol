# CLAIM_PATH — why 12 advancing loops claimed 0 tasks in 8–83 days
**Diagnosed** 2026-09-10 (CC, standing order Loop 1). Live evidence against Trinity prod `qnnpjhlxljtqyigedwkb`.
**Verdict:** the claim-path CODE is healthy. The queue is **mis-targeted** — every pending row is `assigned_to` an agent that is not in the running fleet. Loops idle *correctly*.

## The paradox
`v_agent_liveness`: 12/12 loops advancing (loop_count ~4100, iterated mins ago). Yet `trinity_tasks`: last claim 2026-09-02, **0 claims in 7d**, 5 `pending`. Queue not empty. So why no claim?

## Falsification, in order
| H | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| **H1** | runLoop increments health without calling `claim()` | ❌ **refuted** | `runLoop` (ConstitutionalAgentV4.js:964) calls `getNextTask()` every iteration; idle branch only runs when it returns null. |
| **H2** | purpose/capability gate rejects the 5 as junk | ⚠️ **secondary/latent** | `checkCapability` (:1121) `knownTypes` = research/code/docs/artifact/review/meta/critique/peer_verify — the 5 types (remediation/e2e_loop/a2a_work/verification/tuning) are NOT listed, AND the getNextTask `CAPABILITY_FILTER` allow-list `AGENT_TASK_TYPES` default excludes them too. **But this only bites if the tasks were candidates at all — they are not (see root cause). Latent second wall.** |
| **H3** | claim UPDATE fails silently | ❌ **refuted** | `getNextTask` (:1868) is `UPDATE…WHERE id=(SELECT…LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING`; errors are logged + return null. `claim_count = 0` on all 5 → never even attempted, not a swallowed failure. |
| **H4** | last-claim window reads the wrong table | ❌ **refuted** | `trinity_tasks.claimed_by` is the real claim surface; `v_agent_liveness` reads it correctly. No shadow claim table. |
| **H5** | FIND_TASK takes a LIMIT 1 unclaimable row and idles | ✅ **root cause (variant)** | The single-row claim SELECT finds **no row matching the fleet's candidate predicate**, returns null, agent idles. NOT because of the durable `claim_count >= MAX_CLAIM_RETRIES(3)` cap (claim_count=0), but because **every pending row is `assigned_to` a non-running agent.** |

## Root cause (named)
The claim candidate predicate (ConstitutionalAgentV4.js:1874):
```sql
WHERE (assigned_to = $1 OR (assigned_to IS NULL AND (agent_assigned = $1 OR agent_assigned IS NULL)))
```
All 5 pending rows have `assigned_to` set to agents **not in the running 12**:

| id | task_type | assigned_to | claim_count |
|---|---|---|---|
| 435104 | remediation | `trinity-gemini-antigravity` | 0 |
| 435111 | e2e_loop | `trinity-grok-code` | 0 |
| 435096 | a2a_work | `trinity-gemini-antigravity` | 0 |
| 435097 | verification | `trinity-grok-code` | 0 |
| 435099 | tuning | `trinity-cowork-executor` | 0 |

Running fleet = apm, chesed, gcm, hdm, mel, nexus, orch, shofet, sophia, torch, veritas, w3c. For any of them as `$1`, a row with a non-NULL `assigned_to` that isn't their own name matches **neither** predicate branch → excluded. So the open pool is **empty for the running fleet**; the work is directed at external CLI agents (Gemini Antigravity, Grok Code, Cowork) that aren't running. `insert_source='cowork-cl-session'` corroborates: a Cowork CLI session created and hand-assigned them.

**This is a routing/targeting mismatch, not a claim-path bug.** No code fix is warranted; the two conflict markers currently sitting unresolved in the on-disk `ConstitutionalAgentV4.js` (REAPER select + getNextTask cap) are a separate dirty-checkout hazard, not the cause here.

## Smallest reversible fix + the 30-min proof
Dispatched ONE benign open-pool probe (the `/dispatch` pattern, rule 17), claimable by the fleet regardless of `CAPABILITY_FILTER` (type `meta` is in both allow-lists):
- **task 435116** · `meta` · priority 95 · `assigned_to=NULL, agent_assigned=NULL` · no external side effects · safe to cancel.
- **Success = a running agent's name appears in `claimed_by` on 435116 within 30 min.**
- ✅ **PROVEN [V 2026-09-10 18:35 UTC].** `trinity-gcm` claimed 435116 at 18:35:29 — **11 seconds** after insert — and drove it to `status=done` (`result`: "Probe complete. Artifact saved. Liveness: CONFIRMED — one claim received"). **The claim path is healthy end-to-end.** The stall was entirely the mis-targeted queue; the instant a fleet-claimable row existed, it was claimed and completed.

No cleanup needed — the probe self-completed. Reversible if ever wanted: `UPDATE trinity_tasks SET status='cancelled' WHERE id=435116;`.

## The 5 real tasks — NOT touched (Sean decision)
I did **not** null their `assigned_to`. "PURGE proof counts from public surfaces" and "produce the A2A dataset" are specialized and were deliberately assigned to the CLI agents. Handing them to an autonomous trinity worker risks unintended public-surface edits (forbidden). **Options for Sean:** (a) run the assigned CLI agents (Gemini Antigravity / Grok Code / Cowork); or (b) explicitly release specific rows to the fleet with `assigned_to=NULL` after confirming a trinity worker should own them.

## Re-arm note (deferred until probe proves the path)
Only after 435116 is claimed will I re-arm a SMALL evergreen set behind a churn filter (drop `EVERGREEN_AUDIT`/`diag_probe`/`SHADOW_REJECT`) — per TODAY.md Loop 4 §5. Not before: arming evergreens before the path is proven would just re-flood a queue whose real problem was targeting.
