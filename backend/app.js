require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import routes
const aiRoutes = require('./routes/ai');
const ipfsRoutes = require('./routes/ipfs');
const ocrRoutes = require('./routes/ocr');
const hashRoutes = require('./routes/hash');
const paymentRoutes = require('./routes/payment');
const reputationRoutes = require('./routes/reputation');
const zkProofRoutes = require('./routes/zkproof');

// Import notary listener for health check
const {
  getListenerStatus,
  reconnect,
  testProviderConnection,
  testEventListener,
} = require('./services/notaryListener');

// Import contract loader for status
const { getContractStatus } = require('./services/contractLoader');

const app = express();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins for development, including Swagger UI
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Add additional headers for Swagger UI
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ai', aiRoutes);
app.use('/ipfs', ipfsRoutes);
app.use('/ocr', ocrRoutes);
app.use('/hash', hashRoutes);
app.use('/payment', paymentRoutes);
app.use('/reputation', reputationRoutes);
app.use('/zkproof', zkProofRoutes);

// Root endpoint now serves Swagger UI

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System health and monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Get system health status
 *     description: Comprehensive health check including event listener status and blockchain connectivity
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 eventListener:
 *                   type: object
 *                   description: Event listener status
 *                 provider:
 *                   type: object
 *                   description: Blockchain provider status
 *                 environment:
 *                   type: object
 *                   description: Environment configuration status
 *       500:
 *         description: System error
 */
// Health check endpoint for event listener
app.get('/health', async (req, res) => {
  try {
    const listenerStatus = getListenerStatus();
    const providerStatus = await testProviderConnection();
    const contractStatus = getContractStatus();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      eventListener: listenerStatus,
      provider: providerStatus,
      environment: {
        notaryAddress: process.env.NOTARY_CONTRACT_ADDRESS
          ? 'configured'
          : 'not configured',
        escrowAddress: process.env.PAYMENT_ESCROW_ADDRESS
          ? 'configured'
          : 'not configured',
        rpcUrl: process.env.AMOY_RPC_URL ? 'configured' : 'not configured',
        privateKey: process.env.PRIVATE_KEY ? 'configured' : 'not configured',
      },
      contracts: contractStatus,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /test-provider:
 *   get:
 *     tags: [System]
 *     summary: Test blockchain provider connection
 *     description: Test the connection to the blockchain RPC provider
 *     responses:
 *       200:
 *         description: Provider connection test completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 connected:
 *                   type: boolean
 *                   description: Whether the provider is connected
 *                 network:
 *                   type: object
 *                   description: Network information
 *       500:
 *         description: Provider connection failed
 */
// Provider connection test endpoint
app.get('/test-provider', async (req, res) => {
  try {
    const providerStatus = await testProviderConnection();
    res.json({
      timestamp: new Date().toISOString(),
      ...providerStatus,
    });
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /test-listener:
 *   get:
 *     tags: [System]
 *     summary: Test event listener functionality
 *     description: Test if the blockchain event listener is working properly
 *     responses:
 *       200:
 *         description: Event listener test completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 working:
 *                   type: boolean
 *                   description: Whether the event listener is working
 *                 latestBlock:
 *                   type: number
 *                   description: Latest blockchain block number
 *                 recentEvents:
 *                   type: number
 *                   description: Number of recent events found
 *       500:
 *         description: Event listener test failed
 */
// Event listener test endpoint
app.get('/test-listener', async (req, res) => {
  try {
    const listenerStatus = await testEventListener();
    res.json({
      timestamp: new Date().toISOString(),
      ...listenerStatus,
    });
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /reconnect:
 *   post:
 *     tags: [System]
 *     summary: Manually reconnect event listener
 *     description: Trigger a manual reconnection of the blockchain event listener
 *     responses:
 *       200:
 *         description: Reconnection initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "reconnecting"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: "Event listener reconnection initiated"
 *       500:
 *         description: Reconnection failed
 */
// Manual reconnection endpoint for debugging
app.post('/reconnect', (req, res) => {
  try {
    console.log('Manual reconnection requested via API');
    reconnect();
    res.json({
      status: 'reconnecting',
      timestamp: new Date().toISOString(),
      message: 'Event listener reconnection initiated',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ProofMintAI Backend API',
    version: '1.0.0',
    description:
      'Complete API documentation for ProofMintAI backend, including AI analysis, IPFS storage, blockchain operations, payments, reputation, and ZK-proofs.',
  },
  servers: [
    {
      url:
        'http://localhost:' +
        (process.env.PORT || process.env.BACKEND_PORT || 3001),
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'AI Analysis',
      description: 'AI-powered document analysis and processing',
    },
    {
      name: 'IPFS Storage',
      description: 'Decentralized file storage and encryption',
    },
    {
      name: 'OCR Processing',
      description: 'Optical Character Recognition services',
    },
    {
      name: 'Document Hashing',
      description: 'Document hashing and blockchain notarization',
    },
    {
      name: 'Payment & Escrow',
      description: 'Payment processing and escrow management',
    },
    {
      name: 'Reputation & KYC',
      description: 'User reputation and KYC badge management',
    },
    {
      name: 'ZK Proofs',
      description: 'Zero-knowledge proof operations',
    },
    {
      name: 'System',
      description: 'System health and monitoring endpoints',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './routes/*.js', // All route files
  ],
  explorer: true, // Enable the explorer interface
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI at root path for easy access
app.use('/', swaggerUi.serve);
app.get(
  '/',
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ProofMintAI API Documentation',
  })
);

// Also keep the /api-docs endpoint for backward compatibility
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ProofMintAI API Documentation',
  })
);

const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📚 API documentation available at: http://localhost:${PORT}/`);

  // Show contract status
  try {
    const contractStatus = getContractStatus();
    console.log('📋 Contract Status:');
    Object.entries(contractStatus).forEach(([contract, status]) => {
      const icon = status.available ? '✅' : '❌';
      const source = status.source || 'none';
      console.log(`  ${icon} ${contract}: ${source}`);
    });
  } catch (error) {
    console.log('⚠️  Could not determine contract status');
  }
});
