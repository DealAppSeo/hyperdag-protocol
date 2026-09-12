# HUMAN_GATE — Sean must click /create + a second PAI before inviting a stranger (CC1, 2026-09-12)

Automated checks (CC1 Playwright walk + WALK_MAIN) already PASS on `www.trustshell.dev/create`. This is the **human gate** — the things only Sean clicking with his own eyes can sign off, plus the one judgment call a bot can't make (GO / no-go for outside invite). Tick each on the LIVE site.

## Click-through checklist (do in order, on www.trustshell.dev/create)
1. **First PAI** — type a name → **Create**. Confirm you SEE: an `agentId`, an `apiKey`, and the **"Shown once — copy the apiKey now, not stored server-side"** warning. Copy the key.
2. **HAL is real** — the page shows **"The capital of France is Paris." → PASS** and a Rome/Eiffel false claim **→ VETO** ("harness blocked a false claim before you acted"). If you don't see a VETO, STOP.
3. **Empty name** — submit with the name blank → it **refuses** ("Please fill out this field"), no crash, no stack trace.
4. **Duplicate name** — run the same name again → **friendly** behavior (reuse or "name taken"), **never a stack trace / raw error** on the page.
5. **Key is one-time** — reload / re-open; confirm the `apiKey` is **not shown again** (you kept the copy).
6. **Second PAI** — use the "Create a second PAI" path (its own store, e.g. `TRUSTSHELL_HOME=.trustshell/<name>`). Confirm **PAI #1 is untouched** and #2 has its own credentials — #1 is chief-of-staff, #2 a specialist.
7. **No overclaim on screen** — nothing on the flow promises `guardedX402Payment` / `ingest` as working today (those are git-only / 1.4.0 per PEER_REVIEW.md; 1.3.0 is what installs).

## The judgment call (only Sean)
- Does the first-run feel trustworthy enough to hand a stranger? (VETO lands, key-once is clear, no dead-ends.)
- Version honesty holds: site badge = **"npm latest v1.3.0"** = what `npm i` gives (SITE_STRINGS_TO_CHANGE.md). No new lie.
- **GO / no-go** for external invite. This gate is not automatable — it's your call.

## What's already automated (so the human gate stays short)
CC1 verified via headless browser (see WALK_MAIN.md / earlier peer-verify): empty-name refuse, name-submit → Paris PASS + Rome VETO + key-once shown, no page errors. Sean's click confirms the *feel* and makes the launch decision the bot can't.

---
*CC1 · 2026-09-12 · peer-review-pack · human gate checklist. No publish. Off ingest.ts / TODAY.md / #24.*
