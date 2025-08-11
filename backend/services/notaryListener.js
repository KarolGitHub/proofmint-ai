const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const NOTARY_ADDRESS = process.env.NOTARY_CONTRACT_ADDRESS;
const NOTARY_ABI =
  require('../../contracts/artifacts/contracts/Notary.sol/Notary.json').abi;
const PAYMENT_ESCROW_ADDRESS = process.env.PAYMENT_ESCROW_ADDRESS;
const PAYMENT_ESCROW_ABI =
  require('../../contracts/artifacts/contracts/PaymentEscrow.sol/PaymentEscrow.json').abi;

// Initialize contracts only if addresses are provided
let notary = null;
let escrow = null;
let provider = null;
let wallet = null;

// Event listener state
let eventListener = null;
let isListening = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 10000; // 10 seconds

const MAPPING_FILE = path.join(__dirname, 'escrowMapping.json');
let docHashToEscrowId = new Map();

// Load mapping from file
if (fs.existsSync(MAPPING_FILE)) {
  try {
    const data = fs.readFileSync(MAPPING_FILE, 'utf-8');
    docHashToEscrowId = new Map(Object.entries(JSON.parse(data)));
  } catch (e) {
    console.error('Failed to load escrow mapping:', e);
  }
}

// Save mapping to file
function saveMapping() {
  try {
    fs.writeFileSync(
      MAPPING_FILE,
      JSON.stringify(Object.fromEntries(docHashToEscrowId)),
      'utf-8'
    );
  } catch (e) {
    console.error('Failed to save escrow mapping:', e);
  }
}

// Call this when escrow is created
function registerEscrow(documentHash, escrowId) {
  docHashToEscrowId.set(documentHash, escrowId);
  saveMapping();
}

// Initialize contracts and provider
function initializeContracts() {
  if (!NOTARY_ADDRESS || !PAYMENT_ESCROW_ADDRESS) {
    console.log('Contract addresses not provided, skipping initialization');
    console.log('Required environment variables:');
    console.log(
      '- NOTARY_CONTRACT_ADDRESS:',
      NOTARY_ADDRESS ? '✅ Set' : '❌ Missing'
    );
    console.log(
      '- PAYMENT_ESCROW_ADDRESS:',
      PAYMENT_ESCROW_ADDRESS ? '✅ Set' : '❌ Missing'
    );
    return false;
  }

  if (!process.env.AMOY_RPC_URL) {
    console.error('AMOY_RPC_URL environment variable is required');
    return false;
  }

  if (!process.env.PRIVATE_KEY) {
    console.error('PRIVATE_KEY environment variable is required');
    return false;
  }

  try {
    console.log('Initializing contracts with:');
    console.log('- RPC URL:', process.env.AMOY_RPC_URL);
    console.log('- Notary Address:', NOTARY_ADDRESS);
    console.log('- Escrow Address:', PAYMENT_ESCROW_ADDRESS);

    provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    notary = new ethers.Contract(NOTARY_ADDRESS, NOTARY_ABI, provider);
    escrow = new ethers.Contract(
      PAYMENT_ESCROW_ADDRESS,
      PAYMENT_ESCROW_ABI,
      wallet
    );

    console.log('Contracts initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize contracts:', error);
    return false;
  }
}

// Setup event listener with error handling
function setupEventListener() {
  if (!notary || !escrow) {
    console.log('Contracts not initialized, cannot setup event listener');
    return false;
  }

  try {
    // Remove existing listener if any
    if (eventListener) {
      notary.off('DocumentHashRecorded', eventListener);
    }

    // Create new event listener
    eventListener = async (documentHash, recorder, timestamp) => {
      console.log(
        `DocumentHashRecorded event: ${documentHash} by ${recorder} at ${timestamp}`
      );

      const escrowId = docHashToEscrowId.get(documentHash);
      if (escrowId !== undefined) {
        try {
          console.log(
            `Processing escrow ${escrowId} for document ${documentHash}`
          );
          const tx = await escrow.releaseEscrow(escrowId);
          await tx.wait();
          console.log(
            `Escrow ${escrowId} released for document hash ${documentHash}`
          );
          docHashToEscrowId.delete(documentHash); // Clean up
          saveMapping();
        } catch (err) {
          console.error('Failed to release escrow:', err);
        }
      } else {
        console.log(`No escrow found for document hash ${documentHash}`);
      }
    };

    // Attach listener
    notary.on('DocumentHashRecorded', eventListener);

    // Add error handling for the event listener
    notary.on('error', (error) => {
      console.error('Event listener error:', error);
      handleEventListenerError(error);
    });

    isListening = true;
    reconnectAttempts = 0; // Reset reconnect attempts on successful setup
    console.log('Event listener setup successfully');
    return true;
  } catch (error) {
    console.error('Failed to setup event listener:', error);
    return false;
  }
}

// Handle event listener errors
function handleEventListenerError(error) {
  console.error('Event listener encountered an error:', error);

  // Check if it's a filter-related error
  if (
    error.code === 'UNKNOWN_ERROR' &&
    error.error &&
    error.error.message === 'filter not found'
  ) {
    console.log('Filter expired, attempting to reconnect...');
    scheduleReconnect();
  } else {
    console.error('Unknown event listener error, attempting to reconnect...');
    scheduleReconnect();
  }
}

// Schedule reconnection
function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      `Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`
    );
    return;
  }

  reconnectAttempts++;
  console.log(
    `Scheduling reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${RECONNECT_DELAY}ms`
  );

  setTimeout(() => {
    console.log(
      `Attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
    );
    reconnect();
  }, RECONNECT_DELAY);
}

// Reconnect logic
function reconnect() {
  try {
    console.log('Attempting to reconnect event listener...');

    // Clean up existing listener
    if (eventListener && notary) {
      notary.off('DocumentHashRecorded', eventListener);
      eventListener = null;
    }

    isListening = false;

    // Reinitialize contracts if needed
    if (!notary || !escrow) {
      if (!initializeContracts()) {
        throw new Error('Failed to reinitialize contracts');
      }
    }

    // Setup new event listener
    if (setupEventListener()) {
      console.log('Successfully reconnected event listener');
    } else {
      throw new Error('Failed to setup event listener during reconnection');
    }
  } catch (error) {
    console.error('Reconnection failed:', error);
    scheduleReconnect();
  }
}

// Health check function
function getListenerStatus() {
  return {
    isListening,
    reconnectAttempts,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    contractsInitialized: !!(notary && escrow),
    mappingSize: docHashToEscrowId.size,
  };
}

// Graceful shutdown
function shutdown() {
  console.log('Shutting down event listener...');

  if (eventListener && notary) {
    notary.off('DocumentHashRecorded', eventListener);
    eventListener = null;
  }

  isListening = false;
  console.log('Event listener shutdown complete');
}

// Initialize everything
if (initializeContracts()) {
  setupEventListener();
}

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  registerEscrow,
  getListenerStatus,
  reconnect,
  shutdown,
};
