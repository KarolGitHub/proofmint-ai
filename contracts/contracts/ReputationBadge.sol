// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ReputationBadge
 * @dev NFT-based reputation and KYC badge system for ProofMintAI
 */
contract ReputationBadge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Badge types
    enum BadgeType {
        KYC_VERIFIED,      // 0: KYC verification completed
        TRUSTED_USER,      // 1: User with good reputation
        PREMIUM_USER,      // 2: Premium subscription holder
        VERIFIER,          // 3: Document verification specialist
        MODERATOR,         // 4: Platform moderator
        DEVELOPER          // 5: Platform developer
    }

    // Badge levels
    enum BadgeLevel {
        BRONZE,    // 0: Basic level
        SILVER,    // 1: Intermediate level
        GOLD,      // 2: Advanced level
        PLATINUM   // 3: Expert level
    }

    // Badge structure
    struct Badge {
        BadgeType badgeType;
        BadgeLevel level;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isActive;
        string metadata;
    }

    // Mapping from tokenId to Badge
    mapping(uint256 => Badge) public badges;

    // Mapping from user address to their badges
    mapping(address => uint256[]) public userBadges;

    // Mapping from badge type to required criteria
    mapping(BadgeType => uint256) public badgeRequirements;

    // User reputation scores
    mapping(address => uint256) public reputationScores;

    // KYC verification status
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public kycVerifiedAt;

    // Events
    event BadgeIssued(uint256 tokenId, address recipient, BadgeType badgeType, BadgeLevel level);
    event BadgeRevoked(uint256 tokenId, address recipient);
    event ReputationUpdated(address user, uint256 newScore);
    event KYCVerified(address user, uint256 timestamp);

    constructor() ERC721("ProofMintAI Reputation Badge", "PMBADGE") {
        // Set initial badge requirements
        badgeRequirements[BadgeType.KYC_VERIFIED] = 0; // No requirements for KYC
        badgeRequirements[BadgeType.TRUSTED_USER] = 100; // 100 reputation points
        badgeRequirements[BadgeType.PREMIUM_USER] = 500; // 500 reputation points
        badgeRequirements[BadgeType.VERIFIER] = 1000; // 1000 reputation points
        badgeRequirements[BadgeType.MODERATOR] = 2000; // 2000 reputation points
        badgeRequirements[BadgeType.DEVELOPER] = 5000; // 5000 reputation points
    }

    /**
     * @dev Issue a badge to a user (only owner can issue badges)
     */
    function issueBadge(
        address recipient,
        BadgeType badgeType,
        BadgeLevel level,
        uint256 expiresAt,
        string memory metadata
    ) external onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        badges[newTokenId] = Badge({
            badgeType: badgeType,
            level: level,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            metadata: metadata
        });

        _safeMint(recipient, newTokenId);
        userBadges[recipient].push(newTokenId);

        emit BadgeIssued(newTokenId, recipient, badgeType, level);
        return newTokenId;
    }

    /**
     * @dev Revoke a badge (only owner can revoke badges)
     */
    function revokeBadge(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Badge does not exist");

        address recipient = ownerOf(tokenId);
        badges[tokenId].isActive = false;

        emit BadgeRevoked(tokenId, recipient);
    }

    /**
     * @dev Update user reputation score (only owner can update)
     */
    function updateReputation(address user, uint256 newScore) external onlyOwner {
        reputationScores[user] = newScore;
        emit ReputationUpdated(user, newScore);
    }

    /**
     * @dev Verify KYC for a user (only owner can verify)
     */
    function verifyKYC(address user) external onlyOwner {
        kycVerified[user] = true;
        kycVerifiedAt[user] = block.timestamp;
        emit KYCVerified(user, block.timestamp);
    }

    /**
     * @dev Get all badges for a user
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        return userBadges[user];
    }

    /**
     * @dev Get active badges for a user
     */
    function getActiveBadges(address user) external view returns (uint256[] memory) {
        uint256[] memory allBadges = userBadges[user];
        uint256 activeCount = 0;

        // Count active badges
        for (uint256 i = 0; i < allBadges.length; i++) {
            if (badges[allBadges[i]].isActive &&
                (badges[allBadges[i]].expiresAt == 0 || badges[allBadges[i]].expiresAt > block.timestamp)) {
                activeCount++;
            }
        }

        // Create array of active badges
        uint256[] memory activeBadges = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allBadges.length; i++) {
            if (badges[allBadges[i]].isActive &&
                (badges[allBadges[i]].expiresAt == 0 || badges[allBadges[i]].expiresAt > block.timestamp)) {
                activeBadges[index] = allBadges[i];
                index++;
            }
        }

        return activeBadges;
    }

    /**
     * @dev Check if user has a specific badge type
     */
    function hasBadge(address user, BadgeType badgeType) external view returns (bool) {
        uint256[] memory userBadgeList = userBadges[user];

        for (uint256 i = 0; i < userBadgeList.length; i++) {
            Badge memory badge = badges[userBadgeList[i]];
            if (badge.badgeType == badgeType &&
                badge.isActive &&
                (badge.expiresAt == 0 || badge.expiresAt > block.timestamp)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Get user's reputation score
     */
    function getReputationScore(address user) external view returns (uint256) {
        return reputationScores[user];
    }

    /**
     * @dev Check if user is KYC verified
     */
    function isKYCVerified(address user) external view returns (bool) {
        return kycVerified[user];
    }

    /**
     * @dev Get KYC verification timestamp
     */
    function getKYCVerifiedAt(address user) external view returns (uint256) {
        return kycVerifiedAt[user];
    }

    /**
     * @dev Get badge details
     */
    function getBadge(uint256 tokenId) external view returns (Badge memory) {
        require(_exists(tokenId), "Badge does not exist");
        return badges[tokenId];
    }

    /**
     * @dev Check if badge is active and not expired
     */
    function isBadgeActive(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Badge does not exist");
        Badge memory badge = badges[tokenId];
        return badge.isActive && (badge.expiresAt == 0 || badge.expiresAt > block.timestamp);
    }

    /**
     * @dev Get badge requirements for a specific type
     */
    function getBadgeRequirements(BadgeType badgeType) external view returns (uint256) {
        return badgeRequirements[badgeType];
    }

    /**
     * @dev Set badge requirements (only owner)
     */
    function setBadgeRequirements(BadgeType badgeType, uint256 requirements) external onlyOwner {
        badgeRequirements[badgeType] = requirements;
    }

    /**
     * @dev Override tokenURI to include badge metadata
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Badge does not exist");
        return super.tokenURI(tokenId);
    }
}