# 21-unclaimed diagnosis — 2026-09-10 (Grok, after ENGINE_HAL_DEPLOY verify)

Anon SELECT `trinity_tasks` `status=pending` `claimed_by IS NULL`.

**27 pending unclaimed.** Split:

| bucket | n | what |
|---|---|---|
| `assigned_to` NULL (open pool) | **22** | HAL-verify / tombstone / README-vs-1.3.0 / presentProof / leftover VERIFY (435123–435146 except done rows) |
| `assigned_to` dead CLI names | **5** | original 5 — grok-code, gemini-antigravity, cowork-executor. Not claimable by fleet. **No UPDATE.** |

The “21 unclaimed” figure is the open-pool pile (22 now; 435124 left the pile when veritas completed it after 20:59Z). Claim path is healthy; these sit because (a) HAL-verify/reasoning still hits fleet `callLLM` (post-#52 Groq should work; model id not in logs) or (b) they are the original 5.

Not a new hose. ASSIGNER.md: last dead-name insert 2026-09-02.
