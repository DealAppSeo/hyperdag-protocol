# XC inbox — overnight refill 2026-09-11 00:56 PDT

/loop 25m. Free only. Greptile/Strix “not safe to merge” on open PRs we own first, then this list. #128 429 first only if not done.

## NOW (do in order)
1. ~~trustshell #128 — catch register 429.~~ DONE. Live `--name pai-night-1` EXIT 0. Review follow-up `2511bb2` (owner-only creds, no silent 429 success, `--force` overwrite).
2. ~~init-pai stdout is the demo.~~ DONE wakeup 2: `Name pai-night-1`, Paris PASS, Rome VETO + harness line, RepID, 3 bullets.
3. ~~Append value-events on register_ok and VETO.~~ DONE wakeup 5: copied `scripts/value-events.mjs` from unmerged #127 (did not touch CC branch). `init-pai` logs `register_ok` + Rome `VETO` to `.trustshell/value-events.jsonl`. Head `c365e35` (logQuiet + no reuse inflate + 0700/0600).
4. ~~Keep #126 MERGEABLE.~~ DONE — **MERGED** `1e23a98`. Follow-up **#130** `3ae8f76`.
5. ~~lastAnchorTx NOT_ANCHORED — basescan hint.~~ DONE on #130 MESH_GAPS (ReputationRegistry `0x8004B663…8713`).
6. ~~If 1–5 green: omit-score / TrustKeys #7.~~ DONE wakeup 21: TrustKeys #7 **merged**. trustshell **#131** `124cb1a` wires injected `readAllowance` into `buildX402Payment` cap + `getAllowance`. Engine omit-score is not this repo.

## NOT YOURS
Site page (GA). TrustMarket seed of prod tables (Sean). #127 is a CC branch — do not race. #129 MERGED.

---
## RELAY FROM CC1 — ai_dispatch #61 (2026-09-13) — XC work queue
*(XC doesn't read ai_dispatch; CC1 relays per dispatch #62 Phase 0. Source: #61, from=claude, to=xc.)*
Verified DB facts (build on these): (a) `enterprise_api_key` is NOT anon-readable now (as role anon it returns empty; a real 36-char secret to a privileged role); (b) Base Sepolia identities owned by PUBLIC addresses `0xdf6b8215d193b11b4903d223729c3cf7a6de271d` and `0xf6ee1768868c3266868edca78bc41c50309cb22a` (public address ≠ leak); no PRIVATE key visible in DB; (c) the "60 DEFINER views leak to anon" finding is a FALSE POSITIVE (sole flagged col `orphan_owner_ids` = count(DISTINCT agent_id), not identifiers). What the DB side CANNOT check is whether a secret leaked into code/history — that's Phase 1.

- **PHASE 1 (P1) — Secret-in-history audit (decides #73/#79/#136: rotate vs close).** Across ALL repos (repid-engine, trustshell, trinity, hyperdag-platform, trinity-symphony-shared, repid, trustmarket, pai-harness) + local machine, grep full git history AND working trees for: (a) the 36-char enterprise_api_key value (read locally as service_role from repid_config where key='enterprise_api_key'; never commit it); (b) any private key/seed/mnemonic controlling the two addresses (64-hex 0x key, 12/24-word mnemonic, keystore json). Tools: `git log -p -S"<needle>" --all`, `git grep -I "<needle>" $(git rev-list --all)`, trufflehog/gitleaks if installed, filesystem grep of .env* + deploy configs. DoD: definitive YES/NO per secret with commit hashes/paths (or "clean, N commits scanned"). Found → rotation is REAL (escalate Sean); clean → #73/#79/#136 are false alarms, close.
- **PHASE 2 (P2) — Anon-leak HTTP proof (confirms #133/#138 false-alarm end-to-end).** With the publishable key only, hit anon REST `/rest/v1/<view>?select=*` for the 60 flagged views + collusion-oracle config/rule tables; capture what an unauthenticated caller actually gets. DoD: table view→rows→any-sensitive-value; flag any real identifier/secret (expect none).
- **PHASE 3 (P1, FLAGSHIP) — A2A-1 verifiable dataset (trinity_tasks #435096).** Dataset of AI/agent/web3 hackathons + grant programs, deadlines in next 12 months. Every row: name, organiser, deadline date, prize/grant amount, source URL. Verifiable: refetch each URL to HTTP 200 AND confirm the stated deadline appears on the page. No padding. Counterparties/pricing in #435096 (buyer trinity-shofet, provider trinity-apm; RFQ 250000-2000000 raw; receipt may claim WALLET-VERIFIED only). DoD: verified dataset committed + per-row verifier result (URL status, deadline-match). The single on-chain testnet-USDC transfer on Base Sepolia is SEAN-GATED — prepare the tx and STOP. Unblocks #435097 + #435099.
- **PHASE 4 (stretch) — Red-team the reward clamp.** Once a get_scaled_reward output-cap PR exists, try to make it still inflate (count-floor, race, config injection). Report attacks.

**LOOP PROTOCOL:** phases in order; after each, commit results (PR or dated doc on the bus) + reply on dispatch #61. When done, STOP your 25-min loop, post "XC queue empty — stopped." No idle-poll.
**SEAN-GATED:** the on-chain USDC transfer (Phase 3), any key rotation (Phase 1 if leak found), merges, npm publish. Prepare + stop for those.
