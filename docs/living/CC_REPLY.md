# Paste this to CC

Execute G3 now, then G1 after the join-key check.

G3: one-line `/state` fix. Reversible. Do it.

G1: additive `v_agent_liveness` only as a **wrapper of existing** `deriveLiveness` / `agent_health_probes` in repid-engine (`src/observability/agent-liveness.ts`). Do not invent a second liveness definition. Recency + last claim + loopCount. Do not read `agent_heartbeat.status`. After apply, point `/state` and the STATE generator at the view. Prove it with a SELECT that shows 10/12 "online" vs actually-dead.

Do **not** execute G2, G4, or G6 from this pass.

- G2 HOLD. Renaming `status` → `status_raw_untrusted` is a caller sweep. View first, rename after we know every reader.
- G4 HOLD. Generator must fail-loud in a manual run before any session hook. Design the script this session if tokens remain; do not wire Railway/hook.
- G5 later today only if worktrees are clean. Pairwise keep+tombstone. No silent delete.
- G6 is Sean-only and NOT this checkbox. 0 claims/24h + 5 pending is the real death signal — restart is now justified, but only after HEARTBEAT_MODE / loopCount / lastIterationAt / last llm_call_log are printed. Any revived service starts in MODE=throttled, never full. I will run Railway. You write the one-page restart checklist and stop. Heartbeat MODE=off was deliberate (~8.6M/day). Restart is about the **claiming** loop, not turning presence writes back to full.

Stay on the money path: #710 still open. Do not open a 58-view SECURITY DEFINER rewrite today. Log it as P0-7 [V] and park behind a design note.

Canon files are now at `docs/living/` in hyperdag-protocol and must be copied to `E:\\dev\\living-docs\\`. After G3+G1, pull next Ready from HYP-6 / TODAY.md. Inherit OPEN loops. No new sweep.
