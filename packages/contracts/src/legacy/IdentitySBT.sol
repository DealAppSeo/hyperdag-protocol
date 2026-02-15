// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IdentitySBT
 * @dev Soulbound Token for user-controlled identity management
 * @notice This contract implements a non-transferable identity token with ZKP integration
 */
contract IdentitySBT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    struct Identity {
        bytes32 zkpCommitment;      // Zero-knowledge proof commitment
        bytes32 encryptedDataHash;  // Hash of encrypted personal data
        uint256 createdAt;          // Timestamp of creation
        uint256 lastUpdated;        // Last modification timestamp
        bool isActive;              // Identity status
        string metadataURI;         // IPFS hash for metadata
    }
    
    struct AccessPermission {
        address accessor;           // Address granted access
        uint256 expiresAt;         // Permission expiration timestamp
        bytes32 purposeHash;        // Hash of access purpose
        bool isRevoked;            // Revocation status
    }
    
    // Mapping from token ID to identity data
    mapping(uint256 => Identity) private _identities;
    
    // Mapping from token ID to access permissions
    mapping(uint256 => mapping(address => AccessPermission)) private _permissions;
    
    // Mapping from user address to token ID
    mapping(address => uint256) private _userTokens;
    
    // Events
    event IdentityCreated(uint256 indexed tokenId, address indexed owner, bytes32 zkpCommitment);
    event IdentityUpdated(uint256 indexed tokenId, bytes32 newDataHash);
    event AccessGranted(uint256 indexed tokenId, address indexed accessor, uint256 expiresAt);
    event AccessRevoked(uint256 indexed tokenId, address indexed accessor);
    event DataMonetized(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    
    constructor() ERC721("HyperDAG Identity SBT", "HIDSBT") {}
    
    /**
     * @dev Creates a new identity SBT for the caller
     * @param zkpCommitment Zero-knowledge proof commitment for identity
     * @param encryptedDataHash Hash of encrypted personal data
     * @param metadataURI IPFS hash containing encrypted metadata
     */
    function createIdentity(
        bytes32 zkpCommitment,
        bytes32 encryptedDataHash,
        string memory metadataURI
    ) external nonReentrant returns (uint256) {
        require(_userTokens[msg.sender] == 0, "Identity already exists");
        require(zkpCommitment != bytes32(0), "Invalid ZKP commitment");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _userTokens[msg.sender] = newTokenId;
        
        _identities[newTokenId] = Identity({
            zkpCommitment: zkpCommitment,
            encryptedDataHash: encryptedDataHash,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            isActive: true,
            metadataURI: metadataURI
        });
        
        emit IdentityCreated(newTokenId, msg.sender, zkpCommitment);
        return newTokenId;
    }
    
    /**
     * @dev Updates identity data with new encrypted information
     * @param newDataHash New hash of encrypted personal data
     * @param newMetadataURI Updated IPFS hash for metadata
     */
    function updateIdentity(
        bytes32 newDataHash,
        string memory newMetadataURI
    ) external {
        uint256 tokenId = _userTokens[msg.sender];
        require(tokenId != 0, "Identity does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not authorized");
        
        _identities[tokenId].encryptedDataHash = newDataHash;
        _identities[tokenId].metadataURI = newMetadataURI;
        _identities[tokenId].lastUpdated = block.timestamp;
        
        emit IdentityUpdated(tokenId, newDataHash);
    }
    
    /**
     * @dev Grants time-limited access to identity data
     * @param accessor Address to grant access to
     * @param duration Duration of access in seconds
     * @param purposeHash Hash describing the purpose of access
     */
    function grantAccess(
        address accessor,
        uint256 duration,
        bytes32 purposeHash
    ) external {
        uint256 tokenId = _userTokens[msg.sender];
        require(tokenId != 0, "Identity does not exist");
        require(accessor != address(0), "Invalid accessor");
        require(duration > 0, "Invalid duration");
        
        uint256 expiresAt = block.timestamp + duration;
        
        _permissions[tokenId][accessor] = AccessPermission({
            accessor: accessor,
            expiresAt: expiresAt,
            purposeHash: purposeHash,
            isRevoked: false
        });
        
        emit AccessGranted(tokenId, accessor, expiresAt);
    }
    
    /**
     * @dev Revokes access for a specific accessor
     * @param accessor Address to revoke access from
     */
    function revokeAccess(address accessor) external {
        uint256 tokenId = _userTokens[msg.sender];
        require(tokenId != 0, "Identity does not exist");
        require(_permissions[tokenId][accessor].accessor != address(0), "Access not granted");
        
        _permissions[tokenId][accessor].isRevoked = true;
        
        emit AccessRevoked(tokenId, accessor);
    }
    
    /**
     * @dev Checks if an accessor has valid permission to view identity data
     * @param tokenId Identity token ID
     * @param accessor Address to check permission for
     * @return bool True if access is valid and not expired
     */
    function hasValidAccess(uint256 tokenId, address accessor) external view returns (bool) {
        AccessPermission memory permission = _permissions[tokenId][accessor];
        
        return permission.accessor != address(0) &&
               !permission.isRevoked &&
               block.timestamp <= permission.expiresAt;
    }
    
    /**
     * @dev Returns identity data for authorized accessors
     * @param tokenId Identity token ID
     * @return Identity data if caller has valid access
     */
    function getIdentityData(uint256 tokenId) external view returns (Identity memory) {
        require(_exists(tokenId), "Identity does not exist");
        require(
            ownerOf(tokenId) == msg.sender || this.hasValidAccess(tokenId, msg.sender),
            "Access denied"
        );
        
        return _identities[tokenId];
    }
    
    /**
     * @dev Gets the token ID for a user's identity
     * @param user User address
     * @return uint256 Token ID (0 if no identity exists)
     */
    function getUserTokenId(address user) external view returns (uint256) {
        return _userTokens[user];
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
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Emergency deactivation of identity (user controlled)
     */
    function deactivateIdentity() external {
        uint256 tokenId = _userTokens[msg.sender];
        require(tokenId != 0, "Identity does not exist");
        
        _identities[tokenId].isActive = false;
    }
}