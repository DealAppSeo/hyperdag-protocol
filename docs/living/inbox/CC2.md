# CC2 inbox — Grok/team refill 2026-09-13 16:20 PDT (new directive — kills idle-hold)

/loop 30m. Free only. Resume the cron. Queue is no longer empty.
Source: Sean asked Grok to refill from HYP-6 + living-ops after CC2 wakeup 101 idle-hold. Do only YOUR items. Draft PRs. Do not merge. Do not publish.

Path A E2E (#149 + #150) is MERGED. /create → 200. Do not re-do Path A.

## NOW (do in order)
1. ~~**P1 #58 live-stats key-swap**~~ **DONE — NOT REPRODUCIBLE (stale premise), CC2 wakeup 102 2026-09-13.** Measured live www.trustshell.dev (Playwright+curl): homepage `LiveTrustScores` widget uses NO Supabase/NO key — it fetches repid-engine `/api/v1/leaderboard/{models,agents}` client-side, all **200**, real numbers render (gpt-4o composite 0.8979; trinity-shofet RepID 2177). Homepage load = zero 4xx, zero Supabase calls, NOT stuck, NO error card, no "104", no 2026-08-30. The legacy-anon-JWT→401 root cause does not apply; NO frontend reads `repid_leaderboard_public`; `lib/supabase.ts` already prefers the PUBLISHABLE key. No key swap owed (key rotation is NOT MINE). Shipped durable guard: **DRAFT PR #152** `tests/e2e/home-stats-walk.mjs` (6/6 OK, `npm run verify` green 377). → Sean: if you still see a stuck widget, it's a stale DEPLOY (redeploy latest main), not a key.
2. **P2 90-day gate walk on PUBLISHED npm.** Clean temp dir. `npm i @hyperdag/trustshell@1.3.0` (not git 1.4.0 unpublished). Keyless `verifyOutput` + `getRepID` / `presentProof`. Write a receipt on this bus: PASS / FAIL per call, exact error, no Sean in the loop. Do **not** attempt mint (Bearer-gated 401 is known design). No public "MVP launched" language.
3. **P3 429-dedup E2E** for CREATE_PAI_UI.md caveat (b) drift: per-IP 429 did NOT fire on identical back-to-back `/create` POSTs. Assert intended behavior, or document live behavior if the caveat is wrong. Do **NOT** implement global PAI-name uniqueness (409 vs non-unique labels is Sean's call).
4. **P4 stretch — ingest quarantine harden.** Strix: keyword blocklist is bypassable; `flag` tier is a no-op. More fixtures in INGEST_EVAL. Fail-closed on paraphrases. Keep default-off, not exported from `src/lib/index`, not wired to `/create`.

## NOT YOURS
Marketplace prod RLS / `[DEMO]` seed / `/marketplace/browse` (TRUE_NORTH freeze: TrustMarket UI beyond stub; page is 404 on trustshell.dev; marketplaces are downstream). PAI name uniqueness. npm publish 1.4.0. Merge of #151 / #736 / #737. Key rotation.

## LOOP PROTOCOL
Work phases in order. After each: open a draft PR (never merge), stamp HANDOFF, one-line on trinity-vault#1 + this inbox. When NOW is empty, STOP the cron and post "CC2 queue empty — stopped, will resume on new dispatch." Do NOT idle-poll /create. Free tokens only. Stop on FREE_EXHAUSTED.

---
# PREVIOUS — relayed by CC1 from ai_dispatch #60 (2026-09-13)
*(CC2 diverted to Path A E2E #149+#150 and went idle-hold. Phase 1 live-stats was NOT shipped — re-queued above. Phases 2–3 marketplace are now NOT YOURS / product-lock.)*

Verified facts from cowork-executor live SQL 2026-09-13 (do NOT re-derive):
- **#58 root cause CONFIRMED:** deployed trustshell.dev Next.js bundle embeds a LEGACY anon Supabase key disabled 2026-08-04 → every browser call 401 → live-stats widget dead.
- `repid_leaderboard_public` is anon-readable (208 rows) once the key is correct.
- `marketplace_listings` = 0 and `marketplace_offers` = 0. `/marketplace/browse` on trustshell.dev is 404. Product lock: marketplaces downstream.
- Supabase `qnnpjhlxljtqyigedwkb` runs on NEW keys; the legacy anon JWT is disabled project-wide (never re-enable it).
