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
    const { text, provider = 'openai', language = 'en' } = req.body;
    if (!text) {
      return sendError(res, 400, 'Text is required for metadata extraction');
    }
    const openaiService = require('../services/openaiService');
    const metadata = await openaiService.extractMetadata(
      text,
      provider,
      language
    );
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
    const { text, provider = 'openai', language = 'en' } = req.body;
    if (!text) {
      return sendError(res, 400, 'Text is required for clause extraction');
    }
    const openaiService = require('../services/openaiService');
    const clauses = await openaiService.extractClauses(
      text,
      provider,
      language
    );
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
    const { text, provider = 'openai', language = 'en' } = req.body;
    if (!text) {
      return sendError(
        res,
        400,
        'Text is required for document classification'
      );
    }
    const openaiService = require('../services/openaiService');
    const docType = await openaiService.classifyDocumentType(
      text,
      provider,
      language
    );
    res.json(docType);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/metadata/batch
// @desc    Extract structured metadata from multiple documents using AI
// @access  Public
router.post('/metadata/batch', async (req, res) => {
  try {
    const { texts, provider = 'openai', language = 'en' } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      return sendError(
        res,
        400,
        'An array of texts is required for batch metadata extraction'
      );
    }
    const openaiService = require('../services/openaiService');
    const results = await Promise.all(
      texts.map((text) =>
        openaiService.extractMetadata(text, provider, language)
      )
    );
    res.json(results);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/clauses/batch
// @desc    Extract all clauses from multiple documents using AI
// @access  Public
router.post('/clauses/batch', async (req, res) => {
  try {
    const { texts, provider = 'openai', language = 'en' } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      return sendError(
        res,
        400,
        'An array of texts is required for batch clause extraction'
      );
    }
    const openaiService = require('../services/openaiService');
    const results = await Promise.all(
      texts.map((text) =>
        openaiService.extractClauses(text, provider, language)
      )
    );
    res.json(results);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

// @route   POST /ai/classify/batch
// @desc    Classify the type of multiple documents using AI
// @access  Public
router.post('/classify/batch', async (req, res) => {
  try {
    const { texts, provider = 'openai', language = 'en' } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      return sendError(
        res,
        400,
        'An array of texts is required for batch document classification'
      );
    }
    const openaiService = require('../services/openaiService');
    const results = await Promise.all(
      texts.map((text) =>
        openaiService.classifyDocumentType(text, provider, language)
      )
    );
    res.json(results);
  } catch (err) {
    console.error(err.message);
    sendError(res, 500, 'Server Error', err.message);
  }
});

module.exports = router;
