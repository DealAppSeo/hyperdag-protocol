# SBT Minting Flow — Specification v0.1

**Status:** v0.1 working spec, 2026-04-26.
**Spec authority:** This document is normative for the public mint
flow. Contract source in `packages/contracts/` (contributor-protected;
not modified by this spec) is the implementation ground truth.

---

## Overview

Soulbound Tokens (SBTs) represent verified human or autonomous-agent
identity in the HyperDAG ecosystem. Unlike ERC-721 NFTs, SBTs cannot
be transferred — they bind to a wallet for the lifetime of the
holder's participation. The HyperDAG SBT extends the ERC-721
metadata interface with two HyperDAG-specific fields:
`repIdCommitment` (a hash pointer to the holder's current RepID) and
`extensionCapabilities` (an array of activated capabilities such as
`dbt_delegation`, `cbt_organization_link`).

## Why SBTs vs alternatives

- **vs ERC-721:** SBTs are non-transferable, preventing the
  emergence of identity-as-asset secondary markets.
- **vs DIDs:** SBTs anchor on-chain with a cryptographic mint event
  that is timestamp-evident. DIDs are useful for off-chain identity
  resolution; SBTs add on-chain accountability.
- **vs SBT-only solutions:** HyperDAG SBTs additionally carry a
  RepID commitment (a ZKP-friendly hash, not the RepID value
  itself), letting holders prove "RepID ≥ T" without revealing R.

## Mint flow

Six phases. Phases 1, 4, 5, 6 are required; phase 2 is optional and
gated separately; phase 3 is automatic from the system.

### Phase 1: Identity attestation

- The user initiates the connection from a web client (e.g. repid.dev).
- The client signs an attestation challenge with the wallet's private
  key. The challenge MUST include a server-generated nonce and the
  protocol version string `hyperdag-sbt/v0.1` so replay across
  versions is not possible.
- The wallet address is the canonical identifier going forward.
- Output: `signedChallenge` retained server-side until Phase 4.

### Phase 2: Optional contact layer (separately gated)

- The user MAY provide email, phone, or other contact data.
- Contact data is encrypted at rest off-chain (Supabase, AES-256-GCM
  per the existing `repid-engine` data model).
- **The contact layer is NEVER linked to the on-chain SBT publicly.**
  Cross-reference is one-way and held only in the off-chain DB.
- The user can revoke the contact layer at any time without affecting
  the SBT. The SBT remains valid; only the off-chain row is purged.

### Phase 3: Initial RepID seeding

- The system assigns initial RepID = 0 (untrusted).
- The first trust-building action increments RepID per the math
  defined in `hyperdag-protocol/METHODOLOGY.md` and the per-event
  weight tables in `repid-engine` (private; the public weight defaults
  are documented in `repid/spec/AGENT-STAKING-CHALLENGE-PROTOCOL.md`).
- The SBT metadata stores a **pointer** to the current RepID
  commitment hash, not the RepID value itself. Updates to RepID
  produce new commitments (chained via the audit log) without
  requiring re-mint.

### Phase 4: SBT mint transaction

- The system submits `mint(repIdCommitment)` to the SBT contract on
  Base Sepolia (testnet) or Base Mainnet (production).
- `tokenId = keccak256(walletAddress || timestamp || protocolVersion)`.
  The tokenId is deterministic from the mint inputs and includes the
  protocol version string so v0.1 and v0.2 SBTs are always
  distinguishable on-chain.
- The contract enforces non-transferability via a
  `_beforeTokenTransfer` override that reverts on every transfer
  except the mint (`from == address(0)`) and burn (`to == address(0)`)
  paths. Burn is allowed only by the holder, never by anyone else.
- The mint emits the event:
  `SBTMinted(holder, tokenId, repIdCommitment, ipfsURI)`.
- Gas budget: the mint transaction is expected to use < 200,000 gas
  on Base. Gas budgets are normative for v0.1 and may relax in v0.2
  if features warrant.

### Phase 5: Metadata anchoring

- Metadata JSON is pinned to IPFS via Pinata (or any equivalent IPFS
  pinning provider — the spec is provider-agnostic, only the
  resulting IPFS CID is normative).
- `tokenURI(tokenId)` returns `ipfs://Qm<CID>`.
- Metadata schema (canonical):
  ```json
  {
    "schema": "hyperdag-sbt/v0.1",
    "tokenId": "0x...",
    "minted_at": "2026-04-26T12:34:56Z",
    "rep_id_pointer": "<repIdCommitment hash>",
    "verified_attributes": ["wallet_signature_verified"],
    "extension_capabilities": ["dbt_delegation", "cbt_organization_link"]
  }
  ```
- `verified_attributes` MAY include additional strings as future
  Phase-2 attestations come online (e.g. `email_verified`,
  `oauth_verified`). The schema is open-ended on this field;
  consumers MUST tolerate unknown attribute strings.
- `extension_capabilities` is the canonical capability list for v0.1.
  v0.2 may extend it; consumers MUST tolerate unknown capabilities.

### Phase 6: ZKP commitment publication

- The initial RepID commitment is computed off-chain:
  `commitment = H(repIdValue || nonce || holderAddress)`.
- The commitment is written to the off-chain audit log (the
  `anfis_score_events` table or its successor).
- The on-chain contract emits `RepIDCommitted(holder,
  commitmentHash)` so verifiers can replay the chain to confirm
  the commitment was published before any threshold proofs were
  generated against it.

## Edge cases

- **Wallet loss.** SBTs cannot be recovered. The user must mint a
  new SBT from a new wallet. The old SBT continues to exist on-chain
  with a derelict status (no further RepID commitments emitted). A
  successor signal MAY be added off-chain (a social-graph attestation
  by RepID-weighted peers) but is not normative in v0.1.
- **RepID slashing.** The SBT remains valid even if RepID drops to 0.
  Only the RepID commitment updates. There is no "SBT slash" — the
  SBT is identity, not credit. Loss of credit happens through the
  RepID engine's slashing math, not through SBT state.
- **Network change.** SBTs are chain-specific in v0.1. Cross-chain
  bridge (mirror SBT on a second chain with a ZKP-attested origin)
  is a v1 feature.
- **Mint failure.** If Phase 4 reverts, no Phase 5/6 effects occur.
  The off-chain row is rolled back. Phase 1's signedChallenge is
  retained for re-attempt; replay is safe because the nonce is
  bound into the challenge.

## Contracts (interface only — implementation is in
`packages/contracts/` and is contributor-protected)

