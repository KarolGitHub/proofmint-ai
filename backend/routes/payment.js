const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

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
 *             properties:
 *               payee:
 *                 type: string
 *                 description: Payee address
 *               amount:
 *                 type: string
 *                 description: Amount in wei
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
    const { payee, amount } = req.body;
    if (!payee || !amount)
      return res.status(400).json({ error: 'payee and amount required' });
    const escrowId = await paymentService.createEscrow(payee, amount);
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

module.exports = router;
