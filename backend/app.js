require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const aiRoutes = require('./routes/ai');
const ipfsRoutes = require('./routes/ipfs');
const ocrRoutes = require('./routes/ocr');
const hashRoutes = require('./routes/hash');

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

// Root endpoint
app.get('/', (req, res) => {
  res.send('ProofMintAI Backend is running!');
});

const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
