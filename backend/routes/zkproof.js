const express = require('express');
const router = express.Router();
const zkProofService = require('../services/zkProofService');
const { sendError } = require('../utils/errorResponse');

/**
 * @swagger
 * /zkproof/create:
 *   post:
 *     summary: Create a new ZK proof commitment
 *     tags: [ZK Proof]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentHash
 *               - privateKey
 *             properties:
 *               documentHash:
 *                 type: string
 *                 description: Hash of the document to prove
 *               privateKey:
 *                 type: string
 *                 description: User's private key for signing
 *     responses:
 *       200:
 *         description: ZK proof created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 proofId:
 *                   type: string
 *                 commitment:
 *                   type: string
 *                 nullifier:
 *                   type: string
 *                 salt:
 *                   type: string
 *                 secret:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/create', async (req, res) => {
  try {
    const { documentHash, privateKey } = req.body;

    if (!documentHash || !privateKey) {
      return sendError(res, 400, 'Document hash and private key are required');
    }

    // Generate salt and secret for privacy
    const salt = zkProofService.generateSalt();
    const secret = zkProofService.generateSecret();

    const result = await zkProofService.createZKProof(
      documentHash,
      salt,
      secret,
      privateKey
    );

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating ZK proof:', error);
    sendError(res, 500, 'Failed to create ZK proof');
  }
});

/**
 * @swagger
 * /zkproof/verify:
 *   post:
 *     summary: Verify a ZK proof
 *     tags: [ZK Proof]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proofId
 *               - proofData
 *               - privateKey
 *             properties:
 *               proofId:
 *                 type: string
 *                 description: ID of the proof to verify
 *               proofData:
 *                 type: string
 *                 description: Additional proof data
 *               privateKey:
 *                 type: string
 *                 description: Verifier's private key
 *     responses:
 *       200:
 *         description: ZK proof verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isValid:
 *                   type: boolean
 *                 proofId:
 *                   type: string
 *                 owner:
 *                   type: string
 *                 commitment:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/verify', async (req, res) => {
  try {
    const { proofId, proofData, privateKey } = req.body;

    if (!proofId || !privateKey) {
      return sendError(res, 400, 'Proof ID and private key are required');
    }

    const result = await zkProofService.verifyZKProof(
      proofId,
      proofData || '',
      privateKey
    );

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error verifying ZK proof:', error);
    sendError(res, 500, 'Failed to verify ZK proof');
  }
});

/**
 * @swagger
 * /zkproof/revoke:
 *   post:
 *     summary: Revoke a ZK proof
 *     tags: [ZK Proof]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proofId
 *               - privateKey
 *             properties:
 *               proofId:
 *                 type: string
 *                 description: ID of the proof to revoke
 *               privateKey:
 *                 type: string
 *                 description: Owner's private key
 *     responses:
 *       200:
 *         description: ZK proof revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 proofId:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/revoke', async (req, res) => {
  try {
    const { proofId, privateKey } = req.body;

    if (!proofId || !privateKey) {
      return sendError(res, 400, 'Proof ID and private key are required');
    }

    const result = await zkProofService.revokeZKProof(proofId, privateKey);

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error revoking ZK proof:', error);
    sendError(res, 500, 'Failed to revoke ZK proof');
  }
});

/**
 * @swagger
 * /zkproof/verification-request:
 *   post:
 *     summary: Create a verification request
 *     tags: [ZK Proof]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proofId
 *               - reason
 *               - privateKey
 *             properties:
 *               proofId:
 *                 type: string
 *                 description: ID of the proof to verify
 *               reason:
 *                 type: string
 *                 description: Reason for verification request
 *               privateKey:
 *                 type: string
 *                 description: Requester's private key
 *     responses:
 *       200:
 *         description: Verification request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requestId:
 *                   type: string
 *                 proofId:
 *                   type: string
 *                 reason:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/verification-request', async (req, res) => {
  try {
    const { proofId, reason, privateKey } = req.body;

    if (!proofId || !reason || !privateKey) {
      return sendError(
        res,
        400,
        'Proof ID, reason, and private key are required'
      );
    }

    const result = await zkProofService.createVerificationRequest(
      proofId,
      reason,
      privateKey
    );

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating verification request:', error);
    sendError(res, 500, 'Failed to create verification request');
  }
});

/**
 * @swagger
 * /zkproof/complete-verification:
 *   post:
 *     summary: Complete a verification request
 *     tags: [ZK Proof]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - isVerified
 *               - reason
 *               - privateKey
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the verification request
 *               isVerified:
 *                 type: boolean
 *                 description: Whether verification was successful
 *               reason:
 *                 type: string
 *                 description: Reason for the verification result
 *               privateKey:
 *                 type: string
 *                 description: Proof owner's private key
 *     responses:
 *       200:
 *         description: Verification request completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 requestId:
 *                   type: string
 *                 isVerified:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/complete-verification', async (req, res) => {
  try {
    const { requestId, isVerified, reason, privateKey } = req.body;

    if (!requestId || !privateKey) {
      return sendError(res, 400, 'Request ID and private key are required');
    }

    const result = await zkProofService.completeVerificationRequest(
      requestId,
      isVerified,
      reason,
      privateKey
    );

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error completing verification request:', error);
    sendError(res, 500, 'Failed to complete verification request');
  }
});

/**
 * @swagger
 * /zkproof/user-proofs/{address}:
 *   get:
 *     summary: Get all proofs for a user
 *     tags: [ZK Proof]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: User's wallet address
 *     responses:
 *       200:
 *         description: User's proofs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 proofs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       proofId:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       commitment:
 *                         type: string
 *                       nullifier:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                       isValid:
 *                         type: boolean
 *                       isRevoked:
 *                         type: boolean
 *                 count:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/user-proofs/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return sendError(res, 400, 'User address is required');
    }

    const result = await zkProofService.getUserProofs(address);

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting user proofs:', error);
    sendError(res, 500, 'Failed to get user proofs');
  }
});

/**
 * @swagger
 * /zkproof/proof/{proofId}:
 *   get:
 *     summary: Get proof details
 *     tags: [ZK Proof]
 *     parameters:
 *       - in: path
 *         name: proofId
 *         required: true
 *         schema:
 *           type: string
 *         description: Proof ID
 *     responses:
 *       200:
 *         description: Proof details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 proof:
 *                   type: object
 *                   properties:
 *                     proofId:
 *                       type: string
 *                     owner:
 *                       type: string
 *                     commitment:
 *                       type: string
 *                     nullifier:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     isValid:
 *                       type: boolean
 *                     isRevoked:
 *                       type: boolean
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/proof/:proofId', async (req, res) => {
  try {
    const { proofId } = req.params;

    if (!proofId) {
      return sendError(res, 400, 'Proof ID is required');
    }

    const result = await zkProofService.getProofDetails(proofId);

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting proof details:', error);
    sendError(res, 500, 'Failed to get proof details');
  }
});

/**
 * @swagger
 * /zkproof/verification-request/{requestId}:
 *   get:
 *     summary: Get verification request details
 *     tags: [ZK Proof]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Verification request details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                     requester:
 *                       type: string
 *                     proofId:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     verificationReason:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/verification-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return sendError(res, 400, 'Request ID is required');
    }

    const result = await zkProofService.getVerificationRequestDetails(
      requestId
    );

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting verification request details:', error);
    sendError(res, 500, 'Failed to get verification request details');
  }
});

/**
 * @swagger
 * /zkproof/total:
 *   get:
 *     summary: Get total number of proofs
 *     tags: [ZK Proof]
 *     responses:
 *       200:
 *         description: Total proofs count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.get('/total', async (req, res) => {
  try {
    const result = await zkProofService.getTotalProofs();

    if (!result.success) {
      return sendError(res, 400, result.error);
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting total proofs:', error);
    sendError(res, 500, 'Failed to get total proofs');
  }
});

module.exports = router;
