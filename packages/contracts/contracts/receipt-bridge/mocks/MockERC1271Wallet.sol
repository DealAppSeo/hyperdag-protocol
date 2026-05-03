// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @notice Minimal ERC-1271 wallet whose isValidSignature accepts a signature
/// from a designated owner EOA. Test-only.
contract MockERC1271Wallet {
    bytes4 internal constant MAGIC_VALUE = 0x1626ba7e;
    address public ownerEOA;

    constructor(address ownerEOA_) {
        ownerEOA = ownerEOA_;
    }

    /// @notice Execute an arbitrary call from this wallet contract.
    /// @dev Used by tests to make the wallet act as msg.sender on the adapter.
    function executeCall(address target, bytes calldata data)
        external
        returns (bytes memory)
    {
        require(msg.sender == ownerEOA, "Mock1271: not authorized");
        (bool ok, bytes memory ret) = target.call(data);
        require(ok, "Mock1271: call failed");
        return ret;
    }

    function isValidSignature(bytes32 hash, bytes calldata signature)
        external
        view
        returns (bytes4)
    {
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(hash);
        (address recovered, ECDSA.RecoverError err, ) = ECDSA.tryRecover(ethSignedHash, signature);
        if (err == ECDSA.RecoverError.NoError && recovered == ownerEOA) {
            return MAGIC_VALUE;
        }
        (address recoveredRaw, ECDSA.RecoverError err2, ) = ECDSA.tryRecover(hash, signature);
        if (err2 == ECDSA.RecoverError.NoError && recoveredRaw == ownerEOA) {
            return MAGIC_VALUE;
        }
        return 0xffffffff;
    }
}
