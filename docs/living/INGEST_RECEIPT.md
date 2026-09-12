# INGEST_RECEIPT — optional `ingest` field on receipt.schema.json (CC2, 2026-09-12)

**Optional and additive.** An action receipt (`trustshell/schemas/receipt.schema.json` — CC1 #129) MAY carry an `ingest` block recording the consume-side quarantine verdict for the fetched content that informed the action, alongside the existing `hal` / `repid` / `onchain` / `proof` / `cap` blocks.

**No schema change is required.** The schema already sets `"additionalProperties": true` (verified: schema L8, per XC), and `write-receipt.mjs` only walks the listed `properties` — so a receipt WITH an `ingest` block validates, and a receipt WITHOUT one validates exactly as today. `ingest` is never required.

## Shape (optional block)
```json
{
  "ingest": {
    "verdict": "clean" | "flag" | "veto",
    "host": "<host of the fetched source, not the payload>",
    "features": {
      "urlTitleMismatch": true,
      "hiddenTextRatio": 0.0,
      "firstSeenHost": true,
      "repidTier": "PROBATIONARY",
      "origin": "Cli" | "Site" | "Mcp" | "Market" | "Unknown"
    }
  }
}
```
- **`verdict`** — the closed-set ingest verdict (INGEST.md Invariant 2; an unrecognized value is read as `veto`).
- **`host`** — the origin host of the fetched source, for audit — **never** the raw payload.
- **`features`** — the five LASSO-style signals from INGEST.md §Features, for audit + a later ANFIS tier; all optional.
- **Never** put the raw payload or a live imperative in the receipt — same `excerpt` neutralization rule as INGEST.md (a receipt is data, not an instruction channel).

## Why parallel, not a replacement
`ingest` does **not** replace `hal`. `hal` is the **decision/emit** axis ("is the claim true?"); `ingest` is the **consume** axis ("was the fetched content safe?"). A receipt can carry both, independently — e.g. `ingest.clean` + `hal.decision:vetoed`, or `ingest.veto` regardless of any claim's truth. Keep the field named `ingest` (never reuse `decision`/`hal_decision`) so the two axes are not conflated in code or logs.

## Non-goals
- No schema edit needed today (additive under `additionalProperties: true`). If a future schema pins `properties`, add `ingest` as an **optional** property — never `required`.
- Docs only — no code, no `src/`, no Pinchtab, no publish, no T12. Implementer wires the block when `ingest()` (INGEST.md) is built behind the PAI2→PAI1 boundary.

---
*CC2 · 2026-09-12 · docs lane · companion to INGEST.md (§ingest → receipt) and INGEST_EVAL.md.*
