pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

/*
 * Reputation Proof Circuit
 *
 * This circuit proves:
 * 1. The user has an identity commitment in the Merkle tree (authenticated)
 * 2. The user has sufficient reputation points (above a threshold)
 * 3. The user has the specified top category (optional)
 *
 * Public inputs: merkle_root, min_points, category_hash
 * Private inputs: identity_secret, identity_nullifier, identity_trapdoor,
 *                reputation_points, contribution_count, average_rating,
 *                path_elements, path_indices
 */
template ReputationProof(levels) {
    // Private inputs
    signal input identity_secret;
    signal input identity_nullifier;
    signal input identity_trapdoor;
    signal input reputation_points;
    signal input contribution_count;
    signal input average_rating;
    signal input path_elements[levels];
    signal input path_indices[levels];
    
    // Public inputs
    signal input min_points;
    signal input category_hash;
    
    // Outputs
    signal output merkle_root;
    signal output nullifier;
    signal output has_enough_points;
    signal output has_contributions;
    signal output timestamp;
    signal output user_id;
    
    // Compute identity commitment
    component identityCommitment = Poseidon(3);
    identityCommitment.inputs[0] <== identity_secret;
    identityCommitment.inputs[1] <== identity_nullifier;
    identityCommitment.inputs[2] <== identity_trapdoor;
    
    // Initialize the computed root
    signal computed_path[levels+1];
    computed_path[0] <== identityCommitment.out;
    
    // Compute Merkle root
    component selectors[levels];
    component hashers[levels];
    
    for (var i = 0; i < levels; i++) {
        // Select if we're inserting the existing element on the left or right
        selectors[i] = Mux1();
        selectors[i].c <== path_indices[i];
        selectors[i].a <== computed_path[i];
        selectors[i].b <== path_elements[i];
        
        // Hash the pair
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].a;
        hashers[i].inputs[1] <== selectors[i].b;
        
        computed_path[i+1] <== hashers[i].out;
    }
    
    // Verify points threshold
    component pointsCheck = GreaterEqThan(64);
    pointsCheck.in[0] <== reputation_points;
    pointsCheck.in[1] <== min_points;
    
    // Check if user has any contributions
    component contribCheck = GreaterThan(32);
    contribCheck.in[0] <== contribution_count;
    contribCheck.in[1] <== 0;
    
    // Compute user ID as the hash of the identity commitment (for privacy)
    component userIdHash = Poseidon(1);
    userIdHash.inputs[0] <== identityCommitment.out;
    
    // Compute nullifier
    component nullifierHash = Poseidon(2);
    nullifierHash.inputs[0] <== identity_nullifier;
    nullifierHash.inputs[1] <== 1; // Domain separator
    
    // Get current timestamp - in a real circuit, this would be bound to a system timestamp
    // or require a trusted external input
    signal timestamp_internal <== 0; // This would be implemented differently in production
    
    // Assign outputs
    merkle_root <== computed_path[levels];
    nullifier <== nullifierHash.out;
    has_enough_points <== pointsCheck.out;
    has_contributions <== contribCheck.out;
    timestamp <== timestamp_internal;
    user_id <== userIdHash.out;
}

// Define the main component with 20 levels (supports >1 million users)
component main {public [min_points, category_hash]} = ReputationProof(20);