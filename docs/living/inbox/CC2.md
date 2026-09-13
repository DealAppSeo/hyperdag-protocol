# CC2 inbox — relayed by CC1 from ai_dispatch #60 (2026-09-13)
*(CC2 doesn't read ai_dispatch; CC1 relays it here per dispatch #62 Phase 0. Source: dispatch #60, from=claude, to=cc2. Verbatim task queue below.)*

## CC2 work queue — 4 phases (~hours), loop then STOP
Verified facts from cowork-executor live SQL 2026-09-13 (do NOT re-derive; build on these):
- **#58 root cause CONFIRMED:** the deployed trustshell.dev Next.js bundle embeds a LEGACY anon Supabase key disabled 2026-08-04 → every browser call 401 → the live-stats widget is dead. Fix = replace the embedded key with the NEW publishable key, then redeploy. The exact change-set is in trinity-vault#1. CC1 handed this to Claude Design; **if Design has NOT shipped it, you own it.**
- `repid_leaderboard_public` is anon-readable (208 rows) once the key is correct.
- `marketplace_listings` = 0 and `marketplace_offers` = 0. `/marketplace/browse` is structurally empty: the 4 browse tables have RLS ON with 0 policies and no anon grant (triple-locked, not just "nobody posted").
- Supabase `qnnpjhlxljtqyigedwkb` runs on NEW keys; the legacy anon JWT is disabled project-wide (never re-enable it).

**PHASE 1 (P1) — Ship the #58 live-stats key-swap.**
- Build/wire: in the site repo, find the embedded Supabase anon key (the disabled legacy JWT) and replace it with the current publishable key (via Supabase `get_publishable_keys` or from Sean; do NOT paste secrets into git). Redeploy (Vercel).
- Test: after deploy, load the homepage/live-stats in Playwright; assert the stats request returns 200 (not 401) and renders a real number. curl the underlying REST call with the publishable key and confirm 200 + rows.
- DoD: live site shows working stats; Playwright + curl evidence in the PR. **Coordinate with CC1 Phase 1 so the number shown is the HONEST count (91), not 104.**

**PHASE 2 (P2) — Open the marketplace read-path (#127).**
- Build/wire: add anon read-only RLS policies (`SELECT USING(true)` or a scoped predicate) to the 4 marketplace browse tables so `/marketplace/browse` can render. Do NOT grant write to anon.
- Test: anon REST GET on each table returns rows; `/marketplace/browse` renders in Playwright.
- DoD: PR (branch, do not merge) + anon GET proof.

**PHASE 3 (P2) — Seed labelled demo listings.**
- Build: insert a handful of CLEARLY-LABELLED demo listings (name prefixed `[DEMO]`) so browse isn't empty. Never present them as real user data.
- Test: browse renders N demo listings; each links to a working detail view.
- DoD: PR + screenshot/Playwright of populated browse.

**PHASE 4 (stretch) — Create/CLI hardening.**
- Reproduce and fix-or-document the 429 dedup drift you flagged (per-IP 429 did NOT fire on identical back-to-back `/create` POSTs, contrary to CREATE_PAI_UI.md caveat (b)). Add an E2E assertion for the intended behavior.

**LOOP PROTOCOL:** work phases in order. After each, open a PR (never merge), post a one-line status to trinity-vault#1 and reply on dispatch #60. When all done, STOP your 30-min cron and post "CC2 queue empty — stopped, will resume on new dispatch." Do NOT idle-poll /create forever.
**SEAN-GATED:** the taken-PAI-name 409-vs-non-unique decision is Sean's — do NOT implement global uniqueness until he rules. No npm publish. No merges.
