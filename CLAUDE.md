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

**That is the whole pointer. This file deliberately does NOT list the other repos.**

It used to. A five-row table of sibling entry points shipped here on 2026-09-08 and was
already wrong when it merged — `DealAppSeo/trustrails-dev` is live and was not in it. The
shape was the defect, not the missing row: the Trust\* ecosystem is TrustShell, TrustMarket,
TrustRepID, TrustRails, TrustTrader, TrustCRE, TrustEscrow and TrustMedical on this same
HAL / RepID / ERC-8004 / x402 harness, plus whatever third parties build via TrustMarket.
A per-repo list of all siblings is N tables of N rows — adding a surface means editing every
other repo, and forgetting fails **silently**: the new surface simply is not listed, nothing
breaks, and an agent landing there sees no pointer. That is the exact defect the table was
added to fix, one level up. Same lesson as the hand-maintained jest `roots` list in
`repid-engine`: *prefer a discovery rule to a list.*

**So: a star, not a mesh.** Every repo names true north and nothing else. One line per repo,
a new surface touches only itself, and no table exists to go stale. If you need to know which
repos exist, ask the person who gave you the assignment or read the session's own source
list — do not trust a checked-in inventory.

## Two tiers, and you are reading the internal one

| tier | who | where |
|---|---|---|
| **Internal** — operating log, dated, changes without notice | our agents (CC, XC, GA, the swarm) | `repid-engine/LESSONS.md`, then this file |
| **Published** — the contract we keep | outside developers building on the ecosystem | **[`BUILDERS.md`](BUILDERS.md)** |

The two are not interchangeable. The internal tier is capped at 6000 characters because it is
a dispatch payload, and much of it is corrections that exist to stop one specific past mistake
recurring. **It is readable — these repos are public — but it is not a promise.** If you are
answering an outside builder, answer from `BUILDERS.md`; if it does not cover their question,
that is a gap in `BUILDERS.md` to fix, not a licence to quote the internal file at them.

## ⚠ THIS REPOSITORY IS PUBLIC

Apache 2.0. Every commit message, PR title, PR body and comment is world-readable and
permanent.

**Correction, MEASURED 2026-09-08.** This line first said *"published as `@hyperdag/protocol`
on npm"*. It is **not published** — `npm view @hyperdag/protocol` returns 404, as do
`@hyperdag/identity-erc8004` and `@hyperdag/reputation-zkp`. I read that off the npm badge at
the top of `README.md` without running the query, while the README's own *"Known broken / not
live"* table three screens below said plainly that it 404s. **A badge is a link, not a
measurement** — same class as reading `-stub` in a filename as evidence about production.
The one package that IS published is **`@hyperdag/trustshell@1.3.0`**, and it is what an
outside builder should install. See `BUILDERS.md`.

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
