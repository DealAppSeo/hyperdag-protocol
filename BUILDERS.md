# Building on the Trust\* ecosystem

**This is the public contract for developers outside the core team.** It is
deliberately separate from the internal operating manual our own agents read
(`CLAUDE.md` here, `repid-engine/LESSONS.md` upstream). That file is a working
log — capped, dated, full of retractions and corrections aimed at people who
already know the system. It is the wrong first thing for a stranger to meet, and
it is not a promise we keep to you. This file is.

---

## 1. What is actually usable today

Everything in this section was measured on **2026-09-08**, not read off a badge.
Re-run the commands before relying on any of it; a dated fact decays, and a
*negative* fact ("X is not published") decays fastest of all, because anyone can
publish X without touching this file.

| Thing | State | How to check |
|---|---|---|
| **`@hyperdag/trustshell`** | **PUBLISHED — `1.6.0`** (measured 2026-10-05; was `1.4.0` on 2026-10-04). The one package to install. | `npm view @hyperdag/trustshell version` |
| `@hyperdag/protocol` | **NOT published** (404) | `npm view @hyperdag/protocol version` |
| `@hyperdag/identity-erc8004`, `@hyperdag/reputation-zkp` | **NOT published** (404) | same |
| `IdentityRegistry` on Base Sepolia (84532) | **LIVE** — `0x8004A818BFB912233c491871b3d84c89A494BD9e` | any RPC client, or basescan |
| `ReputationRegistry` on Base Sepolia (84532) | **LIVE** — `0x8004B663056A597Dffe9eCcC1965A193B7388713` | same |
| The six-interface kernel (`IIdentity`, `IReputation`, `IValidation`, `IPayment`, `ILinkage`, `IHallucination`) | source is on a feature branch, **not on `main`** | `git log origin/main -- packages/interfaces` |

| **The check: `POST /api/v1/classify`** | **LIVE**, public, keyless (measured 2026-10-04). See §1a. | the `curl` in §1a |

**So: `npm i @hyperdag/trustshell`. Not `@hyperdag/protocol`.** The badge at the
top of this repo's README links a package that does not exist yet. That badge
misled one of our own agents on 2026-09-08; it can mislead you the same way.

**Published 1.6.0, measured from the tarball on 2026-10-05.** `trustshell verify`
exits 0 on PASS or FLAG, 1 on VETO, and 2 when HAL did not decide (NOT_CHECKED, never a pass).
`ethers` (`^6`) is an optional peer: a plain install does not include it. The package uses it
to sign an x402 payment (`buildX402Payment`, `guardedX402Payment`) and for the keyless
on-chain read behind `verifySigner`.

**Read `README.md`'s "Known broken / not live" table before you design against
anything here.** It is unusually honest — it names a live event-signature defect
in `ReputationRegistry` that makes a spec-compliant indexer see zero feedback
events. That is the kind of thing most projects omit. We publish it because a
builder who discovers it in production has been failed by us.

### 1a. The one check every door calls

`POST https://repid-engine-production.up.railway.app/api/v1/classify` is what the Chrome
extension calls, and the CLI and phone bot use it too as they ship. It is public and needs
no key; CORS is `*`. It stores nothing: no text, no user id.

```bash
curl -s -X POST https://repid-engine-production.up.railway.app/api/v1/classify \
  -H 'content-type: application/json' \
  -d '{"text":"Paris is the capital of France.","labels":["pass","veto","not-checked"]}'
# {"label":"pass","latency_ms":187}     (measured 2026-10-04)
```

- **In:** `{text, labels}`. `labels` is optional; if present it must be exactly the three.
- **Out:** `{label, latency_ms}`, where `label` is `pass`, `veto` or `not-checked`.
- **What decides:** a whole-text arithmetic equation is evaluated locally. Prose up to
  1,500 characters goes to **two independent free models, which must agree**: both true
  gives `pass`, both false gives `veto`. Anything else gives `not-checked`: an opinion, a
  prediction, a split vote, a timeout, a rate limit, or text that is too long.
- **Treat `not-checked` as "unknown", never as true.** This is the §2 rule, applied to the
  thing we ship.
- **Your text leaves us:** it is sent to the model hosts that vote (Groq, and Cerebras when
  configured). Do not send secrets or personal data.
- **Limits:** 30 requests a minute per IP (`ratelimit-*` headers). Over the limit you get
  `429` with `label: not-checked`.
- **Health:** `GET /api/v1/classify/stats` (keyless) gives label counts, the share that came
  back `not-checked`, and a daily self-test result for each model. It returns counts only,
  never text, and resets on restart (`since` says when).

**Stability:** the three labels and the "a miss is never `pass`" rule are the contract and
will not change. Which models vote, the length cap and the rate limit are tuning and will
move. Read `label`, nothing else.

---

## 2. The one rule that is not optional

The ecosystem's entire product is **trust as verifiable evidence rather than
claim**. RepID scores derive from verdicts, and those scores are written to a
public chain. So a verdict you report is not a log line — it is an input to
somebody else's trust decision, permanently.

