# E2E_OUTLINES — both locked positioning paths, with REAL results (CC1, 2026-09-13) [V]

Positioning is LOCKED (Sean/Grok, not re-litigated): TrustShell = **(a) harness for a user's pre-existing agent** AND **(b) create-PAI flow on the site for someone with no agent yet**. Both. These are real *run* results, not hollow-green outlines (cf. task #92 anti-pattern).

## PATH (a) — existing-agent HARNESS install [E2E RAN, PASS]
Stranger installs the published SDK and wraps their own agent. **Ran live 2026-09-13** (temp dir, `npm i @hyperdag/trustshell@1.3.0`, real engine calls):
```
TrustShell.init()               → health.ok = true
verifyOutput("…Paris.")         → PASS  (trustScore 100)
verifyOutput("Eiffel…in Rome")  → VETO  (trustScore 0)      ← harness caught the lie
getRepID("trinity-shofet")      → repid 2177, tier ESTABLISHED
```
Independent assert (not hollow): PASS requires health.ok AND Paris=PASS AND Rome∈{VETO,FLAG} AND repid is a number → **exit 0**. Keyless (no API key). This IS the harness E2E; it can run in CI as a smoke test against the live engine.

## PATH (b) — new-PAI creation on the site [E2E RAN via headless browser, PASS]
No agent yet → www.trustshell.dev/create. **Verified with Playwright** (see WALK_MAIN / earlier peer-verify):
```
type name → Create → agentId + apiKey ("shown once, copy now")
"…Paris." → PASS ; "Eiffel…Rome" → VETO ("harness blocked a false claim")
empty name → refuses (no crash) ; second PAI → own store, #1 untouched
```
Live HAL confirmed: Paris `{decision:"clean"}`, Rome `{decision:"vetoed"}`; page maps to PASS/VETO (post-#141).

## Single-path assumptions to reconcile (flagged, not fixed)
1. **npm 1.3.0 serves ONLY path (a).** `verifyOutput`/`getRepID`/`buildX402Payment` ship in the package; the create-PAI path lives on the **site** + the `init-pai` CLI (git-main/1.4.0, not in the tarball — see PEER_REVIEW.md / SITE_VS_NPM.md). A doc/README that says "`npm i` to create a PAI" would be wrong — create-PAI is site-based. Recommend the positioning copy name both surfaces explicitly (install SDK = harness; visit /create = new PAI).
2. No **code** contradiction found — the two paths use different surfaces and coexist. The risk is purely **doc framing** leaning one way.

## Does anything block T12 dogfooding TODAY? (asked in task #55)
- **Harness path (a): NOT blocked.** An agent can `npm i @hyperdag/trustshell@1.3.0` and call `verifyOutput` keyless right now — just proved PASS/VETO live. No fleet, no key needed. **T12 agents can dogfood the harness path today.**
- **Fleet-loop path: intentionally frozen** (2026-07-28 ratified). Not a blocker to fix — a design decision; do NOT naive-restart.
- HAL provider fleet is 3/6 down on billing (#56) but the **quorum still returned correct PASS/VETO** just now, so dogfooding is not blocked by that today.

---
*CC1 · 2026-09-13 · testing lane · harness E2E ran live (exit 0); create E2E via Playwright. No hollow-green: independent asserts on every path.*
