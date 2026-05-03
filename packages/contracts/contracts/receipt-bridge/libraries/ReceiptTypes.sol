// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ReceiptTypes {
    struct HALCommitment {
        uint8 dofVersion;
        bytes32 outputHash;
        int128 boundedScore;
        uint8 commaBftVerdict;
        bytes32 dimensionsHash;
    }

    struct Receipt {
        uint256 agentId;
        bytes32 x402PaymentHash;
        bytes32 taskHash;
        bytes32 resultHash;
        bytes32 repIdCommitment;
        HALCommitment hal;
        bytes32 humanIdentityRoot;
        bytes32 receiptUriHash;
        bytes32 receiptContentHash;
        uint256 scoreVersion;
        uint64 createdAt;
        uint8 status;
        address committer;
    }

    struct ReceiptRevealParams {
        uint256 agentId;
        bytes32 x402PaymentHash;
        bytes32 taskHash;
        bytes32 resultHash;
        bytes32 repIdCommitment;
        HALCommitment hal;
        bytes32 humanIdentityRoot;
        bytes32 receiptUriHash;
        bytes32 receiptContentHash;
        uint256 scoreVersion;
        uint256 nonce;
        bytes signature;
        bytes proof;
    }

    uint8 internal constant STATUS_ACTIVE = 0;
    uint8 internal constant STATUS_INVALIDATED = 1;
    uint8 internal constant STATUS_DISPUTED = 2;

    uint8 internal constant VERDICT_PASS = 0;
    uint8 internal constant VERDICT_VETO = 1;
    uint8 internal constant VERDICT_INDETERMINATE = 2;

    function commitHashOf(
        ReceiptRevealParams memory p,
        address committer
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                committer,
                p.agentId,
                p.x402PaymentHash,
                p.taskHash,
                p.resultHash,
                p.repIdCommitment,
                p.hal.dofVersion,
                p.hal.outputHash,
                p.hal.boundedScore,
                p.hal.commaBftVerdict,
                p.hal.dimensionsHash,
                p.humanIdentityRoot,
                p.receiptUriHash,
                p.receiptContentHash,
                p.scoreVersion,
                p.nonce
            )
        );
    }

    function signingDigestOf(
        ReceiptRevealParams memory p
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                "HyperDAGReceipt.v1",
                p.agentId,
                p.x402PaymentHash,
                p.taskHash,
                p.resultHash,
                p.repIdCommitment,
                p.hal.outputHash,
                p.receiptContentHash,
                p.nonce
            )
        );
    }
}
