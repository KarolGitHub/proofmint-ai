const express = require('express');
const router = express.Router();
const { sendError } = require('../utils/errorResponse');

// Add CORS headers for AI routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

/**
 * @swagger
 * tags:
 *   name: AI Analysis
 *   description: AI-powered document analysis and processing
 */

/**
 * @swagger
 * /ai/summarize:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Summarize document content using AI
 *     description: Generate a concise summary of the provided text content
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to summarize
 *                 example: "This is a long document that needs to be summarized..."
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *                   description: The generated summary
 *                   example: "This document discusses..."
 *       400:
 *         description: Bad request - text is required
 *       500:
 *         description: Server error
 */
// @route   POST /ai/summarize
// @desc    Summarize the document content using AI
// @access  Public
router.post('/summarize', (req, res) => {
  console.log('AI summarize endpoint called');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    const { text } = req.body;
    if (!text) {
      console.log('No text provided in request');
      return sendError(res, 400, 'Text is required for summarization');
    }

    console.log('Text received:', text.substring(0, 100) + '...');

    // AI service call will go here
    console.log('Generating placeholder summary');
    res.json({ summary: 'This is a placeholder summary.' });
  } catch (err) {
    console.error('Error in summarize endpoint:', err);
    sendError(res, 500, 'Server Error', err.message);
  }
});

/**
 * @swagger
 * /ai/metadata:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Extract structured metadata from document content
 *     description: Use AI to extract structured metadata like dates, names, amounts, etc.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to analyze
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the text (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Metadata extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   description: Extracted metadata
 *       400:
 *         description: Bad request - text is required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /ai/clauses:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Extract clauses from document content
 *     description: Use AI to identify and extract legal or contractual clauses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to analyze
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the text (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Clauses extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clauses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         description: Type of clause
 *                       content:
 *                         type: string
 *                         description: Clause content
 *       400:
 *         description: Bad request - text is required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /ai/classify:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Classify document type using AI
 *     description: Use AI to determine the type/category of a document
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to classify
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the text (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Document classified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentType:
 *                   type: string
 *                   description: The classified document type
 *                 confidence:
 *                   type: number
 *                   description: Confidence score of the classification
 *       400:
 *         description: Bad request - text is required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /ai/metadata/batch:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Extract metadata from multiple documents
 *     description: Process multiple documents in batch for metadata extraction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texts
 *             properties:
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of text contents to analyze
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the texts (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Batch processing completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         description: Original text
 *                       metadata:
 *                         type: object
 *                         description: Extracted metadata
 *       400:
 *         description: Bad request - texts array is required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /ai/clauses/batch:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Extract clauses from multiple documents
 *     description: Process multiple documents in batch for clause extraction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texts
 *             properties:
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of text contents to analyze
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the texts (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Batch processing completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         description: Original text
 *                       clauses:
 *                         type: array
 *                         description: Extracted clauses
 *       400:
 *         description: Bad request - texts array is required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /ai/classify/batch:
 *   post:
 *     tags: [AI Analysis]
 *     summary: Classify multiple documents
 *     description: Process multiple documents in batch for document classification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - texts
 *             properties:
 *               texts:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of text contents to classify
 *               provider:
 *                 type: string
 *                 description: AI provider to use (default: openai)
 *                 enum: [openai, claude]
 *                 default: openai
 *               language:
 *                 type: string
 *                 description: Language of the texts (default: en)
 *                 default: en
 *     responses:
 *       200:
 *         description: Batch processing completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       text:
 *                         type: string
 *                         description: Original text
 *                       documentType:
 *                         type: string
 *                         description: Classified document type
 *                       confidence:
 *                         type: number
 *                         description: Confidence score of the classification
 *       400:
 *         description: Bad request - texts array is required
 *       500:
 *         description: Server error
 */
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
