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

const app = express();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['*'];
    if (
      allowedOrigins.includes('*') ||
      !origin ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
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

// Root endpoint
app.get('/', (req, res) => {
  res.send('ProofMintAI Backend is running!');
});

// Health check endpoint for event listener
app.get('/health', async (req, res) => {
  try {
    const listenerStatus = getListenerStatus();
    const providerStatus = await testProviderConnection();

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
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

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
      'API documentation for ProofMintAI backend, including payment/escrow endpoints.',
  },
  servers: [
    {
      url:
        'http://localhost:' +
        (process.env.PORT || process.env.BACKEND_PORT || 3001),
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/payment.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
