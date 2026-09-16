# VISITOR_E2E — incognito checklist (L2)

**Who runs this:** Sean, in a clean browser profile (incognito / guest) and a clean shell (no `.env`, no repo checkout).  
**Who writes this:** XC1. This file is the script, not a measurement.  
**Do not say MVP launched.** npm `@latest` is **1.3.0** until F-PUBLISH.

Copy-paste the commands. Record PASS / FAIL / NOT_CHECKED. Fail-closed: a missing tool is NOT_CHECKED, not a pass.

---

## 0. Clean room

- [ ] Browser: new incognito window. No logged-in GitHub, no password manager autofill.
- [ ] Shell: new directory, e.g. `%TEMP%\visitor-e2e`. No cloned HyperDAG repos.
- [ ] Node 20+ (`node -v`). No `TRUSTSHELL_*` env vars.

---

## 1. Site → copy install

1. Open https://trustshell.dev
2. Copy the install line the page shows.
3. Expected (until F-PUBLISH): something that installs **`@hyperdag/trustshell`**, not a version that is not on npm.
4. Record: what version string the **site** claims vs `npm view @hyperdag/trustshell version`.

| Step | Expected | Result |
|---|---|---|
| Site loads | page, not a 404 | |
| Install copy | `npm i @hyperdag/trustshell` (or `npx @hyperdag/trustshell@1.3.0`) | |
| `npm view @hyperdag/trustshell version` | **1.3.0** until F-PUBLISH | |

If the site says 1.4.0 and npm says 1.3.0, that is a **site-pin miss** (F-SITE-PIN), not a visitor fail.

---

## 2. CLI — verify / getRepID / proof --verify

Pin the published package so the visitor is not on a local tree:

```bash
npx --yes @hyperdag/trustshell@1.3.0 verify "The capital of France is Paris."
npx --yes @hyperdag/trustshell@1.3.0 verify "The Eiffel Tower is in Rome."
npx --yes @hyperdag/trustshell@1.3.0 repid trinity-shofet
npx --yes @hyperdag/trustshell@1.3.0 proof trinity-shofet --verify
```

(`repid` is the CLI name for getRepID on 1.3.0.)

| # | Command | Expected | Result |
|---|---|---|---|
| 2a | Paris | **PASS** (keyless) | |
| 2b | Rome / Eiffel | **VETO** (keyless) | |
| 2c | `repid trinity-shofet` | a finite RepID + a tier string | |
| 2d | `proof … --verify` | client-side verify **true**, or an honest error (not a silent empty) | |

Quorum language: live HAL is a **partial quorum** (today two answering families). Do not treat “2” as “6”.

---

## 3. MCP — `present_proof`

```bash
npx --yes @hyperdag/trustshell-mcp
```

Then, from a client that can list tools (Claude Desktop / Cursor / `mcp` inspector):

1. List tools.
2. If `present_proof` is listed, call it for `trinity-shofet` with verify on.
3. If it is **not** listed, record **NOT_CHECKED / not on published MCP** — do not invent a pass.

| Step | Expected (honest) | Result |
|---|---|---|
| MCP boots | process stays up | |
| Tool list | published MCP historically: `verify`, `getRepID`, `getLeaderboard` — **`present_proof` is on the 1.4.0 tree, not on npm MCP 1.0.x/1.2.0** | |
| `present_proof` | PASS only if the tool exists and returns a verifiable postcard; else NOT_CHECKED | |

Until F-PUBLISH, the visitor proof step that actually ships is **CLI 2d**, not MCP.

---

## 4. Stop conditions

- Any command that prints a secret, a service-role key, or a production UUID: **stop**, do not paste it.
- Do not `npm publish`. Do not apply SQL. Do not type “MVP launched” into notes.

## Provenance

Checklist written 2026-09-15 (XC1, L2). Live numbers in [`TRUSTSHELL_E2E.md`](./TRUSTSHELL_E2E.md) are a dated measurement (2026-09-10) against `@1.3.0`; re-run this file rather than copying those numbers forward.
