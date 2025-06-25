const express = require('express');
const router = express.Router();
const { sendError } = require('../utils/errorResponse');

// @route   POST /ai/summarize
// @desc    Summarize the document content using AI
// @access  Public
router.post('/summarize', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return sendError(res, 400, 'Text is required for summarization');
    }
    // AI service call will go here
    console.log('Summarizing text:', text.substring(0, 100));
    res.json({ summary: 'This is a placeholder summary.' });
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/metadata
// @desc    Extract structured metadata from document content using AI
// @access  Public
router.post('/metadata', async (req, res) => {
  try {
    const { text, provider = 'openai' } = req.body;
    if (!text) {
      return sendError(res, 400, 'Text is required for metadata extraction');
    }
    const openaiService = require('../services/openaiService');
    const metadata = await openaiService.extractMetadata(text, provider);
    res.json(metadata);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/clauses
// @desc    Extract all clauses from document content using AI
// @access  Public
router.post('/clauses', async (req, res) => {
  try {
    const { text, provider = 'openai' } = req.body;
    if (!text) {
      return sendError(res, 400, 'Text is required for clause extraction');
    }
    const openaiService = require('../services/openaiService');
    const clauses = await openaiService.extractClauses(text, provider);
    res.json(clauses);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/classify
// @desc    Classify the type of document using AI
// @access  Public
router.post('/classify', async (req, res) => {
  try {
    const { text, provider = 'openai' } = req.body;
    if (!text) {
      return sendError(
        res,
        400,
        'Text is required for document classification'
      );
    }
    const openaiService = require('../services/openaiService');
    const docType = await openaiService.classifyDocumentType(text, provider);
    res.json(docType);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

module.exports = router;
