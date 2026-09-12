# INGEST — external-content quarantine boundary (CC1, 2026-09-12)

**`ingest` ≠ `verifyOutput`.** `verifyOutput` (HAL) asks *"is this claim true?"* about text the agent is about to **emit**. `ingest` asks *"is this fetched content safe to act on?"* about untrusted text the agent is about to **consume** (a web page, a doc, a message, a tool result). Different direction, different threat: `verifyOutput` guards truth on the way out; `ingest` guards against **prompt injection / instruction-smuggling** on the way in.

## The boundary (why PAI1 never sees raw fetched content)
- **PAI2 (a specialist) may fetch.** It has the fetch/browse capability and pulls the raw external content.
- **PAI2 runs `ingest()` on that content and quarantines the raw bytes.** The raw text never crosses to PAI1.
- **PAI1 (chief of staff) only ever receives the verdict object** — never the raw page:
  ```json
  { "ingest": "clean" | "flag" | "veto", "excerpt": "<short, sanitized>", "proposedAction": "<what PAI2 suggests>" }
  ```
- PAI1 decides using the verdict + a short sanitized excerpt + a proposed action. It cannot be steered by instructions hidden in the source, because it never reads the source. This is the whole point: **the untrusted text is contained at PAI2; only a structured, non-executable summary escapes.**

## Verdicts
| verdict | meaning | what PAI1 gets |
|---|---|---|
| **clean** | no injection / manipulation detected; content is ordinary data | excerpt = benign summary; `proposedAction` may proceed |
| **veto** | injection / instruction-smuggling / manipulation detected — **fail-closed** | excerpt = neutralized description of *why* (never the payload verbatim); `proposedAction` = quarantine/ignore |
| **flag** | borderline / uncertain — surfaced for human review | **only emitted when flag is enabled (see below)** |

## `flag` default = OFF
By default the gate is **binary: `clean` or `veto`**. The `flag` middle-tier is **off unless explicitly enabled**. Rationale: an always-on `flag` becomes a habituated "click-through" that quietly re-admits the exact content the boundary exists to stop. With flag OFF, uncertainty resolves **fail-closed to `veto`** (never silently to `clean`). Turning flag ON opts into a middle tier that routes borderline content to human review instead of auto-veto — a deliberate choice, logged, not the default.

## `excerpt` + `proposedAction` rules
- **excerpt** is sanitized: it may quote *data* but must strip/neutralize anything imperative aimed at the reader (no "ignore previous", no tool directives, no role reassignments passed through). On `veto`, the excerpt describes the *reason*, it does not reproduce the payload as a live instruction.
- **proposedAction** is a suggestion PAI2 makes; PAI1 is the decider. A `veto` proposedAction is never "proceed".

## Eval (acceptance criteria — this is the test)
| input content | expected `ingest` |
|---|---|
| Contains "Rome" **and** "ignore previous …" (instruction-smuggling) | **veto** |
| "Paris-only" — a plain factual mention of Paris, no imperative to the reader | **clean** |
Notes: the trigger is the **injection attempt** ("ignore previous"), not the topic. "Rome" alone is just data (→ clean); "Rome + ignore previous" is an attempt to hijack the consumer (→ veto). A Paris-only benign string carries no imperative → clean. (This mirrors HAL's fail-closed posture: not-safe-to-consume is refused, not waved through.)

## Reconciliation with CREATE_VETO_LIVE (peer-check — NO contradiction)
XC's `CREATE_VETO_LIVE.md` documents the **emit-side HAL path**: `/api/v1/hal/evaluate` → `{ decision: "vetoed", hal_score }`, and the page parser maps `decision:"vetoed"` → `VETO`. That is the **decision** axis — *"is this claim true?"*. `ingest` is a **separate, independent axis** — *"is this incoming content safe to consume?"*. They share the words `clean`/`veto` but never collide:
- `decision.vetoed` (HAL) = a claim the agent was about to **emit** is false.
- `ingest.veto` (this doc) = content the agent was about to **consume** carries an injection/manipulation.
- They **compose, they don't override**: a page can be `ingest:clean` (no injection) yet contain a claim HAL would later `decision:vetoed`; or `ingest:veto` (injection) regardless of any claim's truth. Neither gate's verdict is the other's input.
- **Implementer note:** keep the field named `ingest` (never reuse `decision`/`hal_decision`) so the two are not conflated in code or logs. No contradiction found.

## Cheap `ingest()` function (spec — no HAL quorum, no Pinchtab)
```
ingest(excerpt: string) -> { ingest: 'clean'|'flag'|'veto', excerpt: string, proposedAction: string }
```
- **Input:** an `excerpt` of the fetched content, **≤ 2000 chars** (PAI2 truncates before calling; the raw page never travels).
- **Output:** the exact `{ ingest, excerpt, proposedAction }` PAI1 receives (§ contract above).
- **Cheap by design:** local, deterministic checks (the features below) — **no HAL quorum call, no LLM, no network.** Fast enough to run on every fetch.
- **`flag` default OFF** → returns only `clean` or `veto`. **Uncertainty → `veto`** (fail-closed), never `clean`.
- **No Pinchtab, no logged-in Chrome** — operates on the passed excerpt string only.

## Features (LASSO-style — 5 only; ANFIS routes tier LATER, do NOT implement ANFIS now)
Cheap signals the classifier weighs (linear/LASSO-style selection, not a model):
1. **`url ≠ title` mismatch** — the fetched URL's host/path disagrees with the page's claimed title (spoof/redirect smell).
2. **hidden-text ratio** — proportion of hidden/off-screen/zero-opacity text to visible (classic injection carrier).
3. **first-seen host** — is this the first time this host is ingested (no history = higher suspicion).
4. **agent RepID tier** — the fetching agent's tier (lower tier = tighter gate).
5. **origin** — the turn origin (`Cli`/`Site`/`Mcp`/`Market`/`Unknown`) that requested the fetch.
ANFIS routing on tier is a **later** phase — this list is the feature set only; do not build ANFIS here.

## ingest → receipt (slice 5, not blocked — brief pointer)
An `ingest` verdict can ride the existing `schemas/receipt.schema.json` (CC1, merged #129) as an additive block, e.g. `"ingest": { "verdict": "clean|flag|veto", "host": "...", "features": {...} }`, alongside `hal`/`repid`/`cap`. It does **not** replace `hal` (decision axis) — it's a parallel field. Full mapping only if an implementer needs it (INGEST_RECEIPT.md); not blocked, so not expanded here.

## Scope / non-goals (constraints honored)
Design doc only — **no Pinchtab, no logged-in Chrome, no `src/lib/trustshell.ts`, no `/create` PR, no T12, no publish.** `ingest` is a distinct gate from `verifyOutput`; this specifies the contract + eval so an implementer (not CC1's lane) can build it behind the PAI2→PAI1 boundary. No code shipped here.

---
*CC1 · 2026-09-12 · docs lane · INGEST.md owned by CC1. ingest = consume-side injection quarantine; verifyOutput = emit-side truth check.*