**Report three outcomes, never two: VERIFIED / NOT CHECKED / FAILED.**

Two outcomes collapse *"we did not look"* into *"it passed"*. That is not a
style preference here; it is the failure mode that has cost this system the most:

- A validator whose model call errored returned a score of **zero**, and zero
  entered the aggregate as a real verdict. Three silent validators summed to a
  confident **FAIL**, which disputed **twelve consecutive runs** and moved real
  testnet money against a provider whose work nobody had assessed. NOT CHECKED
  scored as FAILED.
- A mailbox reader whose query could no longer match any row printed
  `VERIFIED. Inbox has no unread messages` for months.
- A credential check reported green with no credential present.

If you integrate and emit a pass you did not observe, you are not just wrong
locally — you are writing that fiction into a reputation layer other people
price decisions on. **A component that cannot report NOT CHECKED cannot be
trusted to report VERIFIED.**

Corollary, and it is cheap: **a guard that has never been seen to fail is a
comment.** Break the property deliberately, watch your check go red, revert.
Until you have done that you do not know it is wired.

---

## 3. What is stable, and what will move

| Surface | Stability |
|---|---|
| The two registry addresses above, on Base Sepolia | stable — they are the canonical deployment |
| ERC-8004 identity + reputation read paths (`getRepID`, `getReputationHistory`, `getAttestation`) | stable — standard-defined, not ours to change |
| RepID **range** (10 floor, 10,000 cap) and the five tier names | stable |
| RepID **tier thresholds** and the scoring weights behind them | **will move.** Tuning is deliberate and not published. Do not hardcode a threshold; read the tier. |
| The six-interface kernel | pre-release, on a branch. Design against `@hyperdag/trustshell` instead. |
| ZK proof shape | the live proof is a narrow range check (`repid > threshold`). Binding a proof to the full RepID derivation is roadmap, not shipped. Do not describe it as shipped. |

**Two things you will not find here, deliberately:** the RepID scoring formula
and the ANFIS parameters. They are not published, and a contribution that
infers and hardcodes them will be rejected — not to be secretive, but because
anything hardcoded against them breaks silently the moment they are retuned.
Read the tier, not the arithmetic.

---

## 4. Anti-Sybil: why a high score may not get the tier you expect

The tier a score maps to is **demoted on unique-counterparty count**. An agent
that farms a high score with no real counterparties does not buy a top tier.

If you see a high-scoring agent sitting in a middle tier, that is the gate
working as designed. Do not file it as a bug, and do not build a workaround.

---

## 5. What your agent is allowed to do, and what decides it

**Capability is a property of your agent, not of the door it came in through.**
An agent reaching the ecosystem via TrustMarket, via TrustShell, or via a direct
integration is subject to the same evaluation. There is no permissive entry
point to shop for, and we will not add one: if capability varied by surface, the
surface would become the attack surface, and the most open door — which is
exactly the one we want outside builders to use — would be the one everyone
picked.

**The ladder is earned RepID tier**, not a plan you are on. That is deliberate:
RepID is anchored on ERC-8004, so it is portable between platforms, and the tier
it maps to is demoted on unique-counterparty count (§4), so it cannot be farmed.
A second, private trust ladder would be neither portable nor auditable, which
would defeat the point of anchoring the first one on-chain.

Two honest caveats, because you should design against what is true today:

- **Rate limits are a separate axis from capability.** Throughput is governed by
  a commercial API-key tier. Do not read a higher rate limit as broader
  permission — they are different things and are meant to stay different.
- **Tier-gated capability is, as of 2026-09-08, largely NOT ENFORCED IN CODE.**
  The schema carries a minimum-tier field on permissioned resources and nothing
  in the engine currently reads it. We are telling you this rather than letting
  you infer a guarantee from a column name: **do not build a security control
  that assumes the platform is gating on tier for you.** Enforce your own
  boundaries, and treat tier as a signal you read, not a gate someone else is
  holding. When enforcement lands it will be announced here, because switching
  it on changes who can reach what.

That second bullet is the same discipline as §2 pointed at ourselves: a field
recorded as though it were enforced, while enforcing nothing, is the
documentation equivalent of NOT CHECKED reported as VERIFIED.

---

## 6. Where to go, and what NOT to read

- **Start here**, then `README.md` in this repo — especially its "Known broken /
  not live" table.
- **Install** `@hyperdag/trustshell` and read its own docs.
- **Contributing**: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- **Do not** design against `CLAUDE.md` (this repo) or `repid-engine/LESSONS.md`.
  Those are the internal tier: an operating log for agents already inside the
  system, written in dated measurements and corrections. They are readable —
  the repos are public — but they are **not a contract**, they change without
  notice, and several entries exist purely to stop a specific past mistake
  recurring. Reading them as an API guarantee will mislead you.

**Contracts are on a testnet.** Base Sepolia is not mainnet. Nothing here is a
guarantee of mainnet behaviour, an audit, or financial advice.
