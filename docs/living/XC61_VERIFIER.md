# XC #61 verifier — 2026-09-13 [V]

Four phases. **No secret values in this file.** On-chain USDC transfer is SEAN-GATED (not done). Key rotation is SEAN-GATED.

## Phase 1 — secret-in-history: **ROTATION IS REAL**

Needles: live `enterprise_api_key` (36-char UUID from `repid_config` via service_role); local `*_PRIVATE_KEY` values that derive the two public addrs. Working trees (HEAD) of the 10 scanned repos: **clean** (0 hits). Git **history** is not.

| secret | maps to | git history | origin/main reachable? |
|---|---|---|---|
| `enterprise_api_key` (current live UUID) | n/a | **YES** — `repid-engine` `c9eb14b7…` + `af352e63…` (2026-05-13, `phase2_april_4.txt` / `phase4_may_10.txt` / `docs/patent/BASELINE_PRE_WAKEUP.json`) | **NO** (`git branch -r --contains` empty) — local objects only |
| `DEPLOYER_PRIVATE_KEY` | `0xf6ee1768868c3266868edca78bc41c50309cb22a` | **YES** — `repid-engine` 16 commits; cleanup `e1d37688` (#349 “82 one-off scripts… public repo”) | **YES** — parent `2ac5d965` still on origin/main; `GET raw.githubusercontent.com/…/2ac5d965…/railway_vars.txt` → **HTTP 200** |
| `NEXUS_PRIVATE_KEY` / `BASE_SEPOLIA_PRIVATE_KEY` (same material) | `0xdf6b8215d193b11b4903d223729c3cf7a6de271d` | **YES** — `trinity-ecosystem` 4 commits; `d77cc876` “stop committing one” | **YES** — parent `cfccb390` on origin/main; `GET …/cfccb390…/scripts/register-agents-erc8004.js` → **HTTP 200** |

Other scanned repos (trustshell, trinity-symphony-shared, hyperdag-platform, repid, trustmarket, trustrepid, hyperdag-protocol, trustkeys): **0** history hits for those needles.

**Verdict for #73/#79/#136:** not false alarms. **Rotate** the two Base Sepolia keys (public GitHub still serves historic blobs). Rotate `enterprise_api_key` as well (current value existed in local git objects even if not on origin/main). Sean-gated.

## Phase 2 — anon leak over HTTP: **empty**

Publishable anon JWT from `aitrinitysymphony-landing/index.html` (already public HTML) against `qnnpjhlxljtqyigedwkb.supabase.co`:
- `GET /rest/v1/repid_config?select=*` → **401** `{message:"Invalid API key"}` (99 bytes). No rows. Does not contain `enterprise_api_key`.
- OpenAPI `/rest/v1/` → **401**. 0 anon paths enumerable with this JWT.

That JWT is **dead** (rotated). Unauthenticated callers with the only published anon key get **no tables, no secrets**. CC1 already measured a *live* anon role as empty for `enterprise_api_key`. Combined: no HTTP leak of the enterprise secret or 64-hex keys via that publishable credential.

## Phase 3 — A2A-1 dataset
See `docs/living/A2A1_DATASET.md`. 5 rows, each refetch-verified. **No padding.** On-chain testnet-USDC transfer: **prepared-not-sent (Sean-gated)**.

## Phase 4 — reward clamp red-team (stretch)
`get_scaled_reward` exists only as a generated PostgREST type (`Args: never`). **No output-cap PR** to attack as a SQL function.

Live clamp is `clampEventDelta` in `repid-engine/src/services/wisdom-normalize.ts`: ±9990, NaN→0. Call site `agents-external.ts` score-event.

| attack | result |
|---|---|
| NaN / Inf raw | clamped to 0 — fail-closed |
| count-floor / unverified chatbot farm | earn-gate is **SHADOW** unless `REPID_RUN_EARN_GATE=true` — still inflates in prod default |
| one-shot fill | one event of +9990 moves 10→10000 — clamp width = full scale; does **not** rate-limit events |
| parallel race | two score-events both read `currentRepid` then add — clamp is per-event, not per-second |
| vesting bypass | `vestingActive && rawDelta>0` writes `vested` not `score` — still inflates vested to 500 |
| config injection | no `get_scaled_reward` cap PR; formula clamp is `WISDOM_FORMULA_MIN/MAX` in-process |

## SEAN
1. Rotate `DEPLOYER` (`0xf6ee…`) and `NEXUS`/`BASE_SEPOLIA` (`0xdf6b…`) — historic blobs still HTTP 200 on GitHub.
2. Rotate `enterprise_api_key` (current UUID was in local `repid-engine` git objects).
3. Do **not** send the A2A-1 on-chain USDC tx until you say so.
