// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRepIDVerifier {
    function verify(bytes calldata proof, bytes32 publicInputHash) external view returns (bool);
}
