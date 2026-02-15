// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/ReputationRegistryUpgradeable.sol";

/**
 * @title RepIDRegistry
 * @dev Extends EIP-8004 ReputationRegistry with Pedersen commitments and Tiers.
 * Tiers: Seedling, Sapling, Grove, Forest, Canopy.
 */
contract RepIDRegistry is ReputationRegistryUpgradeable {
    enum RepTier { Seedling, Sapling, Grove, Forest, Canopy }

    struct RepIDStorage {
        mapping(uint256 => RepTier) _tiers;
        // agentId => commitmentHash
        mapping(uint256 => bytes32) _pedersenCommitments;
    }

    // keccak256(abi.encode(uint256(keccak256("trinity.reputation.registry")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REPID_STORAGE_LOCATION =
        0x5c3d7693f2b3746b2d03f163c788147b71aa82854399a21fdf4de143ba778301;

    function _getRepIDStorage() private pure returns (RepIDStorage storage $) {
        assembly {
            $.slot := REPID_STORAGE_LOCATION
        }
    }

    event TierUpgraded(uint256 indexed agentId, RepTier newTier);
    event CommitmentUpdated(uint256 indexed agentId, bytes32 commitment);

    /**
     * @dev Set a Pedersen commitment for an agent's reputation state.
     * This is used in conjunction with ZKP for privacy-preserving score verification.
     */
    function setPedersenCommitment(uint256 agentId, bytes32 commitment) external {
        require(IIdentityRegistry(getIdentityRegistry()).isAuthorizedOrOwner(msg.sender, agentId), "Not authorized");
        _getRepIDStorage()._pedersenCommitments[agentId] = commitment;
        emit CommitmentUpdated(agentId, commitment);
    }

    function getPedersenCommitment(uint256 agentId) external view returns (bytes32) {
        return _getRepIDStorage()._pedersenCommitments[agentId];
    }

    function updateTier(uint256 agentId, RepTier newTier) external onlyOwner {
        _getRepIDStorage()._tiers[agentId] = newTier;
        emit TierUpgraded(agentId, newTier);
    }

    function getRepTier(uint256 agentId) external view returns (RepTier) {
        return _getRepIDStorage()._tiers[agentId];
    }

    /**
     * @dev Helper to calculate tier based on raw score (example logic).
     */
    function calculateTier(int128 score) public pure returns (RepTier) {
        if (score >= 1000) return RepTier.Canopy;
        if (score >= 500) return RepTier.Forest;
        if (score >= 200) return RepTier.Grove;
        if (score >= 50) return RepTier.Sapling;
        return RepTier.Seedling;
    }
}
