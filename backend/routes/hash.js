const express = require('express');
const router = express.Router();

// @route   POST /hash/document
// @desc    Generate a SHA-256 hash of a document
// @access  Public
router.post('/document', (req, res) => {
  res.json({ msg: 'Document hashing placeholder' });
});

module.exports = router;
