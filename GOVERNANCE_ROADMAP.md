# HyperDAG Protocol — Governance Roadmap

> *"He has shown you, O mortal, what is good. And what does the LORD require
> of you? To act justly and to love mercy and to walk humbly with your God."
> — Micah 6:8*

This document is a forward-looking commitment about how the HyperDAG
Protocol transitions from founder-bootstrapped to community-governed. It
names principles and a public timeline without prematurely locking specific
mechanisms.

For the technical architecture this governance applies to, see
[ARCHITECTURE.md](ARCHITECTURE.md).

---

## Current State (v0.1)

HyperDAG Protocol v0.1 is **founder-bootstrapped**. Sean Goodwin (DealApp Inc.,
sole inventor on the patent portfolio) makes architectural decisions, manages
infrastructure, and reviews PRs. Code is published under Apache-2.0; community
contributions are welcomed via PRs and Issues.

This is a deliberate, time-bounded posture, not a permanent state.

---

## The Bootstrap Phase

Why v0.1 is founder-led:

1. **Working code first, governance debate second.** Premature voting on
   architecture that doesn't exist yet wastes everyone's time.
2. **Architectural coherence under early uncertainty.** When the API surface
   is changing weekly, a single coherent voice produces a better protocol
   than a committee.
3. **Patent-relevant decisions need a single accountable signer.** Three
   patent claims (P-001, P-002, P-003) are pending. The decisions about
   what is disclosed publicly and when are the founder's responsibility
   until counsel signs off.

The bootstrap phase is **bounded and transparent.** Bootstrap ends at v0.5
(Q3 2026 target). Specific transition milestones below.

---

## Transition Milestones

Public, dated commitments. The dates are targets; if a milestone slips, the
slip will be explained publicly with revised target.

| Milestone | Target | What changes |
| :--- | :--- | :--- |
| **Month 0** | May 2026 | v0.1 alpha published. Founder-bootstrapped governance. All architectural decisions made by founder. |
| **Month 3** | Aug 2026 | Public governance debate opens. Architecture decisions and proposed mechanisms invited for community feedback. **Contrasting opinions explicitly welcomed** — RFC process documented in `governance/` directory. |
| **Month 6** | Nov 2026 | Reputation-weighted snapshot voting begins on **non-critical decisions** (e.g., RetroPGF allocations from the slashing pool). Critical decisions (interface breaking changes, security responses) remain founder-signed. |
| **Month 12** | May 2027 | Three-branch council framework live. Branch elections held. Initial constitution drafted. |
| **Month 18** | Nov 2027 | Community ratification of governance constitution. **Founder transfers core decision rights** for protocol changes to the council. Patent-defensive role retained. |
| **Month 24** | May 2028 | **Full v1.0 community-governed protocol.** Founder retains advisory + patent-defensive role only; no unilateral authority over protocol changes. |

---

## Long-Term Vision: Three-Branch DAO

By v1.0, HDP is governed by a three-branch council, organized by
constituency rather than by stake size:

1. **Random users — sortition.** Represents end-users. Members selected
   randomly from a pool of verified users. Term-limited rotation prevents
   capture.
2. **Devs / builders — technical merit.** Represents contributors. Members
   elected by reputation-weighted vote among contributors with merged code
   in the last 12 months.
3. **Stakeholders — capital + skin in the game.** Represents resource
   providers. Members elected by stake-weighted vote among
   linkage-collateralized parties.

Each branch is initially sized at ~10% of its constituency type, with floors
and caps to be tuned during the month-12 to month-18 ratification window.
Decisions that change the protocol require **concurrence across branches**.
Simpler decisions (RetroPGF allocations, parameter tuning within bounded
ranges) can be made within a single branch.

---

## Voting Mechanisms Under Consideration

Specific mechanism choices are deferred to community ratification at month
18. Current proposals being weighed:

- **STAR voting (Score-Then-Automatic-Runoff)** for parameter decisions
  (e.g., HITL gate threshold, comma threshold). Preserves expressed
  preference intensity better than approval voting.
- **Quadratic voting** for grant and RetroPGF allocations. Limits whale
  capture; rewards broad consent over concentrated enthusiasm.
- **Simple majority** for routine operations (validator slate refresh,
  monthly oracle endpoint updates).

This is an **open question for community input** — see month-3 milestone
above.

---

## Sybil Resistance Commitment

This is the make-or-break technical commitment. **HDP must integrate a
non-capital Sybil resistance layer** so devs without funds can participate
meaningfully in dev-branch elections. Stake-only governance becomes
plutocratic; HDP refuses that path.

v0.1 evaluates four candidate primitives:

- **Gitcoin Passport** — composable identity stamps. Mature ecosystem,
  reasonable adoption.
- **BrightID** — graph-based unique-personhood. Strong anti-Sybil model,
  smaller user base.
- **World ID** — proof of personhood via biometric. Strongest Sybil
  resistance, real privacy concerns.
- **ZK-based proof-of-personhood** (e.g., Anon Aadhaar, ZK-Email) — newer
  primitives that prove unique-human under ZKP without revealing identity.

Specific choice **locked by month 6.** Selection criteria: privacy, dev
accessibility, Sybil resistance strength, integration complexity, in that
order.

---

## Founder Step-Back Plan

Explicit founder authority at each milestone:

| Phase | Founder controls | Founder does NOT control |
| :--- | :--- | :--- |
| Month 0–3 | All architectural and protocol decisions | — |
| Month 3–6 | Final say on architectural and security decisions; community input gathered | RetroPGF distributions (formula-driven, bounded) |
| Month 6–12 | Final say on interface breaking changes and security; routine ops community-voted | Non-critical parameter tuning, validator slate composition |
| Month 12–18 | Veto on interface changes during ratification window | Branch elections, council decisions within their bounded authority |
| Month 18–24 | Patent-defensive responsibilities; no protocol-change veto after ratification | All protocol governance |
| Month 24+ | Advisory role; patent-defensive responsibilities | All protocol governance, including future patent assignment to a patent-defensive nonprofit |

**Final commitment: by month 24, the founder has no unilateral authority
over protocol changes.** Founder retains an advisory role and patent-
defensive responsibilities — both bounded and accountable to the council.

---

## Open for Community Input

This document is an invitation, not a manifesto.

- **GitHub Discussions** — open for general governance debate (enable when
  available).
- **RFC process** — to be documented in a `governance/` directory by month
  3. Goal: structured debate with contrasting opinions welcomed.
- **Issues with the `governance` label** — for specific concrete proposals.
- **Direct outreach** — Sean is reachable for high-bandwidth discussions
  during the bootstrap window.

The governance design serves the mission. The mission is to **help people
help people — the last, the lost, and the least.** If a proposed governance
change makes the protocol better at serving that mission, it gets a
serious hearing.

---

> **Mission anchor:** *"He has shown you, O mortal, what is good. And what
> does the LORD require of you? To act justly and to love mercy and to walk
> humbly with your God." — Micah 6:8*
>
> *"Whatever is true, whatever is noble, whatever is right..." — Philippians 4:8*
