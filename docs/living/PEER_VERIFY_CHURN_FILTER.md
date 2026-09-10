# Peer-verify churn-filter — DESIGN (no drain)

Peer-verify volume from `EVERGREEN_AUDIT` / `diag_probe` / `SHADOW_REJECT` can occupy the open pool without moving product work. The claim path is healthy (435116 in 11s); the risk is **queue composition**, not the claim SQL.

**Filter at insert, not at delete.** Before enqueue, drop those three title/type prefixes. Optional env `PEER_VERIFY_ALLOW=product` would also omit them from `getNextTask` `HANDLED` (default off, so behavior unchanged until flipped). Existing peer_verify rows stay; **no drain, no DELETE, no UPDATE of the original 5.** Re-arm evergreens only after FREE_GATE_LIVE is VERIFIED (Groq gpt-oss-20b success) and HEARTBEAT_MODE stays throttled.
