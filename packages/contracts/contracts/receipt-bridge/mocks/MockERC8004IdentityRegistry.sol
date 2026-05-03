// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Test-only mock of the ERC-8004 IdentityRegistry surface used by
/// HyperDAGReceiptAdapter (ownerOf / getApproved / isApprovedForAll). Not for
/// production deploys — the real Base Sepolia registry is at
/// 0x8004A818BFB912233c491871b3d84c89A494BD9e.
contract MockERC8004IdentityRegistry {
    mapping(uint256 => address) private _owners;
    mapping(uint256 => address) private _approvals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    function setOwner(uint256 agentId, address newOwner) external {
        _owners[agentId] = newOwner;
    }

    function setApproved(uint256 agentId, address operator) external {
        _approvals[agentId] = operator;
    }

    function setApprovedForAll(address owner_, address operator, bool approved) external {
        _operatorApprovals[owner_][operator] = approved;
    }

    function ownerOf(uint256 agentId) external view returns (address) {
        address o = _owners[agentId];
        require(o != address(0), "Mock: nonexistent agentId");
        return o;
    }

    function getApproved(uint256 agentId) external view returns (address) {
        return _approvals[agentId];
    }

    function isApprovedForAll(address owner_, address operator) external view returns (bool) {
        return _operatorApprovals[owner_][operator];
    }
}
