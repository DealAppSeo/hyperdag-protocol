# Agent Custodianship Design Document

## Section 1: Existing Identity Primitives
*   **Human SBT (Soulbound Token)**: Uses `IdentitySBT` and `CredentialSBT` contracts. Issued by `repid.dev`. Supabase storage structure blocked from verification due to credential restrictions, assumed to be in `sbt_claims` or `users`. Chain is assumed to be Base Sepolia.
*   **Agent ERC-8004 (agent identity standard) Token**: IdentityRegistry deployed at `0x8004A818BFB912233c491871b3d84c89A494BD9e` on Base Sepolia. ReputationRegistry deployed at `0x8004B663056A597Dffe9eCcC1965A193B7388713` on Base Sepolia.
*   **RepID (Reputation Identity Credential) Scoring**: Stored in `repid_score_events` via the `repid-engine` pipeline.
*   **Plonky3 ZKP (Zero-Knowledge Proof)**: Verified against `zkp-postcard-production.up.railway.app`. Proof format `plonky3_range_check`. Commitment format is 32-byte keccak-sized (0x + 64 hex characters). Standalone verification post-tonight gap.

## Section 2: Custodianship Data Model
A new table `agent_custodianship` has been designed (see migration file `202604232359_agent_custodianship.sql`) that joins human SBT tokens to agent ERC-8004 tokens via ZKP commitments. 

## Section 3: Custodianship Claim Flow
1. Human lands at trustrepid.dev already holding a repid.dev SBT (service: frontend, [EXISTS])
2. Human navigates to agent detail page (service: frontend, [NEEDS-BUILD] ~1 day)
3. "Claim Custodianship" CTA visible if agent has no active custodian (service: frontend, [NEEDS-BUILD] ~0.5 day)
4. Click opens wallet-connect modal (service: frontend, [NEEDS-BUILD] ~0.5 day)
5. Backend generates challenge nonce: `sha256(agent_token_id || sbt_token_id || timestamp || secret)` (service: trustrepid-backend, [NEEDS-BUILD] ~0.5 day)
6. Human signs nonce via MetaMask/Coinbase Wallet (service: frontend + wallet, [NEEDS-BUILD] ~0.5 day)
7. Backend verifies signature with `ethers.utils.verifyMessage`, recovers signer, confirms signer === SBT owner on-chain (service: trustrepid-backend, [NEEDS-BUILD] ~1 day)
8. Backend calls zkp-postcard `POST /zkp/repid-proof` with augmented body `{"rep_id": <agent repid>, "context": {"sbt": X, "agent": Y, "nonce": Z}}` (service: zkp-postcard, [NEEDS-BUILD — extension] ~2 days)
9. Receive commitment hash. Insert row into `agent_custodianship` (service: trustrepid-backend, [NEEDS-BUILD] ~0.5 day)
10. Optional on-chain anchor: call `ReputationRegistry.sol` method to record custodianship event (service: on-chain, [NEEDS-BUILD — contract may need new method] ~1 day)
11. UI displays receipt: "Custodian of Agent #3747 | SBT #MMMM | Proof 0x... | Tx 0x..." (service: frontend, [NEEDS-BUILD] ~1 day)

## Section 4: UI Wireframes

**Screen A: Agent Detail Page**
```text
+-------------------------------------------------+
| TrustRepID                                      |
+-------------------------------------------------+
|  Agent #3747 (SOPHIA)                           |
|  RepID Score: 500  [Tier: AUTONOMOUS]           |
|                                                 |
|  Custodian: None                                |
|  [ Claim Custodianship via SBT ]                |
+-------------------------------------------------+
```

**Screen B: Claim Flow**
```text
+-------------------------------------------------+
| Claim Custodianship                             |
+-------------------------------------------------+
| 1. Connect Wallet  [ Connected: 0xAbC... ]      |
| 2. Sign Challenge  [ Sign Message ]             |
|                                                 |
|  ( Spinner ) Generating Plonky3 Proof...        |
+-------------------------------------------------+
```

**Screen C: Custodianship Receipt**
```text
+-------------------------------------------------+
| Custodianship Established!                      |
+-------------------------------------------------+
| Custodian of Agent #3747                        |
| SBT Token ID: #12345                            |
| ZKP Commitment: 0xff879... [Copy]               |
| Tx Anchor: 0x123abc... [View on Base Scan]      |
+-------------------------------------------------+
```

## Section 5: x402 Scoping
The x402 protocol is a standard for HTTP 402 Payment Required micropayments, enabling automated API monetization.
Integration points for custodianship:
a. **Registration Fee:** Custodian pays a small x402 fee to claim the agent, stopping Sybil spam. 
b. **Tooling Access:** Agent pays micropayments to external APIs via x402 headers using funded wallets.
c. **Revenue Share:** Third-parties pay the agent for API usage via x402, automatically routed to the Custodian's wallet.

For each flow, USDC on Base (Mainnet) is preferred for low gas. If a 402 is unfulfilled, the request is rejected immediately.
*Not implementing tonight. Blocked on (1) payment currency decision, (2) settlement model, (3) attorney review on Howey implications for custodian-receives-revenue model.*
