const express = require('express');
const router = express.Router();

// @route   POST /ocr/extract
// @desc    Extract text from an uploaded document
// @access  Public
router.post('/extract', (req, res) => {
  res.json({ msg: 'OCR text extraction placeholder' });
});

module.exports = router;
