# CLAUDE.md

## This file did not exist until 2026-09-08, and that was the gap

An agent starting work in this repository had **no entry point at all** — no
`CLAUDE.md`, no `AGENTS.md`, no `LESSONS.md`, anywhere in the tree [MEASURED
2026-09-08: `find . -iname 'CLAUDE.md' -o -iname 'AGENTS.md' -o -iname 'LESSONS.md'`
returned nothing]. The four sibling repositories each carry one. This one did not,
so an agent landing here saw none of the operating rules, none of the hard stops,
and no indication that either existed elsewhere.

That is the worst version of the problem, because nothing announces it. A missing
file produces no warning, no failing check, and no 404 — only an agent proceeding
confidently with less context than it thinks it has.

## READ THIS FIRST, BEFORE ANY ASSIGNMENT IN THIS REPO

**True north for this system is `DealAppSeo/repid-engine/LESSONS.md`.** It holds the
operating rules every agent works under and is the one file injected verbatim into
every XC/GA dispatch. Read it before you plan anything here.

Per surface, read yours first:

| surface | read first |
|---|---|
| `repid-engine` | `LESSONS.md`, then `CLAUDE.md` |
| `trinity-ecosystem` | `CLAUDE.md`, then `docs/PRIOR-WORK-INDEX.md` |
| `trustshell` | `AGENTS.md` (`CLAUDE.md` is a one-line `@AGENTS.md` include) |
| `trinity-symphony-shared` | `CLAUDE.md` — lane rules; take a lane before touching a repo |
| **`hyperdag-protocol`** | **this file** |

## ⚠ THIS REPOSITORY IS PUBLIC

Apache 2.0, published as `@hyperdag/protocol` on npm. Every commit message, PR title,
PR body and comment is world-readable and permanent.

State FINDINGS, not inventories. *"A production key was committed and must be
rotated"* is actionable; the key, the project id, the row counts and the service names
are an incident. A published secret cannot be withdrawn, and a secret in git history
stays public after the file is deleted from `HEAD` — deletion is not rotation.

## HARD STOP — Marco De Rossi's files

Do not touch these without explicit permission from Sean:

    packages/contracts/ERC8004SPEC.md
    packages/contracts/contracts/
    packages/contracts/test/
    packages/contracts/abis/

**The paths matter, and they were recorded wrong.** `repid-engine/CLAUDE.md` listed
these as bare root-level names — `ERC8004SPEC.md`, `contracts/`, `test/`, `abis/` —
and **none of them exist at this repository's root** [MEASURED 2026-09-08]. All four
live under `packages/contracts/`. An agent that checked the documented path, found
nothing, and concluded the hard stop was stale would have been reading a real
prohibition as a dead one. Corrected in `repid-engine/CLAUDE.md` in the same change
that created this file.

## Sean's execution rules

- **RULE-1** Before any code/SQL/file change, show what exists first and ask
  "improve existing or build new?" Wait for the answer.
- **RULE-2** Never auto-execute unless Sean says GO.
- **RULE-3** Fix only the specific error named. Never refactor adjacent code.
- **RULE-4** Truth over flattery. "I don't know" beats a fabrication.
- **RULE-5** Never assume column names — read the schema or ask.
- **RULE-6** Shortest path to done. Verify → execute → next.

**Three outcomes, never two: VERIFIED / NOT CHECKED / FAILED.** Two outcomes collapse
"we did not look" into "it passed", which is the recurring defect across this whole
system — a skipped test scored as a pass, a credential check green with no credential,
a mailbox reader that matched zero rows and printed VERIFIED.

## Operator environment

Sean runs **Windows, PowerShell 5.1** (`PS C:\Users\Cash4>`), Node **v22.17.0**
[MEASURED 2026-09-08]. `&&` is a syntax error there; chain with `;` or give one
command per line. No `export`, no `$(...)`, no `~/`. He is not a developer — give one
complete pasteable block at a time and say what a correct result looks like.

## What is actually here

An Nx monorepo, three packages: `packages/contracts` (Solidity + ABIs + the ERC-8004
spec), `packages/circuits`, `packages/defaults`. Registries are live on Base Sepolia
(chain ID 84532) per the README — read `README.md` for the addresses rather than
copying them into new files.
