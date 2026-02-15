// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/IdentityRegistryUpgradeable.sol";

/**
 * @title TrinityIdentityAdapter
 * @dev Extends EIP-8004 IdentityRegistry to support Trinity-specific token tiers (SBT, DBT, CBT).
 * SBT: Soul Bound Token (Identity)
 * DBT: Digital Bound Token (Agentic)
 * CBT: Charity Bound Token (Purpose)
 */
contract TrinityIdentityAdapter is IdentityRegistryUpgradeable {
    enum TokenTier { SBT, DBT, CBT }

    struct TrinityIdentityStorage {
        mapping(uint256 => TokenTier) _tiers;
        mapping(uint256 => bool) _isZkpVerified;
    }

    // keccak256(abi.encode(uint256(keccak256("trinity.identity.adapter")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TRINITY_IDENTITY_STORAGE_LOCATION =
        0x5c7f82729de4970518741823ec1276cbcd41a0c7493f62d173341566a04e01;

    function _getTrinityIdentityStorage() private pure returns (TrinityIdentityStorage storage $) {
        assembly {
            $.slot := TRINITY_IDENTITY_STORAGE_LOCATION
        }
    }

    event TierAssigned(uint256 indexed agentId, TokenTier tier);
    event ZkpVerified(uint256 indexed agentId, bool status);

    function registerWithTier(TokenTier tier) external returns (uint256 agentId) {
        agentId = register();
        _getTrinityIdentityStorage()._tiers[agentId] = tier;
        emit TierAssigned(agentId, tier);
    }

    function getTier(uint256 agentId) external view returns (TokenTier) {
        return _getTrinityIdentityStorage()._tiers[agentId];
    }

    function setZkpVerified(uint256 agentId, bool status) external onlyOwner {
        _getTrinityIdentityStorage()._isZkpVerified[agentId] = status;
        emit ZkpVerified(agentId, status);
    }

    function isZkpVerified(uint256 agentId) external view returns (bool) {
        return _getTrinityIdentityStorage()._isZkpVerified[agentId];
    }

    // Override _update to enforce SBT behavior (non-transferable for SBT tier)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        TokenTier tier = _getTrinityIdentityStorage()._tiers[tokenId];
        address from = _ownerOf(tokenId);
        
        if (tier == TokenTier.SBT && from != address(0) && to != address(0)) {
            revert("SBT is non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }
}
