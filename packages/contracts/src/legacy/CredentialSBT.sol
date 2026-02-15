// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CredentialSBT
 * @dev Soulbound Token for individual credentials attached to identity
 * @notice Manages encrypted credentials with granular access control
 */
contract CredentialSBT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    enum CredentialType {
        IDENTITY,       // Driver's license, passport, ID
        FINANCIAL,      // Banking, crypto wallets, transaction history
        HEALTH,         // Medical records, fitness data, genetic info
        DIGITAL,        // Browser history, search patterns, social media
        PROFESSIONAL,   // Degrees, certifications, work history
        SOCIAL          // Referrals, reputation scores, reviews
    }
    
    struct Credential {
        uint256 identityTokenId;    // Associated identity SBT
        CredentialType credType;    // Type of credential
        bytes32 encryptedDataHash;  // Hash of encrypted credential data
        bytes32 zkpProof;          // Zero-knowledge proof of validity
        string ipfsHash;           // IPFS hash for encrypted data
        uint256 issuedAt;          // Timestamp when credential was issued
        uint256 expiresAt;         // Expiration timestamp (0 for non-expiring)
        address issuer;            // Address of credential issuer
        bool isRevoked;            // Revocation status
        bool isMonetizable;        // Whether user allows monetization
    }
    
    struct MonetizationRule {
        uint256 pricePerAccess;    // Price in wei per access
        uint256 maxAccesses;       // Maximum number of accesses allowed
        uint256 currentAccesses;   // Current number of accesses
        bool isActive;             // Whether monetization is active
    }
    
    // Mapping from token ID to credential data
    mapping(uint256 => Credential) private _credentials;
    
    // Mapping from token ID to monetization rules
    mapping(uint256 => MonetizationRule) private _monetization;
    
    // Mapping from credential type to user's credentials
    mapping(address => mapping(CredentialType => uint256[])) private _userCredentialsByType;
    
    // Mapping from identity token ID to all attached credentials
    mapping(uint256 => uint256[]) private _identityCredentials;
    
    // Events
    event CredentialMinted(uint256 indexed tokenId, address indexed owner, CredentialType credType);
    event CredentialRevoked(uint256 indexed tokenId, address indexed revoker);
    event MonetizationEnabled(uint256 indexed tokenId, uint256 pricePerAccess);
    event CredentialAccessed(uint256 indexed tokenId, address indexed accessor, uint256 payment);
    event RevenueWithdrawn(address indexed owner, uint256 amount);
    
    constructor() ERC721("HyperDAG Credential SBT", "HCRSBT") {}
    
    /**
     * @dev Mints a new credential SBT
     * @param identityTokenId Associated identity SBT token ID
     * @param credType Type of credential being minted
     * @param encryptedDataHash Hash of encrypted credential data
     * @param zkpProof Zero-knowledge proof of credential validity
     * @param ipfsHash IPFS hash for encrypted data storage
     * @param expiresAt Expiration timestamp (0 for non-expiring)
     */
    function mintCredential(
        uint256 identityTokenId,
        CredentialType credType,
        bytes32 encryptedDataHash,
        bytes32 zkpProof,
        string memory ipfsHash,
        uint256 expiresAt
    ) external nonReentrant returns (uint256) {
        require(encryptedDataHash != bytes32(0), "Invalid data hash");
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        
        _credentials[newTokenId] = Credential({
            identityTokenId: identityTokenId,
            credType: credType,
            encryptedDataHash: encryptedDataHash,
            zkpProof: zkpProof,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            issuer: msg.sender,
            isRevoked: false,
            isMonetizable: false
        });
        
        _userCredentialsByType[msg.sender][credType].push(newTokenId);
        _identityCredentials[identityTokenId].push(newTokenId);
        
        emit CredentialMinted(newTokenId, msg.sender, credType);
        return newTokenId;
    }
    
    /**
     * @dev Enables monetization for a credential
     * @param tokenId Credential token ID
     * @param pricePerAccess Price in wei per access
     * @param maxAccesses Maximum number of paid accesses allowed
     */
    function enableMonetization(
        uint256 tokenId,
        uint256 pricePerAccess,
        uint256 maxAccesses
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not authorized");
        require(pricePerAccess > 0, "Price must be greater than 0");
        require(maxAccesses > 0, "Max accesses must be greater than 0");
        
        _credentials[tokenId].isMonetizable = true;
        _monetization[tokenId] = MonetizationRule({
            pricePerAccess: pricePerAccess,
            maxAccesses: maxAccesses,
            currentAccesses: 0,
            isActive: true
        });
        
        emit MonetizationEnabled(tokenId, pricePerAccess);
    }
    
    /**
     * @dev Accesses a monetized credential (requires payment)
     * @param tokenId Credential token ID
     * @return Credential data if payment is valid
     */
    function accessMonetizedCredential(uint256 tokenId) external payable returns (Credential memory) {
        require(_exists(tokenId), "Credential does not exist");
        require(!_credentials[tokenId].isRevoked, "Credential is revoked");
        require(_credentials[tokenId].isMonetizable, "Credential not monetizable");
        
        MonetizationRule storage rule = _monetization[tokenId];
        require(rule.isActive, "Monetization not active");
        require(rule.currentAccesses < rule.maxAccesses, "Access limit reached");
        require(msg.value >= rule.pricePerAccess, "Insufficient payment");
        
        rule.currentAccesses++;
        
        // Transfer payment to credential owner
        address credentialOwner = ownerOf(tokenId);
        payable(credentialOwner).transfer(msg.value);
        
        emit CredentialAccessed(tokenId, msg.sender, msg.value);
        return _credentials[tokenId];
    }
    
    /**
     * @dev Revokes a credential
     * @param tokenId Credential token ID
     */
    function revokeCredential(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender || msg.sender == _credentials[tokenId].issuer, "Not authorized");
        
        _credentials[tokenId].isRevoked = true;
        emit CredentialRevoked(tokenId, msg.sender);
    }
    
    /**
     * @dev Gets all credentials of a specific type for a user
     * @param user User address
     * @param credType Credential type
     * @return Array of credential token IDs
     */
    function getUserCredentialsByType(address user, CredentialType credType) external view returns (uint256[] memory) {
        return _userCredentialsByType[user][credType];
    }
    
    /**
     * @dev Gets all credentials attached to an identity
     * @param identityTokenId Identity SBT token ID
     * @return Array of credential token IDs
     */
    function getIdentityCredentials(uint256 identityTokenId) external view returns (uint256[] memory) {
        return _identityCredentials[identityTokenId];
    }
    
    /**
     * @dev Gets credential data (only for owner or with valid access)
     * @param tokenId Credential token ID
     * @return Credential data
     */
    function getCredential(uint256 tokenId) external view returns (Credential memory) {
        require(_exists(tokenId), "Credential does not exist");
        require(ownerOf(tokenId) == msg.sender, "Access denied");
        
        return _credentials[tokenId];
    }
    
    /**
     * @dev Checks if a credential is valid (not revoked and not expired)
     * @param tokenId Credential token ID
     * @return bool True if credential is valid
     */
    function isCredentialValid(uint256 tokenId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        
        Credential memory cred = _credentials[tokenId];
        
        return !cred.isRevoked && 
               (cred.expiresAt == 0 || block.timestamp <= cred.expiresAt);
    }
    
    /**
     * @dev Override transfer functions to make tokens soulbound
     */
    function transferFrom(address, address, uint256) public pure override {
        revert("SBTs are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("SBTs are non-transferable");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("SBTs are non-transferable");
    }
    
    /**
     * @dev Returns the total number of credentials minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}