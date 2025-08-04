const express = require('express');
const router = express.Router();
const reputationService = require('../services/reputationService');
const { sendError } = require('../utils/errorResponse');

/**
 * @swagger
 * /reputation/profile/{user}:
 *   get:
 *     summary: Get user reputation profile
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                 reputationScore:
 *                   type: number
 *                 kycVerified:
 *                   type: boolean
 *                 kycVerifiedAt:
 *                   type: number
 *                 activeBadges:
 *                   type: number
 *                 totalBadges:
 *                   type: number
 *                 badgeDetails:
 *                   type: array
 *                 badges:
 *                   type: object
 */
router.get('/profile/:user', async (req, res) => {
  try {
    const { user } = req.params;
    if (!user) {
      return sendError(res, 400, 'User address is required');
    }

    const profile = await reputationService.getUserProfile(user);
    res.json(profile);
  } catch (err) {
    console.error('Get user profile error:', err);
    sendError(res, 500, 'Failed to get user profile', err.message);
  }
});

/**
 * @swagger
 * /reputation/score/{user}:
 *   get:
 *     summary: Get user reputation score
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *     responses:
 *       200:
 *         description: Reputation score retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 */
router.get('/score/:user', async (req, res) => {
  try {
    const { user } = req.params;
    if (!user) {
      return sendError(res, 400, 'User address is required');
    }

    const score = await reputationService.getReputationScore(user);
    res.json({ score: parseInt(score) });
  } catch (err) {
    console.error('Get reputation score error:', err);
    sendError(res, 500, 'Failed to get reputation score', err.message);
  }
});

/**
 * @swagger
 * /reputation/update:
 *   post:
 *     summary: Update user reputation score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - newScore
 *             properties:
 *               user:
 *                 type: string
 *                 description: User address
 *               newScore:
 *                 type: number
 *                 description: New reputation score
 *     responses:
 *       200:
 *         description: Reputation updated successfully
 */
router.post('/update', async (req, res) => {
  try {
    const { user, newScore } = req.body;
    if (!user || newScore === undefined) {
      return sendError(res, 400, 'User address and new score are required');
    }

    const result = await reputationService.updateReputation(user, newScore);
    res.json(result);
  } catch (err) {
    console.error('Update reputation error:', err);
    sendError(res, 500, 'Failed to update reputation', err.message);
  }
});

/**
 * @swagger
 * /reputation/kyc/verify:
 *   post:
 *     summary: Verify KYC for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *             properties:
 *               user:
 *                 type: string
 *                 description: User address
 *     responses:
 *       200:
 *         description: KYC verified successfully
 */
router.post('/kyc/verify', async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return sendError(res, 400, 'User address is required');
    }

    const result = await reputationService.verifyKYC(user);
    res.json(result);
  } catch (err) {
    console.error('KYC verification error:', err);
    sendError(res, 500, 'Failed to verify KYC', err.message);
  }
});

/**
 * @swagger
 * /reputation/kyc/status/{user}:
 *   get:
 *     summary: Check KYC verification status
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *     responses:
 *       200:
 *         description: KYC status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verified:
 *                   type: boolean
 *                 verifiedAt:
 *                   type: number
 */
router.get('/kyc/status/:user', async (req, res) => {
  try {
    const { user } = req.params;
    if (!user) {
      return sendError(res, 400, 'User address is required');
    }

    const [verified, verifiedAt] = await Promise.all([
      reputationService.isKYCVerified(user),
      reputationService.getKYCVerifiedAt(user),
    ]);

    res.json({
      verified,
      verifiedAt: verifiedAt !== '0' ? parseInt(verifiedAt) : null,
    });
  } catch (err) {
    console.error('Get KYC status error:', err);
    sendError(res, 500, 'Failed to get KYC status', err.message);
  }
});

/**
 * @swagger
 * /reputation/badges/{user}:
 *   get:
 *     summary: Get user badges
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Get only active badges
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/badges/:user', async (req, res) => {
  try {
    const { user } = req.params;
    const { active } = req.query;

    if (!user) {
      return sendError(res, 400, 'User address is required');
    }

    const badges =
      active === 'true'
        ? await reputationService.getActiveBadges(user)
        : await reputationService.getUserBadges(user);

    res.json({ badges });
  } catch (err) {
    console.error('Get user badges error:', err);
    sendError(res, 500, 'Failed to get user badges', err.message);
  }
});

/**
 * @swagger
 * /reputation/badges/issue:
 *   post:
 *     summary: Issue a badge to a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - badgeType
 *               - level
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: Recipient address
 *               badgeType:
 *                 type: number
 *                 description: Badge type (0-5)
 *               level:
 *                 type: number
 *                 description: Badge level (0-3)
 *               expiresAt:
 *                 type: number
 *                 description: Expiration timestamp (0 for no expiration)
 *               metadata:
 *                 type: string
 *                 description: Badge metadata URI
 *     responses:
 *       200:
 *         description: Badge issued successfully
 */