```solidity
interface IHyperDAGSBT is IERC721Metadata {
    /// @notice Mint a new SBT bound to msg.sender with an initial RepID commitment.
    /// @param repIdCommitment H(repIdValue || nonce || holderAddress)
    /// @return tokenId Deterministic id keccak256(holder || ts || version)
    function mint(bytes32 repIdCommitment) external returns (uint256 tokenId);

    /// @notice Returns the current RepID commitment pointer for the SBT.
    function repIdPointer(uint256 tokenId) external view returns (bytes32);

    /// @notice Always true for HyperDAG SBTs. Present for symmetry with
    ///         transfer-capable token interfaces; non-transferability is also
    ///         enforced in _beforeTokenTransfer.
    function isSoulbound(uint256 tokenId) external view returns (bool);

    event SBTMinted(
        address indexed holder,
        uint256 indexed tokenId,
        bytes32 repIdCommitment,
        string ipfsURI
    );
    event RepIDCommitted(address indexed holder, bytes32 commitment);
}
```

This interface is the **expected** shape. The contract source in
`packages/contracts/` is the **actual** shape. If the two diverge,
the contract source wins; PRs to update this spec are welcome and
expected when the contract source changes.

## Test vectors

Three deterministic test wallets with expected outputs. These vectors
let any consumer of this spec verify their integration without running
against a live deployment.

### Vector 1 — Standard mint

- `holderAddress`: `0x71be63f3384f5fb98995898a86b02fb289d76570`
- `timestamp` (mint block timestamp): `1714147200`
  (2026-04-26T12:00:00Z)
- `protocolVersion`: `"hyperdag-sbt/v0.1"`
- `repIdValue`: `0` (initial)
- `nonce`: `0x000…01` (32-byte zero-padded one)
- Expected `tokenId`:
  `keccak256(0x71be63f3384f5fb98995898a86b02fb289d76570 ||
   uint256(1714147200) || "hyperdag-sbt/v0.1")`
- Expected `repIdCommitment`:
  `keccak256(uint256(0) || 0x000…01 ||
   0x71be63f3384f5fb98995898a86b02fb289d76570)`
- Expected event: `SBTMinted(0x71be…, tokenId, repIdCommitment, ipfsURI)`
  followed by `RepIDCommitted(0x71be…, repIdCommitment)`.

### Vector 2 — Subsequent commitment update

- Same `holderAddress` as vector 1.
- After RepID grows to 1500 (EARNING_AUTONOMY tier).
- New commitment:
  `keccak256(uint256(1500) || newNonce || holderAddress)`.
- Expected event: `RepIDCommitted(holder, newCommitment)`. Note that
  `SBTMinted` is NOT re-emitted; the SBT is unchanged, only the
  commitment pointer updates.

### Vector 3 — Transfer attempt (must revert)

- `holderAddress` (vector 1) attempts
  `transferFrom(holder, 0xattacker, tokenId)`.
- Expected: revert with reason `"HyperDAGSBT: non-transferable"` (or
  the contract's exact revert string; consumers SHOULD match on the
  fact of revert, not the string).

## Privacy properties

- The SBT carries no personal information on-chain. Wallet address is
  the only on-chain identifier, and it is pseudonymous by Ethereum's
  default.
- `repIdCommitment` is a hash; the underlying RepID value is not
  derivable without the nonce.
- IPFS metadata is publicly readable. Therefore the metadata schema
  MUST NOT include personal data. Phase 2 contact data lives off-chain
  only and is never reachable from the IPFS URI.
- Phase 6's commitment publication is the moment after which threshold
  ZKP proofs can be generated against this holder's RepID. See
  `repid/spec/ZKP-REPID-PROOF.md` for the proof structure.

## Known limitations of v0.1

- No revocation mechanism for derelict SBTs — wallet-loss case relies
  on social-graph successor signaling (off-chain).
- IPFS pinning is single-provider (Pinata) in v0.1; multi-provider
  redundancy is v1.
- Cross-chain SBTs not supported.
- Mint event does not include the chosen IPFS gateway; consumers
  resolve via `tokenURI()` instead.

## Migration path (v0.1 → v0.2)

When v0.2 ships:
- The `protocolVersion` field bumps to `hyperdag-sbt/v0.2`.
- A new mint event variant `SBTMintedV2` MAY be introduced; the v0.1
  event is kept for replay compatibility.
- Holders of v0.1 SBTs MAY opt into a v0.2 commitment by issuing a
  `RepIDCommitted` with a v0.2-shaped commitment hash. The SBT
  itself is not re-issued.

## References

- ERC-721: <https://eips.ethereum.org/EIPS/eip-721>
- ERC-7231 (aggregated identity binding): cited in the trustrepid
  README as the human-side SBT shape; this spec is compatible with
  ERC-7231 conventions but does not require them.
- HyperDAG protocol overview: `README.md` and `METHODOLOGY.md` in
  this repo.
- ZKP RepID proof structure: `repid/spec/ZKP-REPID-PROOF.md`.
