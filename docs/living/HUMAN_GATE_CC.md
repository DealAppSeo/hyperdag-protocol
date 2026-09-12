# HUMAN_GATE — Sean must click /create + a second PAI before inviting a stranger (CC1, 2026-09-12)

Automated checks (CC1 Playwright walk + WALK_MAIN) already PASS on `www.trustshell.dev/create`. This is the **human gate** — the things only Sean clicking with his own eyes can sign off, plus the one judgment call a bot can't make (GO / no-go for outside invite). Tick each on the LIVE site.

## Click-through checklist (do in order, on www.trustshell.dev/create)
Legend: **🤖 = CC1 already machine-verified** (Playwright/curl; you're just re-confirming) · **👤 = ONLY Sean can tick** (needs a human hand/eyes/judgment; a bot cannot).
1. 🤖 **First PAI** — type a name → **Create**. Confirm you SEE: an `agentId`, an `apiKey`, and the **"Shown once — copy the apiKey now, not stored server-side"** warning. Copy the key. *(bot confirmed the elements render; 👤 the actual copy-to-clipboard-and-keep is your hand)*
2. 🤖 **HAL is real** — **"…Paris." → PASS** and a Rome/Eiffel false claim **→ VETO**. If you don't see a VETO, STOP. *(bot verified PASS/VETO fire)*
3. 🤖 **Empty name** — blank submit → **refuses** ("Please fill out this field"), no crash. *(bot verified)*
4. 🤖 **Duplicate name** — same name again → **friendly**, never a stack trace (engine returns 429; page must not show it raw). *(bot verified page didn't crash)*
5. 👤 **Key is one-time** — you **kept** the copied `apiKey`, then reload and confirm it is **not shown again** — and that you can still use it. *(only Sean: a bot can't prove a human retained a secret it can recover)*
6. 👤 **Second PAI on your machine** — run the "Create a second PAI" path in **your** environment; confirm **#1 untouched**, #2 has its own store. *(bot ran it in a throwaway sandbox; only Sean confirms it on the real operator machine + that two PAIs coexist as he'd actually use them)*
7. 👤 **No overclaim on screen** — read the whole flow with a skeptic's eye: nothing promises `guardedX402Payment`/`ingest` as working today (git-only/1.4.0 per PEER_REVIEW.md). *(bot checks strings; 👤 the judgment "does the framing mislead a stranger" is human)*

## The judgment call (only Sean)
- Does the first-run feel trustworthy enough to hand a stranger? (VETO lands, key-once is clear, no dead-ends.)
- Version honesty holds: site badge = **"npm latest v1.3.0"** = what `npm i` gives (SITE_STRINGS_TO_CHANGE.md). No new lie.
- **GO / no-go** for external invite. This gate is not automatable — it's your call.

## What's already automated (so the human gate stays short)
CC1 verified via headless browser (see WALK_MAIN.md / earlier peer-verify): empty-name refuse, name-submit → Paris PASS + Rome VETO + key-once shown, no page errors. Sean's click confirms the *feel* and makes the launch decision the bot can't.

---
*CC1 · 2026-09-12 · peer-review-pack · human gate checklist. No publish. Off ingest.ts / TODAY.md / #24.*