router.post('/badges/issue', async (req, res) => {
  try {
    const {
      recipient,
      badgeType,
      level,
      expiresAt = 0,
      metadata = '',
    } = req.body;

    if (!recipient || badgeType === undefined || level === undefined) {
      return sendError(
        res,
        400,
        'Recipient, badge type, and level are required'
      );
    }

    const result = await reputationService.issueBadge(
      recipient,
      badgeType,
      level,
      expiresAt,
      metadata
    );
    res.json(result);
  } catch (err) {
    console.error('Issue badge error:', err);
    sendError(res, 500, 'Failed to issue badge', err.message);
  }
});

/**
 * @swagger
 * /reputation/badges/revoke:
 *   post:
 *     summary: Revoke a badge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: number
 *                 description: Badge token ID
 *     responses:
 *       200:
 *         description: Badge revoked successfully
 */
router.post('/badges/revoke', async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (tokenId === undefined) {
      return sendError(res, 400, 'Token ID is required');
    }

    const result = await reputationService.revokeBadge(tokenId);
    res.json(result);
  } catch (err) {
    console.error('Revoke badge error:', err);
    sendError(res, 500, 'Failed to revoke badge', err.message);
  }
});

/**
 * @swagger
 * /reputation/badges/{tokenId}:
 *   get:
 *     summary: Get badge details
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: number
 *         description: Badge token ID
 *     responses:
 *       200:
 *         description: Badge details retrieved successfully
 */
router.get('/badges/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return sendError(res, 400, 'Token ID is required');
    }

    const badge = await reputationService.getBadge(parseInt(tokenId));
    res.json(badge);
  } catch (err) {
    console.error('Get badge error:', err);
    sendError(res, 500, 'Failed to get badge', err.message);
  }
});

/**
 * @swagger
 * /reputation/badges/check/{user}/{badgeType}:
 *   get:
 *     summary: Check if user has a specific badge type
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *       - in: path
 *         name: badgeType
 *         required: true
 *         schema:
 *           type: number
 *         description: Badge type to check
 *     responses:
 *       200:
 *         description: Badge check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasBadge:
 *                   type: boolean
 */
router.get('/badges/check/:user/:badgeType', async (req, res) => {
  try {
    const { user, badgeType } = req.params;

    if (!user || badgeType === undefined) {
      return sendError(res, 400, 'User address and badge type are required');
    }

    const hasBadge = await reputationService.hasBadge(
      user,
      parseInt(badgeType)
    );
    res.json({ hasBadge });
  } catch (err) {
    console.error('Check badge error:', err);
    sendError(res, 500, 'Failed to check badge', err.message);
  }
});

/**
 * @swagger
 * /reputation/requirements/{badgeType}:
 *   get:
 *     summary: Get badge requirements
 *     parameters:
 *       - in: path
 *         name: badgeType
 *         required: true
 *         schema:
 *           type: number
 *         description: Badge type
 *     responses:
 *       200:
 *         description: Badge requirements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requirements:
 *                   type: number
 */
router.get('/requirements/:badgeType', async (req, res) => {
  try {
    const { badgeType } = req.params;

    if (badgeType === undefined) {
      return sendError(res, 400, 'Badge type is required');
    }

    const requirements = await reputationService.getBadgeRequirements(
      parseInt(badgeType)
    );
    res.json({ requirements: parseInt(requirements) });
  } catch (err) {
    console.error('Get badge requirements error:', err);
    sendError(res, 500, 'Failed to get badge requirements', err.message);
  }
});

/**
 * @swagger
 * /reputation/calculate:
 *   post:
 *     summary: Calculate reputation score based on user activity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notarizations:
 *                 type: number
 *                 description: Number of document notarizations
 *               successfulTransactions:
 *                 type: number
 *                 description: Number of successful transactions
 *               daysOnPlatform:
 *                 type: number
 *                 description: Days on platform
 *               communityContributions:
 *                 type: number
 *                 description: Number of community contributions
 *               failedTransactions:
 *                 type: number
 *                 description: Number of failed transactions
 *               disputes:
 *                 type: number
 *                 description: Number of disputes
 *     responses:
 *       200:
 *         description: Reputation score calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 */
router.post('/calculate', async (req, res) => {
  try {
    const userActivity = req.body;
    const score = reputationService.calculateReputationScore(userActivity);
    res.json({ score });
  } catch (err) {
    console.error('Calculate reputation error:', err);
    sendError(res, 500, 'Failed to calculate reputation', err.message);
  }
});

module.exports = router;
