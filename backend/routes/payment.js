const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const receiptNftService = require('../services/receiptNftService');

/**
 * @swagger
 * /payment/escrow:
 *   post:
 *     summary: Create a new escrow payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payee
 *               - amount
 *               - documentHash
 *             properties:
 *               payee:
 *                 type: string
 *                 description: Payee address
 *               amount:
 *                 type: string
 *                 description: Amount in wei
 *               documentHash:
 *                 type: string
 *                 description: Document hash
 *     responses:
 *       200:
 *         description: Escrow created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 escrowId:
 *                   type: integer
 */
// POST /payment/escrow - create escrow
router.post('/escrow', async (req, res) => {
  try {
    const { payee, amount, documentHash } = req.body;
    if (!payee || !amount || !documentHash)
      return res
        .status(400)
        .json({ error: 'payee, amount, and documentHash required' });
    const escrowId = await paymentService.createEscrow(
      payee,
      amount,
      documentHash
    );
    res.json({ escrowId: escrowId.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/release:
 *   post:
 *     summary: Release escrow to payee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - escrowId
 *             properties:
 *               escrowId:
 *                 type: integer
 *                 description: Escrow ID
 *     responses:
 *       200:
 *         description: Escrow released
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
// POST /payment/release - release escrow
router.post('/release', async (req, res) => {
  try {
    const { escrowId } = req.body;
    if (escrowId === undefined)
      return res.status(400).json({ error: 'escrowId required' });
    await paymentService.releaseEscrow(escrowId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/refund:
 *   post:
 *     summary: Refund escrow to payer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - escrowId
 *             properties:
 *               escrowId:
 *                 type: integer
 *                 description: Escrow ID
 *     responses:
 *       200:
 *         description: Escrow refunded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
// POST /payment/refund - refund escrow
router.post('/refund', async (req, res) => {
  try {
    const { escrowId } = req.body;
    if (escrowId === undefined)
      return res.status(400).json({ error: 'escrowId required' });
    await paymentService.refundEscrow(escrowId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/escrow/{id}:
 *   get:
 *     summary: Get escrow details
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Escrow ID
 *     responses:
 *       200:
 *         description: Escrow details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 escrow:
 *                   type: object
 *                   properties:
 *                     payer:
 *                       type: string
 *                     payee:
 *                       type: string
 *                     amount:
 *                       type: string
 *                     isReleased:
 *                       type: boolean
 *                     isRefunded:
 *                       type: boolean
 */
// GET /payment/escrow/:id - get escrow details
router.get('/escrow/:id', async (req, res) => {
  try {
    const escrow = await paymentService.getEscrow(req.params.id);
    // Convert BigNumber/BigInt to string for amount
    res.json({
      escrow: {
        payer: escrow.payer,
        payee: escrow.payee,
        amount: escrow.amount.toString(),
        isReleased: escrow.isReleased,
        isRefunded: escrow.isRefunded,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/mint-receipt:
 *   post:
 *     summary: Mint a receipt NFT for a notarized document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - documentHash
 *               - tokenURI
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient address
 *               documentHash:
 *                 type: string
 *                 description: Document hash (bytes32)
 *               tokenURI:
 *                 type: string
 *                 description: Token metadata URI
 *     responses:
 *       200:
 *         description: NFT minted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokenId:
 *                   type: string
 */
router.post('/mint-receipt', async (req, res) => {
  try {
    const { to, documentHash, tokenURI } = req.body;
    if (!to || !documentHash || !tokenURI)
      return res
        .status(400)
        .json({ error: 'to, documentHash, and tokenURI required' });
    const tokenId = await receiptNftService.mintReceipt(
      to,
      documentHash,
      tokenURI
    );
    res.json({ tokenId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/mint-receipt-enhanced:
 *   post:
 *     summary: Mint a receipt NFT with enhanced metadata
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - documentHash
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient address
 *               documentHash:
 *                 type: string
 *                 description: Document hash (bytes32)
 *               documentName:
 *                 type: string
 *                 description: Name of the document
 *               imageUrl:
 *                 type: string
 *                 description: Optional image URL for the NFT
 *               description:
 *                 type: string
 *                 description: Custom description for the NFT
 *     responses:
 *       200:
 *         description: NFT minted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tokenId:
 *                   type: string
 *                 tokenURI:
 *                   type: string
 *                 metadata:
 *                   type: object
 *                 transactionHash:
 *                   type: string
 */
router.post('/mint-receipt-enhanced', async (req, res) => {
  try {
    const { to, documentHash, documentName, imageUrl, description } = req.body;
    if (!to || !documentHash) {
      return res
        .status(400)
        .json({ error: 'to and documentHash are required' });
    }

    const result = await receiptNftService.mintReceiptWithMetadata(
      to,
      documentHash,
      {
        documentName,
        imageUrl,
        description,
      }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/nfts/{owner}:
 *   get:
 *     summary: Get all NFTs owned by an address
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner address
 *     responses:
 *       200:
 *         description: NFTs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nfts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tokenId:
 *                         type: string
 *                       tokenURI:
 *                         type: string
 *                       documentHash:
 *                         type: string
 *                       metadata:
 *                         type: object
 */
router.get('/nfts/:owner', async (req, res) => {
  try {
    const { owner } = req.params;
    if (!owner) {
      return res.status(400).json({ error: 'Owner address is required' });
    }

    const nfts = await receiptNftService.getNftsByOwner(owner);
    res.json({ nfts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payment/nft-metadata:
 *   post:
 *     summary: Get NFT metadata from IPFS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenURI
 *             properties:
 *               tokenURI:
 *                 type: string
 *                 description: Token metadata URI
 *     responses:
 *       200:
 *         description: Metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 */
router.post('/nft-metadata', async (req, res) => {
  try {
    const { tokenURI } = req.body;
    if (!tokenURI) {
      return res.status(400).json({ error: 'tokenURI is required' });
    }

    const metadata = await receiptNftService.getNftMetadata(tokenURI);
    res.json({ metadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
