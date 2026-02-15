# HyperDAG Zero-Knowledge Proof Circuits

This directory contains the circuit files used for generating and verifying zero-knowledge proofs in the HyperDAG platform.

## Circuit Files

In production, this directory would contain actual circuit files:

- `reputation_proof.circom` - The Circom circuit implementation for reputation proofs
- `reputation_proof.wasm` - WebAssembly compiled representation of the circuit
- `reputation_proof.zkey` - The proving key for the circuit
- `reputation_proof.vkey.json` - The verification key for the circuit

## Implementation Details

The current implementation of the reputation-zkp-service.ts has a fallback mechanism that creates a compatible simulation when the actual circuit files aren't available. In a production environment, these files would be generated using the circom compiler and snarkjs.

### Circuit Generation Process

1. Create the circuit in Circom language
2. Compile the circuit to WebAssembly (.wasm)
3. Perform a trusted setup ceremony to generate the proving and verification keys
4. Use the resulting files in the ZKP service for generating and verifying proofs

## Example Circom Circuit

Here's a simplified example of what the reputation proof circuit might look like:

```circom
pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template ReputationProof() {
    signal input identity_secret;
    signal input identity_nullifier;
    signal input identity_trapdoor;
    signal input reputation_points;
    signal input min_points;
    signal input category_hash;
    signal input path_elements[20];
    signal input path_indices[20];
    
    signal output merkle_root;
    signal output nullifier;
    signal output has_enough_points;
    
    // Compute identity commitment
    component identityCommitment = Poseidon(3);
    identityCommitment.inputs[0] <== identity_secret;
    identityCommitment.inputs[1] <== identity_nullifier;
    identityCommitment.inputs[2] <== identity_trapdoor;
    
    // Verify Merkle path
    component merkleProof = MerkleProof(20);
    merkleProof.leaf <== identityCommitment.out;
    for (var i = 0; i < 20; i++) {
        merkleProof.path_elements[i] <== path_elements[i];
        merkleProof.path_indices[i] <== path_indices[i];
    }
    
    // Verify points threshold
    component pointsCheck = GreaterEqThan(32);
    pointsCheck.in[0] <== reputation_points;
    pointsCheck.in[1] <== min_points;
    
    // Compute nullifier
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== identity_nullifier;
    nullifierHash.inputs[1] <== 1; // For domain separation
    
    // Assign outputs
    merkle_root <== merkleProof.root;
    nullifier <== nullifierHash.out;
    has_enough_points <== pointsCheck.out;
}

component main {public [min_points, category_hash]} = ReputationProof();
```

## Integration with the ZKP Service

The reputation-zkp-service.ts file is designed to work with these circuit files, using snarkjs to generate and verify proofs. When the actual circuit files are available, the service will use them; otherwise, it will fall back to a simulation that maintains the correct interface structure.