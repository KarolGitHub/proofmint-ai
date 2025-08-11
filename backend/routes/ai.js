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

/**
 * @swagger
 * /ai/dashboard/stats:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get AI dashboard statistics
 *     description: Retrieve comprehensive statistics for the AI dashboard
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDocuments:
 *                   type: number
 *                   description: Total number of processed documents
 *                 processingRate:
 *                   type: number
 *                   description: Processing success rate (0-1)
 *                 aiAccuracy:
 *                   type: number
 *                   description: AI model accuracy percentage
 *                 avgProcessingTime:
 *                   type: number
 *                   description: Average processing time in seconds
 *                 activeModels:
 *                   type: number
 *                   description: Number of active AI models
 *                 modelHealth:
 *                   type: string
 *                   description: Overall model health status
 *       500:
 *         description: Server error
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    // TODO: Replace with actual database queries
    const stats = {
      totalDocuments: 1247,
      processingRate: 0.87,
      aiAccuracy: 94.2,
      confidenceLevel: 'High',
      avgProcessingTime: 2.3,
      activeModels: 5,
      modelHealth: 'Excellent',
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    sendError(res, 500, 'Failed to fetch dashboard statistics');
  }
});

/**
 * @swagger
 * /ai/dashboard/models:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get AI model status and performance
 *     description: Retrieve status and performance metrics for all AI models
 *     responses:
 *       200:
 *         description: AI model status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the AI model
 *                   status:
 *                     type: string
 *                     description: Current status (active/inactive)
 *                   description:
 *                     type: string
 *                     description: Model description
 *                   performance:
 *                     type: number
 *                     description: Performance score (0-1)
 *       500:
 *         description: Server error
 */
router.get('/dashboard/models', async (req, res) => {
  try {
    // TODO: Replace with actual model monitoring
    const models = [
      {
        name: 'Document Classifier',
        status: 'active',
        description: 'Automatically categorizes document types',
        performance: 0.96,
      },
      {
        name: 'Text Extractor',
        status: 'active',
        description: 'Extracts text from various document formats',
        performance: 0.89,
      },
      {
        name: 'Content Analyzer',
        status: 'active',
        description: 'Analyzes document content and context',
        performance: 0.92,
      },
      {
        name: 'Language Detector',
        status: 'active',
        description: 'Detects document language automatically',
        performance: 0.98,
      },
      {
        name: 'Sentiment Analyzer',
        status: 'active',
        description: 'Analyzes document sentiment and tone',
        performance: 0.85,
      },
    ];

    res.json(models);
  } catch (error) {
    console.error('Error fetching AI models:', error);
    sendError(res, 500, 'Failed to fetch AI model status');
  }
});

/**
 * @swagger
 * /ai/dashboard/analytics:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get AI analytics data
 *     description: Retrieve analytics data for document types and confidence levels
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentTypes:
 *                   type: array
 *                   description: Document type distribution
 *                 confidenceLevels:
 *                   type: array
 *                   description: AI confidence level distribution
 *                 processingTrends:
 *                   type: array
 *                   description: Processing trends over time
 *       500:
 *         description: Server error
 */
router.get('/dashboard/analytics', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;

    // TODO: Replace with actual analytics queries based on timeRange
    const analytics = {
      documentTypes: [
        { type: 'Legal Documents', icon: 'gavel', count: 456, percentage: 37 },
        {
          type: 'Financial Reports',
          icon: 'account_balance',
          count: 234,
          percentage: 19,
        },
        { type: 'Contracts', icon: 'description', count: 189, percentage: 15 },
        { type: 'Invoices', icon: 'receipt', count: 156, percentage: 13 },
        { type: 'Other', icon: 'folder', count: 212, percentage: 17 },
      ],
      confidenceLevels: [
        { level: 'Very High (90-100%)', count: 567, percentage: 45 },
        { level: 'High (80-89%)', count: 423, percentage: 34 },
        { level: 'Medium (70-79%)', count: 189, percentage: 15 },
        { level: 'Low (60-69%)', count: 68, percentage: 5 },
      ],
      processingTrends: [
        { date: '2024-01-01', documents: 45, accuracy: 92.3 },
        { date: '2024-01-02', documents: 52, accuracy: 94.1 },
        { date: '2024-01-03', documents: 38, accuracy: 91.8 },
        { date: '2024-01-04', documents: 61, accuracy: 95.2 },
        { date: '2024-01-05', documents: 47, accuracy: 93.7 },
      ],
      timeRange,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    sendError(res, 500, 'Failed to fetch analytics data');
  }
});

