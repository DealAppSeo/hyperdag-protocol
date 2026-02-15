// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ThreeChamberDAO
 * @dev Implements a 2-of-3 multi-chamber approval system for governance.
 * Chambers: Alpha (Agents), Beta (Humans), Gamma (Ecosystem).
 */
contract ThreeChamberDAO is Ownable {
    
    enum Chamber { Alpha, Beta, Gamma }

    struct Proposal {
        string description;
        bool executed;
        uint256 approvalCount;
        mapping(Chamber => bool) chamberApproved;
    }

    uint256 private _proposalCount;
    mapping(uint256 => Proposal) private _proposals;
    mapping(Chamber => address) private _chamberAdmins;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event ChamberApproved(uint256 indexed proposalId, Chamber chamber);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor() Ownable(msg.sender) {
        _chamberAdmins[Chamber.Alpha] = msg.sender;
        _chamberAdmins[Chamber.Beta] = msg.sender;
        _chamberAdmins[Chamber.Gamma] = msg.sender;
    }

    modifier onlyChamber(Chamber chamber) {
        require(msg.sender == _chamberAdmins[chamber], "Not chamber admin");
        _;
    }

    function createProposal(string calldata description) external returns (uint256) {
        uint256 proposalId = ++_proposalCount;
        Proposal storage p = _proposals[proposalId];
        p.description = description;
        emit ProposalCreated(proposalId, description);
        return proposalId;
    }

    function approveProposal(uint256 proposalId, Chamber chamber) external onlyChamber(chamber) {
        Proposal storage p = _proposals[proposalId];
        require(!p.chamberApproved[chamber], "Already approved by this chamber");
        require(!p.executed, "Proposal already executed");

        p.chamberApproved[chamber] = true;
        p.approvalCount++;

        emit ChamberApproved(proposalId, chamber);

        if (p.approvalCount >= 2) {
            _executeProposal(proposalId);
        }
    }

    function _executeProposal(uint256 proposalId) internal {
        Proposal storage p = _proposals[proposalId];
        p.executed = true;
        emit ProposalExecuted(proposalId);
        // Add actual governance logic here (e.g. state changes)
    }

    function setChamberAdmin(Chamber chamber, address admin) external onlyOwner {
        _chamberAdmins[chamber] = admin;
    }

    function getProposalStatus(uint256 proposalId) external view returns (bool executed, uint256 approvalCount) {
        Proposal storage p = _proposals[proposalId];
        return (p.executed, p.approvalCount);
    }
}
