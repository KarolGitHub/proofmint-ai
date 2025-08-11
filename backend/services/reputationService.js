const { ethers } = require('ethers');
require('dotenv').config();
const { loadContractABI } = require('./contractLoader');

const REPUTATION_BADGE_ADDRESS = process.env.REPUTATION_BADGE_ADDRESS;
const REPUTATION_BADGE_ABI = loadContractABI('ReputationBadge');

// Initialize contract only if address and ABI are provided
let reputationBadgeContract = null;
if (REPUTATION_BADGE_ADDRESS && REPUTATION_BADGE_ABI) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    reputationBadgeContract = new ethers.Contract(
      REPUTATION_BADGE_ADDRESS,
      REPUTATION_BADGE_ABI,
      wallet
    );
    console.log('✅ Reputation Badge contract initialized');
  } catch (error) {
    console.error(
      '❌ Failed to initialize Reputation Badge contract:',
      error.message
    );
  }
} else {
  console.warn(
    '⚠️  Reputation Badge contract not available - missing address or ABI'
  );
}

// Helper function to check if contract is initialized
function checkContractInitialized() {
  if (!reputationBadgeContract) {
    throw new Error(
      'Reputation contract not initialized. Please ensure REPUTATION_BADGE_ADDRESS environment variable is set and contract ABI is available.'
    );
  }
}

// Badge types mapping
const BADGE_TYPES = {
  KYC_VERIFIED: 0,
  TRUSTED_USER: 1,
  PREMIUM_USER: 2,
  VERIFIER: 3,
  MODERATOR: 4,
  DEVELOPER: 5,
};

// Badge levels mapping
const BADGE_LEVELS = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};

/**
 * Issue a reputation badge to a user
 * @param {string} recipient - User address
 * @param {number} badgeType - Badge type (0-5)
 * @param {number} level - Badge level (0-3)
 * @param {number} expiresAt - Expiration timestamp (0 for no expiration)
 * @param {string} metadata - Badge metadata URI
 * @returns {Promise<Object>} Badge issuance result
 */
