const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up multer for file uploads (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /ocr/extract
// @desc    Extract text from an uploaded document
// @access  Public
router.post('/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Placeholder: In a real app, call Tesseract.js or AI service here
    // For now, just return file info and a fake result
    const fakeResult = {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      text: 'This is a placeholder OCR/AI result. Replace with real extraction.',
    };
    res.json(fakeResult);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || 'OCR/AI extraction failed' });
  }
});

module.exports = router;
