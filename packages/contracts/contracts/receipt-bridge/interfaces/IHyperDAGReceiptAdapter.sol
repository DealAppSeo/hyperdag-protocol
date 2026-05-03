// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReceiptTypes } from "../libraries/ReceiptTypes.sol";

interface IHyperDAGReceiptAdapter {
    event ReceiptCommitted(
        address indexed committer,
        bytes32 indexed commitHash,
        uint64 timestamp
    );

    event ReceiptRevealed(
        bytes32 indexed receiptId,
        uint256 indexed agentId,
        bytes32 indexed x402PaymentHash,
        bytes32 taskHash,
        bytes32 resultHash,
        bytes32 repIdCommitment,
        bytes32 halOutputHash,
        uint8 halDofVersion,
        uint8 halCommaBftVerdict,
        bytes32 receiptUriHash,
        bytes32 receiptContentHash,
        uint256 scoreVersion,
        address committer,
        uint64 timestamp
    );

    event ReceiptInvalidated(
        bytes32 indexed receiptId,
        uint256 indexed agentId,
        string reason,
        uint64 timestamp
    );

    function commitReceipt(bytes32 commitHash) external;

    function revealReceipt(ReceiptTypes.ReceiptRevealParams calldata params)
        external
        returns (bytes32 receiptId);

    function getReceipt(bytes32 receiptId)
        external
        view
        returns (ReceiptTypes.Receipt memory);

    function invalidateReceipt(bytes32 receiptId, string calldata reason) external;

    function commitBlock(bytes32 commitHash) external view returns (uint64);

    function isNonceUsed(address committer, uint256 nonce) external view returns (bool);

    function REVEAL_DELAY_BLOCKS() external view returns (uint256);
}
