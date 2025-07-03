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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ai', aiRoutes);
app.use('/ipfs', ipfsRoutes);
app.use('/ocr', ocrRoutes);
app.use('/hash', hashRoutes);
app.use('/payment', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('ProofMintAI Backend is running!');
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
