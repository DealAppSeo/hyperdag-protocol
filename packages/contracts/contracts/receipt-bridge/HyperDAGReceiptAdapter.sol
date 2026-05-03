// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import { IHyperDAGReceiptAdapter } from "./interfaces/IHyperDAGReceiptAdapter.sol";
import { IRepIDVerifier } from "./interfaces/IRepIDVerifier.sol";
import { ReceiptTypes } from "./libraries/ReceiptTypes.sol";

interface IERC721Like {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @title HyperDAGReceiptAdapter
/// @notice Commit-reveal trust-receipt adapter for the HyperDAG Protocol.
/// Binds an ERC-8004 agentId to an x402 payment hash, task/result hashes, a
/// HAL constitutional output commitment, and a RepID commitment.
contract HyperDAGReceiptAdapter is
    IHyperDAGReceiptAdapter,
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    using ReceiptTypes for ReceiptTypes.ReceiptRevealParams;

    uint256 public constant REVEAL_DELAY_BLOCKS = 5;

    mapping(bytes32 => ReceiptTypes.Receipt) public receipts;
    mapping(bytes32 => uint64) public commits;
    mapping(address => mapping(uint256 => bool)) public usedNonces;

    address public verifier;
    address public erc8004IdentityRegistry;

    error CommitAlreadyExists();
    error CommitNotFound();
    error RevealTooEarly();
    error CommitMismatch();
    error NonceAlreadyUsed();
    error InvalidSignature();
    error VerifierRejected();
    error NotAgentOwnerOrOperator();
    error ReceiptAlreadyExists();
    error ReceiptNotFound();
    error NotInvalidatorAuthorized();
    error AlreadyInvalidated();
    error ZeroAddress();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address initialOwner,
        address verifier_,
        address erc8004IdentityRegistry_
    ) external initializer {
        if (initialOwner == address(0)) revert ZeroAddress();
        if (verifier_ == address(0)) revert ZeroAddress();
        if (erc8004IdentityRegistry_ == address(0)) revert ZeroAddress();
        __Ownable_init(initialOwner);
        verifier = verifier_;
        erc8004IdentityRegistry = erc8004IdentityRegistry_;
    }

    function setVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert ZeroAddress();
        verifier = newVerifier;
    }

    function commitReceipt(bytes32 commitHash) external {
        if (commits[commitHash] != 0) revert CommitAlreadyExists();
        commits[commitHash] = uint64(block.number);
        emit ReceiptCommitted(msg.sender, commitHash, uint64(block.timestamp));
    }

    function revealReceipt(ReceiptTypes.ReceiptRevealParams calldata params)
        external
        returns (bytes32 receiptId)
    {
        bytes32 commitHash = ReceiptTypes.commitHashOf(params, msg.sender);
        uint64 commitBlk = commits[commitHash];
        if (commitBlk == 0) revert CommitNotFound();
        if (block.number < commitBlk + REVEAL_DELAY_BLOCKS) revert RevealTooEarly();

        if (usedNonces[msg.sender][params.nonce]) revert NonceAlreadyUsed();
        usedNonces[msg.sender][params.nonce] = true;

        bytes32 signingDigest = ReceiptTypes.signingDigestOf(params);
        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(signingDigest);
        if (
            !SignatureChecker.isValidSignatureNow(msg.sender, ethSignedDigest, params.signature)
        ) {
            revert InvalidSignature();
        }

        if (!IRepIDVerifier(verifier).verify(params.proof, signingDigest)) {
            revert VerifierRejected();
        }

        if (!_isAgentOwnerOrOperator(msg.sender, params.agentId)) {
            revert NotAgentOwnerOrOperator();
        }

        receiptId = keccak256(abi.encode(commitHash, block.timestamp));
        if (receipts[receiptId].committer != address(0)) revert ReceiptAlreadyExists();

        receipts[receiptId] = ReceiptTypes.Receipt({
            agentId: params.agentId,
            x402PaymentHash: params.x402PaymentHash,
            taskHash: params.taskHash,
            resultHash: params.resultHash,
            repIdCommitment: params.repIdCommitment,
            hal: params.hal,
            humanIdentityRoot: params.humanIdentityRoot,
            receiptUriHash: params.receiptUriHash,
            receiptContentHash: params.receiptContentHash,
            scoreVersion: params.scoreVersion,
            createdAt: uint64(block.timestamp),
            status: ReceiptTypes.STATUS_ACTIVE,
            committer: msg.sender
        });

        emit ReceiptRevealed(
            receiptId,
            params.agentId,
            params.x402PaymentHash,
            params.taskHash,
            params.resultHash,
            params.repIdCommitment,
            params.hal.outputHash,
            params.hal.dofVersion,
            params.hal.commaBftVerdict,
            params.receiptUriHash,
            params.receiptContentHash,
            params.scoreVersion,
            msg.sender,
            uint64(block.timestamp)
        );
    }

    function getReceipt(bytes32 receiptId)
        external
        view
        returns (ReceiptTypes.Receipt memory r)
    {
        r = receipts[receiptId];
        if (r.committer == address(0)) revert ReceiptNotFound();
    }

    function invalidateReceipt(bytes32 receiptId, string calldata reason) external {
        ReceiptTypes.Receipt storage r = receipts[receiptId];
        if (r.committer == address(0)) revert ReceiptNotFound();
        if (r.status == ReceiptTypes.STATUS_INVALIDATED) revert AlreadyInvalidated();
        if (msg.sender != r.committer && msg.sender != owner()) revert NotInvalidatorAuthorized();
        r.status = ReceiptTypes.STATUS_INVALIDATED;
        emit ReceiptInvalidated(receiptId, r.agentId, reason, uint64(block.timestamp));
    }

    function commitBlock(bytes32 commitHash) external view returns (uint64) {
        return commits[commitHash];
    }

    function isNonceUsed(address committer, uint256 nonce) external view returns (bool) {
        return usedNonces[committer][nonce];
    }

    function _isAgentOwnerOrOperator(address caller, uint256 agentId)
        internal
        view
        returns (bool)
    {
        IERC721Like reg = IERC721Like(erc8004IdentityRegistry);
        address agentOwner;
        try reg.ownerOf(agentId) returns (address o) {
            agentOwner = o;
        } catch {
            return false;
        }
        if (caller == agentOwner) return true;
        try reg.getApproved(agentId) returns (address a) {
            if (a == caller) return true;
        } catch {}
        try reg.isApprovedForAll(agentOwner, caller) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
