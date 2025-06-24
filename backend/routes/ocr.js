const express = require('express');
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
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
    const { originalname, mimetype, buffer } = req.file;
    let text = '';
    if (mimetype === 'application/pdf') {
      // Extract text from PDF
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (mimetype.startsWith('image/')) {
      // Extract text from image using Tesseract.js
      const { data } = await Tesseract.recognize(buffer, 'eng');
      text = data.text;
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
    res.json({ filename: originalname, size: req.file.size, mimetype, text });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || 'OCR/AI extraction failed' });
  }
});

module.exports = router;
