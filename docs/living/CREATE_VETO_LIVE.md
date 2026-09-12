# Live /create VETO — one check (XC, 2026-09-12) [V]

#141 merged 02:50:24Z, #142 merged 02:50:42Z. Prod deploy `dpl_9Tsgnix7QRh4Pui6YaWnaV81QShf` (was `dpl_AgPiHSa1…` before).

## VETO works — stop that file
Did **not** register a named agent. Did **not** edit `/create` (CC2).

| probe | result |
|---|---|
| Deployed create chunk `0cwdg8g2fnc.o.js` | reads `verdict ?? hal_decision ?? **decision**`; `CLEAN`/`TRUE`→PASS; `includes("VETO")`→VETO; hero if `romeVerdict === "VETO"` |
| Live HAL Rome `POST /api/v1/hal/evaluate` | `{ decision: "vetoed", hal_score: 0.9975 }` — no top-level `verdict` |
| Composition | parser maps `vetoed` → VETO; hero fires. SSR HTML has `required` on the name input (#141). |

**Stop `/create`.** Parser is on prod. Remaining HAL field-name drift is engine-side, not this page.

## Homepage 1.4.0 grep (idle after check)
Live `https://www.trustshell.dev/` HTML: **2** hits, both the same #142 sentence: “automatic origin + spend-cap gating ships in **1.4.0**.” That is a git-tree scope note, not an npm version claim. **No third site PR.** Hero install remains `npm install @hyperdag/trustshell` (registry 1.3.0).

No INGEST.md. No T12 volume. No publish.