/**
 * @swagger
 * /ai/dashboard/activities:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get recent AI activities
 *     description: Retrieve recent AI processing activities and events
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Activity identifier
 *                   type:
 *                     type: string
 *                     description: Type of activity
 *                   title:
 *                     type: string
 *                     description: Activity title
 *                   description:
 *                     type: string
 *                     description: Activity description
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: When the activity occurred
 *       500:
 *         description: Server error
 */
router.get('/dashboard/activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // TODO: Replace with actual activity log queries
    const activities = [
      {
        id: '1',
        type: 'classification',
        title: 'Document classified as Legal Contract',
        description: 'AI successfully categorized document with 94% confidence',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'extraction',
        title: 'Text extracted from PDF',
        description: 'OCR processing completed for 15-page document',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'analysis',
        title: 'Content analysis completed',
        description: 'AI identified key clauses and risk factors',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'validation',
        title: 'Document validation successful',
        description: 'All required fields verified and validated',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ].slice(0, parseInt(limit));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    sendError(res, 500, 'Failed to fetch recent activities');
  }
});

/**
 * @swagger
 * /ai/dashboard/settings:
 *   get:
 *     tags: [AI Analysis]
 *     summary: Get AI configuration settings
 *     description: Retrieve current AI configuration and settings
 *     responses:
 *       200:
 *         description: AI settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 model:
 *                   type: string
 *                   description: Selected AI model
 *                 priority:
 *                   type: string
 *                   description: Processing priority setting
 *                 confidenceThreshold:
 *                   type: number
 *                   description: Minimum confidence threshold
 *       500:
 *         description: Server error
 */
router.get('/dashboard/settings', async (req, res) => {
  try {
    // TODO: Replace with actual settings from database/config
    const settings = {
      model: 'gpt-4',
      priority: 'balanced',
      confidenceThreshold: 75,
      autoRetry: true,
      maxRetries: 3,
      timeout: 30000,
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    sendError(res, 500, 'Failed to fetch AI settings');
  }
});

/**
 * @swagger
 * /ai/dashboard/settings:
 *   put:
 *     tags: [AI Analysis]
 *     summary: Update AI configuration settings
 *     description: Update AI configuration and processing settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 description: AI model to use
 *               priority:
 *                 type: string
 *                 description: Processing priority
 *               confidenceThreshold:
 *                 type: number
 *                 description: Minimum confidence threshold
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 settings:
 *                   type: object
 *                   description: Updated settings
 *       400:
 *         description: Invalid settings data
 *       500:
 *         description: Server error
 */
router.put('/dashboard/settings', async (req, res) => {
  try {
    const { model, priority, confidenceThreshold } = req.body;

    // Validate input
    if (!model || !priority || confidenceThreshold === undefined) {
      return sendError(res, 400, 'Missing required settings fields');
    }

    if (confidenceThreshold < 0 || confidenceThreshold > 100) {
      return sendError(
        res,
        400,
        'Confidence threshold must be between 0 and 100'
      );
    }

    // TODO: Save settings to database/config
    const updatedSettings = {
      model,
      priority,
      confidenceThreshold,
      autoRetry: true,
      maxRetries: 3,
      timeout: 30000,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      message: 'AI settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    sendError(res, 500, 'Failed to update AI settings');
  }
});

module.exports = router;
