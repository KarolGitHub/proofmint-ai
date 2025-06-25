const express = require('express');
const router = express.Router();

// @route   POST /ai/summarize
// @desc    Summarize the document content using AI
// @access  Public
router.post('/summarize', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ msg: 'Text is required for summarization' });
    }
    // AI service call will go here
    console.log('Summarizing text:', text.substring(0, 100));
    res.json({ summary: 'This is a placeholder summary.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /ai/metadata
// @desc    Extract structured metadata from document content using AI
// @access  Public
router.post('/metadata', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ msg: 'Text is required for metadata extraction' });
    }
    const openaiService = require('../services/openaiService');
    const metadata = await openaiService.extractMetadata(text);
    res.json(metadata);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
