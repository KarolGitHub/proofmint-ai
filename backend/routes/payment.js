const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');

// POST /payment/escrow - create escrow
router.post('/escrow', async (req, res) => {
  try {
    const { payee, amount } = req.body;
    if (!payee || !amount)
      return res.status(400).json({ error: 'payee and amount required' });
    const escrowId = await paymentService.createEscrow(payee, amount);
    res.json({ escrowId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// GET /payment/escrow/:id - get escrow details
router.get('/escrow/:id', async (req, res) => {
  try {
    const escrow = await paymentService.getEscrow(req.params.id);
    res.json({ escrow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
