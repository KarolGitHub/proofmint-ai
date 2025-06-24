const express = require('express');
const router = express.Router();

// @route   POST /ipfs/upload
// @desc    Upload a file to IPFS
// @access  Public
router.post('/upload', (req, res) => {
  res.json({ msg: 'IPFS upload placeholder' });
});

module.exports = router;
