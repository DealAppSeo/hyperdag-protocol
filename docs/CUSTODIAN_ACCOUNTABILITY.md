# Custodian Accountability

## The Question This Document Answers

When an AI agent causes harm — a wrong financial recommendation,
a false health assessment, a flawed legal analysis — how does
anyone find out who is responsible?

This is not a hypothetical question. It is the central legal
and ethical challenge of the agentic economy. If AI agents
can act in the world without accountable human owners, the
result is harm without remedy.

HyperDAG Protocol's answer: **privacy by default,
accountability by necessity.**

---

## How Custodian Identity Is Protected

Every AI agent registered in the RepID system is linked to
a human custodian (or institution) through a ZKP
(zero-knowledge proof).

The proof establishes:
- This agent has a verified human custodian
- The custodian meets a defined accountability tier
- The custodian's identity can be revealed under defined conditions

What the proof does NOT reveal publicly:
- Who the custodian is
- Where they are located
- Any personal identifying information

The custodian's identity is held in the `human_sbt_registry`
(Soulbound Token registry), linked to their verified
credentials (email, phone, biometric, wallet signature).
The link is cryptographically sealed but not publicly visible.

---

## The Accountability Chain

```
AI Agent (public ERC-8004 identity on-chain)
    ↓ custodian_zkp_proof (public proof, private identity)
Human Custodian SBT (private identity, verified credentials)
    ↓ verification_method
Email + Phone + Wallet Signature (or Biometric)
```

If an agent causes harm:

1. The harmed party identifies the agent via its
   public on-chain ERC-8004 identity
2. A harm claim is filed (repid_challenges table)
3. The agent's accountability tier determines what happens next
4. Under defined disclosure conditions, the custodian's
   identity is revealed to the authorized party ONLY

---

## Accountability Tiers

Four tiers exist, each with different liability and
disclosure conditions:

### Tier 1 — Light Peer Backing (PEER_BACK)
**Liability:** Reputation only. No legal analog.
**Who:** Anyone with a basic trust score.
**Like:** A personal reference.
**Disclosure:** Only by DAO supermajority vote.
**RepID at risk:** 10%

### Tier 2 — Standard Stewardship (STEWARD)
**Liability:** Reputation + financial stake.
**Who:** Participants with established reputation.
**Like:** A co-signer on a loan.
**Disclosure:** DAO vote OR court order.
**RepID at risk:** 25%

### Tier 3 — Full Conservatorship (CONSERVATOR)
**Liability:** Full fiduciary responsibility.
**Who:** Highest-trust participants, SBT required.
**Like:** A legal conservator.
**Disclosure:** Court order OR DAO 2/3 supermajority.
**RepID at risk:** 50%
**Duties:** Pre-execution notifications, quarterly
  attestations, right to pause agent at any time.

### Tier 4 — Institutional Bundle (INSTITUTIONAL)
**Liability:** Full regulatory and fiduciary responsibility.
**Who:** Institutions taking responsibility for agent fleets.
**Like:** Prime brokerage model.
**Disclosure:** Regulatory authority or court order.
**RepID at risk:** 75%
**Compliance:** Colorado AI Act, EU AI Act Article 14.

---

## Disclosure Trigger Framework

Custodian identity disclosure requires one of:

| Harm Type | Trigger Required |
|-----------|-----------------|
| Reputation harm only | DAO supermajority vote |
| Economic harm < $10,000 | DAO vote OR mediation |
| Economic harm > $10,000 | Court order OR DAO 2/3 |
| Health/wellness harm | Mandatory — no vote required |
| Physical harm | Mandatory — immediate disclosure |
| Regulatory violation | Regulatory authority disclosure |
| Institutional compliance | Per jurisdiction requirements |

**Health and wellness decisions receive special treatment.**
Because errors in health and wellness diagnosis and analysis
can cause physical harm, disclosure is mandatory when a
health-domain HAL veto is challenged and harm is alleged.
No DAO vote is required. This is a constitutional rule.

---

## What Happens After Disclosure

Once a custodian is identified:

1. **RepID slashing** occurs per their accountability tier
   (10-75% of RepID points, depending on tier and harm severity)

2. **Stake liquidation** occurs if collateral was posted
   (goes to the affected party or the protocol insurance pool)

3. **The audit trail** — every decision, every veto, every
   proof — is permanently on HyperDAG and cannot be deleted

4. **The agent's reputation** is permanently affected —
   misconduct_incidents are recorded and cannot be removed

---

## Privacy Is Not Anonymity

This distinction is fundamental to the protocol.

**Privacy** means: your identity is not publicly visible
by default. You are not exposed to surveillance or data
harvesting. Your participation in the ecosystem is your
own business.

**Anonymity** means: your identity can never be revealed,
even when you cause harm to others.

HyperDAG Protocol provides privacy, not anonymity.

A custodian who causes harm cannot hide behind ZKP privacy.
The proof that protects their identity in normal operation
also contains the key that reveals it when accountability
requires it.

This is the ZKP Confession model: you confess your identity
cryptographically at registration, that confession is sealed
until needed, and it is unsealed only under defined conditions
that you agreed to when you became a custodian.

---

## For Institutions (TrustCRE, TrustRails)

Institutional custodians operating under Tier 4 have
additional obligations:

- Quarterly A2A (Agent-to-Agent) trust graph attestations
- Pre-approval required for decisions above spending limits
- Colorado AI Act compliance documentation
- EU AI Act Article 14 human oversight requirements
- Full audit trail available to regulators on request

The institutional custodian is the accountable party for
every agent in their bundle. There is no scenario in which
an institution can deploy agents without accepting this
accountability.

---

## Open Questions

We have not resolved everything. Honest open questions:

1. **Cross-jurisdiction disclosure:** If a custodian is in
   one country and the harmed party in another, which
   jurisdiction's disclosure rules apply?

2. **Agent-to-agent harm:** If Agent A harms Agent B
   (not a human), who can file a harm claim?

3. **Graduated disclosure:** Should minor harms trigger
   partial disclosure (accountability tier only, not identity)?

4. **The stateless agent problem:** What happens when an
   agent's custodian dies, dissolves, or abandons it?

These are genuine open questions. We welcome input.
Open an issue labeled [ACCOUNTABILITY].

---

*Privacy by default. Accountability by necessity.*
*The custodian is always known to the system.*
*The custodian is revealed only when the harm requires it.*
