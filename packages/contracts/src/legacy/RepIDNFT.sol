// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RepIDNFT
 * @dev Soulbound NFT for reputation credentials with ZKP support
 * Part of AI Trinity Symphony HyperDAG system
 * One NFT per user, updatable scores, privacy-preserving proofs
 */
contract RepIDNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct RepIDScore {
        uint256 totalScore;
        uint256 authenticityScore;
        uint256 contributionScore;
        uint256 consistencyScore;
        uint256 lastUpdated;
        bytes32 zkProofHash;
    }
    
    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => RepIDScore) public tokenIdToScore;
    mapping(address => bool) public authorizedUpdaters;
    
    event RepIDMinted(address indexed user, uint256 tokenId, uint256 initialScore);
    event RepIDUpdated(uint256 indexed tokenId, uint256 newScore, bytes32 zkProofHash);
    event UpdaterAuthorized(address indexed updater, bool status);
    
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() ERC721("HyperDAG RepID", "REPID") Ownable(msg.sender) {
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @dev Mint a new RepID NFT (one per user)
     * @param user Address of the user
     * @param initialScore Initial reputation score
     * @param zkProofHash Hash of ZKP proving score validity
     */
    function mintRepID(
        address user,
        uint256 initialScore,
        bytes32 zkProofHash
    ) external onlyAuthorized returns (uint256) {
        require(userToTokenId[user] == 0, "User already has RepID");
        require(initialScore > 0, "Score must be positive");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(user, newTokenId);
        
        userToTokenId[user] = newTokenId;
        tokenIdToScore[newTokenId] = RepIDScore({
            totalScore: initialScore,
            authenticityScore: initialScore / 3,
            contributionScore: initialScore / 3,
            consistencyScore: initialScore / 3,
            lastUpdated: block.timestamp,
            zkProofHash: zkProofHash
        });
        
        emit RepIDMinted(user, newTokenId, initialScore);
        return newTokenId;
    }
    
    /**
     * @dev Update RepID score with ZKP verification
     * @param tokenId Token ID to update
     * @param newTotalScore New total score
     * @param authenticityScore New authenticity component
     * @param contributionScore New contribution component
     * @param consistencyScore New consistency component
     * @param zkProofHash Hash of ZKP proving update validity
     */
    function updateRepID(
        uint256 tokenId,
        uint256 newTotalScore,
        uint256 authenticityScore,
        uint256 contributionScore,
        uint256 consistencyScore,
        bytes32 zkProofHash
    ) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newTotalScore > 0, "Score must be positive");
        
        RepIDScore storage score = tokenIdToScore[tokenId];
        score.totalScore = newTotalScore;
        score.authenticityScore = authenticityScore;
        score.contributionScore = contributionScore;
        score.consistencyScore = consistencyScore;
        score.lastUpdated = block.timestamp;
        score.zkProofHash = zkProofHash;
        
        emit RepIDUpdated(tokenId, newTotalScore, zkProofHash);
    }
    
    /**
     * @dev Get RepID score for a user
     * @param user User address
     */
    function getRepIDScore(address user) external view returns (RepIDScore memory) {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User has no RepID");
        return tokenIdToScore[tokenId];
    }
    
    /**
     * @dev Verify ZKP proof hash matches stored hash
     * @param tokenId Token ID to verify
     * @param proofHash Proof hash to check
     */
    function verifyProof(uint256 tokenId, bytes32 proofHash) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenIdToScore[tokenId].zkProofHash == proofHash;
    }
    
    /**
     * @dev Authorize/revoke updater
     * @param updater Address to authorize
     * @param status Authorization status
     */
    function setAuthorizedUpdater(address updater, bool status) external onlyOwner {
        authorizedUpdaters[updater] = status;
        emit UpdaterAuthorized(updater, status);
    }
    
    /**
     * @dev Soulbound: Override transfer function to prevent transfers
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        revert("RepID NFTs are soulbound and cannot be transferred");
    }
    
    /**
     * @dev Soulbound: Override safeTransferFrom
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        revert("RepID NFTs are soulbound and cannot be transferred");
    }
    
    /**
     * @dev Soulbound: Prevent approvals
     */
    function approve(address to, uint256 tokenId) public virtual override {
        revert("RepID NFTs are soulbound and cannot be approved");
    }
    
    /**
     * @dev Soulbound: Prevent setApprovalForAll
     */
    function setApprovalForAll(address operator, bool approved) public virtual override {
        revert("RepID NFTs are soulbound and cannot be approved");
    }
    
    /**
     * @dev Allow burning/revocation by authorized parties only
     */
    function burn(uint256 tokenId) external onlyAuthorized {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        
        // Clear user mapping
        userToTokenId[owner] = 0;
        
        _burn(tokenId);
    }
}
