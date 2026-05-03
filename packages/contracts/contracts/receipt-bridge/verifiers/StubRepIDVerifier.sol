// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IRepIDVerifier } from "../interfaces/IRepIDVerifier.sol";

/// @notice v1.0 placeholder. v1.1 swaps in a real Plonky3 verifier produced by
/// the parallel circuit work. Intentionally permissive — this is a contract
/// surface, not a security boundary in v1.0.
contract StubRepIDVerifier is IRepIDVerifier {
    function verify(bytes calldata proof, bytes32 publicInputHash)
        external
        pure
        override
        returns (bool)
    {
        return proof.length > 0 && publicInputHash != bytes32(0);
    }
}
