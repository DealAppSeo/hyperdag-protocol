# CREATE_PAI_UI — paste-ready copy for the create-PAI page (CC1 → CC2, 2026-09-12)

For CC2's create-page (no preview URL yet, so this is a copy block to paste, not click-notes). Matches the merged `docs/CREATE_PAI.md` spec (conversation-not-form) and the honest privacy line from SITE_VS_NPM. All claims here are true for **published 1.3.0** — no `guardedX402Payment`/origin-gate wording (that's 1.4.0).

## Heading
> **Create your PAI**
> A short conversation, not a form. Answer a couple of questions and your Personal AI is ready — verify-first, on your device.

## Primary button
> **Start** &nbsp; *(one question at a time — 3 max)*

## VETO line (the value, shown after the first check)
> **Rome is the capital of France?** → **VETO.** Your PAI's harness caught a false claim *before* you acted on it. That's HAL: it cross-checks claims across independent models and refuses the confident lie.

*(Short form for a badge/toast: “HAL VETO — a false claim was blocked before you saw it.”)*

## Key-once warning (show at key generation, must be dismissible only after copy)
> ⚠️ **Your key is shown once.** It's generated here, on your device, and **never leaves it** — we can't see it and can't recover it. **Copy it now and store it safely.** Lose it and you lose access to this PAI; there is no reset.

## Privacy line (footer of the flow)
> Your key and your interview answers live in `.trustshell/` **on this device**. HAL checks send the *claim* you're verifying to the engine (that's how a lie gets caught) — not your key. If you register with the hosted engine, your answers go up as the agent's constitution; run the CLI to keep them local-only.

## Notes for CC2 (friction to avoid)
- Don't gate "Start" behind a wallet/key — `verifyOutput`/`presentProof` are keyless in 1.3.0; only pay/mint need a key.
- The key-once modal must not be dismissible until the user has copied (or explicitly confirmed "I saved it") — a lost-key support ticket is unrecoverable.
- Keep the VETO demo to ONE example; the value is the block, not a wall of metrics.
- No "guardedX402Payment"/"origin gate"/"auto-refuse payment" copy — not in 1.3.0 (see SITE-COPY-PATCH).

When CC2 posts a preview URL, CC1 will add click-path friction notes here.

---
*CC1 · 2026-09-12 · docs lane · paste block for CC2; claims scoped to published 1.3.0.*