async function issueBadge(
  recipient,
  badgeType,
  level,
  expiresAt = 0,
  metadata = ''
) {
  checkContractInitialized();

  try {
    const tx = await reputationBadgeContract.issueBadge(
      recipient,
      badgeType,
      level,
      expiresAt,
      metadata
    );
    const receipt = await tx.wait();

    // Find BadgeIssued event
    const event = receipt.logs
      .map((log) => {
        try {
          return reputationBadgeContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === 'BadgeIssued');

    if (event) {
      return {
        success: true,
        tokenId: event.args.tokenId.toString(),
        recipient: event.args.recipient,
        badgeType: event.args.badgeType.toString(),
        level: event.args.level.toString(),
        transactionHash: receipt.hash,
      };
    }

    return { success: true, transactionHash: receipt.hash };
  } catch (error) {
    console.error('Badge issuance error:', error);
    throw new Error(`Failed to issue badge: ${error.message}`);
  }
}

/**
 * Revoke a badge
 * @param {number} tokenId - Badge token ID
 * @returns {Promise<Object>} Revocation result
 */
async function revokeBadge(tokenId) {
  checkContractInitialized();

  try {
    const tx = await reputationBadgeContract.revokeBadge(tokenId);
    const receipt = await tx.wait();

    return {
      success: true,
      tokenId: tokenId.toString(),
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Badge revocation error:', error);
    throw new Error(`Failed to revoke badge: ${error.message}`);
  }
}

/**
 * Update user reputation score
 * @param {string} user - User address
 * @param {number} newScore - New reputation score
 * @returns {Promise<Object>} Update result
 */
async function updateReputation(user, newScore) {
  checkContractInitialized();

  try {
    const tx = await reputationBadgeContract.updateReputation(user, newScore);
    const receipt = await tx.wait();

    return {
      success: true,
      user,
      newScore,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('Reputation update error:', error);
    throw new Error(`Failed to update reputation: ${error.message}`);
  }
}

/**
 * Verify KYC for a user
 * @param {string} user - User address
 * @returns {Promise<Object>} KYC verification result
 */
async function verifyKYC(user) {
  checkContractInitialized();

  try {
    const tx = await reputationBadgeContract.verifyKYC(user);
    const receipt = await tx.wait();

    return {
      success: true,
      user,
      verifiedAt: Math.floor(Date.now() / 1000),
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('KYC verification error:', error);
    throw new Error(`Failed to verify KYC: ${error.message}`);
  }
}

/**
 * Get user's reputation score
 * @param {string} user - User address
 * @returns {Promise<number>} Reputation score
 */
async function getReputationScore(user) {
  checkContractInitialized();

  try {
    const score = await reputationBadgeContract.getReputationScore(user);
    return score.toString();
  } catch (error) {
    console.error('Get reputation score error:', error);
    throw new Error(`Failed to get reputation score: ${error.message}`);
  }
}

/**
 * Check if user is KYC verified
 * @param {string} user - User address
 * @returns {Promise<boolean>} KYC verification status
 */
async function isKYCVerified(user) {
  checkContractInitialized();

  try {
    const verified = await reputationBadgeContract.isKYCVerified(user);
    return verified;
  } catch (error) {
    console.error('KYC verification check error:', error);
    throw new Error(`Failed to check KYC status: ${error.message}`);
  }
}

/**
 * Get KYC verification timestamp
 * @param {string} user - User address
 * @returns {Promise<number>} KYC verification timestamp
 */
async function getKYCVerifiedAt(user) {
  checkContractInitialized();

  try {
    const timestamp = await reputationBadgeContract.getKYCVerifiedAt(user);
    return timestamp.toString();
  } catch (error) {
    console.error('Get KYC timestamp error:', error);
    throw new Error(`Failed to get KYC timestamp: ${error.message}`);
  }
}

/**
 * Get all badges for a user
 * @param {string} user - User address
 * @returns {Promise<Array>} Array of badge token IDs
 */
async function getUserBadges(user) {
  checkContractInitialized();

  try {
    const badges = await reputationBadgeContract.getUserBadges(user);
    return badges.map((id) => id.toString());
  } catch (error) {
    console.error('Get user badges error:', error);
    throw new Error(`Failed to get user badges: ${error.message}`);
  }
}

/**
 * Get active badges for a user
 * @param {string} user - User address
 * @returns {Promise<Array>} Array of active badge token IDs
 */
async function getActiveBadges(user) {
  checkContractInitialized();

  try {
    const badges = await reputationBadgeContract.getActiveBadges(user);
    return badges.map((id) => id.toString());
  } catch (error) {
    console.error('Get active badges error:', error);
    throw new Error(`Failed to get active badges: ${error.message}`);
  }
}

/**
 * Check if user has a specific badge type
 * @param {string} user - User address
 * @param {number} badgeType - Badge type to check
 * @returns {Promise<boolean>} Whether user has the badge
 */
async function hasBadge(user, badgeType) {
  checkContractInitialized();

  try {
    const hasBadge = await reputationBadgeContract.hasBadge(user, badgeType);
    return hasBadge;
  } catch (error) {
    console.error('Check badge error:', error);
    throw new Error(`Failed to check badge: ${error.message}`);
  }
}

/**
 * Get badge details
 * @param {number} tokenId - Badge token ID
 * @returns {Promise<Object>} Badge details
 */
async function getBadge(tokenId) {
  checkContractInitialized();

  try {
    const badge = await reputationBadgeContract.getBadge(tokenId);
    return {
      badgeType: badge.badgeType.toString(),
      level: badge.level.toString(),
      issuedAt: badge.issuedAt.toString(),
      expiresAt: badge.expiresAt.toString(),
      isActive: badge.isActive,
      metadata: badge.metadata,
    };
  } catch (error) {
    console.error('Get badge error:', error);
    throw new Error(`Failed to get badge: ${error.message}`);
  }
}

/**
 * Check if badge is active
 * @param {number} tokenId - Badge token ID
 * @returns {Promise<boolean>} Whether badge is active
 */
async function isBadgeActive(tokenId) {
  checkContractInitialized();

  try {
    const isActive = await reputationBadgeContract.isBadgeActive(tokenId);
    return isActive;
  } catch (error) {
    console.error('Check badge active error:', error);
    throw new Error(`Failed to check badge status: ${error.message}`);
  }
}

/**
 * Get badge requirements for a specific type
 * @param {number} badgeType - Badge type
 * @returns {Promise<number>} Required reputation score
 */
async function getBadgeRequirements(badgeType) {
  checkContractInitialized();

  try {
    const requirements = await reputationBadgeContract.getBadgeRequirements(
      badgeType
    );
    return requirements.toString();
  } catch (error) {
    console.error('Get badge requirements error:', error);
    throw new Error(`Failed to get badge requirements: ${error.message}`);
  }
}

/**
 * Calculate reputation score based on user activity
 * @param {Object} userActivity - User activity data
 * @returns {number} Calculated reputation score
 */
function calculateReputationScore(userActivity) {
  let score = 0;

  // Base score for joining
  score += 10;

  // Document notarizations
  score += (userActivity.notarizations || 0) * 50;

  // Successful transactions
  score += (userActivity.successfulTransactions || 0) * 25;

  // Time on platform (days)
  const daysOnPlatform = userActivity.daysOnPlatform || 0;
  score += Math.min(daysOnPlatform * 2, 100); // Max 100 points for time

  // Community contributions
  score += (userActivity.communityContributions || 0) * 10;

  // Penalties for negative actions
  score -= (userActivity.failedTransactions || 0) * 10;
  score -= (userActivity.disputes || 0) * 20;

  // Ensure score doesn't go below 0
  return Math.max(score, 0);
}

/**
 * Get comprehensive user profile with reputation and badges
 * @param {string} user - User address
 * @returns {Promise<Object>} User profile
 */
async function getUserProfile(user) {
  try {
    const [
      reputationScore,
      kycVerified,
      kycVerifiedAt,
      activeBadges,
      allBadges,
    ] = await Promise.all([
      getReputationScore(user),
      isKYCVerified(user),
      getKYCVerifiedAt(user),
      getActiveBadges(user),
      getUserBadges(user),
    ]);

    // Get badge details for active badges
    const badgeDetails = await Promise.all(
      activeBadges.map((tokenId) => getBadge(tokenId))
    );

    return {
      user,
      reputationScore: parseInt(reputationScore),
      kycVerified,
      kycVerifiedAt: kycVerifiedAt !== '0' ? parseInt(kycVerifiedAt) : null,
      activeBadges: activeBadges.length,
      totalBadges: allBadges.length,
      badgeDetails,
      badges: {
        KYC_VERIFIED: await hasBadge(user, BADGE_TYPES.KYC_VERIFIED),
        TRUSTED_USER: await hasBadge(user, BADGE_TYPES.TRUSTED_USER),
        PREMIUM_USER: await hasBadge(user, BADGE_TYPES.PREMIUM_USER),
        VERIFIER: await hasBadge(user, BADGE_TYPES.VERIFIER),
        MODERATOR: await hasBadge(user, BADGE_TYPES.MODERATOR),
        DEVELOPER: await hasBadge(user, BADGE_TYPES.DEVELOPER),
      },
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
}

module.exports = {
  issueBadge,
  revokeBadge,
  updateReputation,
  verifyKYC,
  getReputationScore,
  isKYCVerified,
  getKYCVerifiedAt,
  getUserBadges,
  getActiveBadges,
  hasBadge,
  getBadge,
  isBadgeActive,
  getBadgeRequirements,
  calculateReputationScore,
  getUserProfile,
  BADGE_TYPES,
  BADGE_LEVELS,
};
