const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const { loadContractABI, areContractsAvailable } = require('./contractLoader');
require('dotenv').config();

const NOTARY_ADDRESS = process.env.NOTARY_CONTRACT_ADDRESS;
const PAYMENT_ESCROW_ADDRESS = process.env.PAYMENT_ESCROW_ADDRESS;

// Load contract ABIs safely
const NOTARY_ABI = loadContractABI('Notary');
const PAYMENT_ESCROW_ABI = loadContractABI('PaymentEscrow');

// Check if we have the required contract ABIs
const contractsAvailable = areContractsAvailable();

if (!contractsAvailable) {
  console.warn(
    '⚠️  Contract ABIs not available. Blockchain features will be disabled.'
  );
  console.warn(
    'To enable blockchain features, ensure contracts are compiled and artifacts are available.'
  );
}

// Initialize contracts only if addresses and ABIs are provided
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
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const EVENT_TIMEOUT = 60000; // 1 minute - if no events for this long, reconnect
const FILTER_REFRESH_INTERVAL = 300000; // 5 minutes - refresh filter to prevent staleness
let healthCheckTimer = null;
let eventTimeoutTimer = null;
let filterRefreshTimer = null;
let lastEventTime = Date.now();

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

  // Start event listener if this is the first escrow
  if (docHashToEscrowId.size === 1 && !isListening) {
    console.log('First escrow registered, starting event listener');
    setupEventListener();
  }
}

// Initialize contracts and provider
function initializeContracts() {
  // Check if contracts are available
  if (!contractsAvailable) {
    console.log('Contract ABIs not available, blockchain features disabled');
    return false;
  }

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

    // Only create contract instances if ABIs are available
    if (NOTARY_ABI) {
      notary = new ethers.Contract(NOTARY_ADDRESS, NOTARY_ABI, provider);
    }
    if (PAYMENT_ESCROW_ABI) {
      escrow = new ethers.Contract(
        PAYMENT_ESCROW_ADDRESS,
        PAYMENT_ESCROW_ABI,
        wallet
      );
    }

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

  if (!contractsAvailable) {
    console.log('Contract ABIs not available, event listener disabled');
    return false;
  }

  try {
    // Remove existing listener if any
    if (eventListener) {
      notary.off('DocumentHashRecorded', eventListener);
    }

    // Create new event listener
    eventListener = async (documentHash, recorder, timestamp) => {
      try {
        console.log(
          `DocumentHashRecorded event: ${documentHash} by ${recorder} at ${timestamp}`
        );

        // Update last event time
        lastEventTime = Date.now();
        resetEventTimeout(); // Reset timeout on new event

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

            // Stop event listener if no more escrows to monitor
            if (docHashToEscrowId.size === 0 && isListening) {
              console.log('All escrows processed, stopping event listener');
              stopEventListener();
            }
          } catch (err) {
            console.error('Failed to release escrow:', err);
          }
        } else {
          console.log(`No escrow found for document hash ${documentHash}`);
        }
      } catch (error) {
        // Handle any errors in the event listener itself
        console.error('Event listener error:', error);
        handleEventListenerError(error);
      }
    };

    // Attach listener
    notary.on('DocumentHashRecorded', eventListener);

    // Note: In ethers.js v6, we can't listen to provider 'error' or 'disconnect' events
    // Instead, we'll rely on the health check and error handling in the event listener itself

    isListening = true;
    reconnectAttempts = 0; // Reset reconnect attempts on successful setup
    console.log('Event listener setup successfully');

    // Start health check
    startHealthCheck();
    startEventTimeout(); // Start event timeout monitoring
    startFilterRefresh(); // Start filter refresh to prevent staleness

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
  }
  // Check for other common RPC errors
  else if (
    error.code === 'UNKNOWN_ERROR' ||
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT'
  ) {
    console.log('Network/RPC error detected, attempting to reconnect...');
    scheduleReconnect();
  }
  // Check for provider disconnection
  else if (
    error.code === 'DISCONNECTED' ||
    error.message?.includes('disconnected') ||
    error.message?.includes('connection lost')
  ) {
    console.log('Provider disconnected, attempting to reconnect...');
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

    // Stop health check and event timeout during reconnection
    stopHealthCheck();
    stopEventTimeout();
    stopFilterRefresh();

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

// Test if event listener is working by querying past events
async function testEventListener() {
  if (!notary || !provider) {
    return { working: false, error: 'Contracts not initialized' };
  }

  try {
    // Try to get the latest block number to test basic connectivity
    const blockNumber = await provider.getBlockNumber();

    // Try to query a recent event to see if the listener can access events
    const currentBlock = blockNumber;
    const fromBlock = Math.max(0, currentBlock - 100); // Look back 100 blocks

    const events = await notary.queryFilter(
      'DocumentHashRecorded',
      fromBlock,
      currentBlock
    );

    return {
      working: true,
      latestBlock: blockNumber,
      recentEvents: events.length,
      lastEventTime: new Date(lastEventTime).toISOString(),
    };
  } catch (error) {
    return { working: false, error: error.message };
  }
}

// Test provider connection
async function testProviderConnection() {
  if (!provider) {
    return { connected: false, error: 'Provider not initialized' };
  }

  try {
    const network = await provider.getNetwork();
    return {
      connected: true,
      network: network.name || network.chainId,
      blockNumber: await provider.getBlockNumber(),
    };
  } catch (error) {
    return { connected: false, error: error.message };
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
    healthCheck: {
      active: !!healthCheckTimer,
      lastEventTime: new Date(lastEventTime).toISOString(),
      timeSinceLastEvent: Date.now() - lastEventTime,
    },
  };
}

// Start event timeout monitoring
function startEventTimeout() {
  if (eventTimeoutTimer) {
    clearTimeout(eventTimeoutTimer);
  }

  eventTimeoutTimer = setTimeout(() => {
    if (isListening) {
      console.log(
        `Event timeout: No events received for ${
          EVENT_TIMEOUT / 1000
        }s, triggering reconnection...`
      );
      scheduleReconnect();
    }
  }, EVENT_TIMEOUT);
}

// Stop event timeout monitoring
function stopEventTimeout() {
  if (eventTimeoutTimer) {
    clearTimeout(eventTimeoutTimer);
    eventTimeoutTimer = null;
  }
}

// Reset event timeout (call this when events are received)
function resetEventTimeout() {
  if (isListening) {
    startEventTimeout();
  }
}

// Periodic health check to detect filter expiration
function startHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
  }

  healthCheckTimer = setInterval(async () => {
    if (!isListening || !provider) {
      return;
    }

    try {
      // Simple connectivity test
      const network = await provider.getNetwork();
      console.log(
        `Health check: Connected to ${network.name || network.chainId}`
      );
    } catch (error) {
      console.log(
        'Health check: Provider connection failed, triggering reconnection:',
        error.message
      );
      scheduleReconnect();
    }
  }, HEALTH_CHECK_INTERVAL);
}

// Stop health check
function stopHealthCheck() {
  if (healthCheckTimer) {
    clearInterval(healthCheckTimer);
    healthCheckTimer = null;
  }
}

// Start filter refresh to prevent staleness
function startFilterRefresh() {
  if (filterRefreshTimer) {
    clearInterval(filterRefreshTimer);
  }

  filterRefreshTimer = setInterval(async () => {
    if (!isListening || !notary || !eventListener) {
      return;
    }

    try {
      console.log('Refreshing event filter to prevent staleness...');

      // Remove old listener
      notary.off('DocumentHashRecorded', eventListener);

      // Reattach listener (this creates a fresh filter)
      notary.on('DocumentHashRecorded', eventListener);

      console.log('Event filter refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh filter:', error);
      // If filter refresh fails, trigger reconnection
      scheduleReconnect();
    }
  }, FILTER_REFRESH_INTERVAL);
}

// Stop filter refresh
function stopFilterRefresh() {
  if (filterRefreshTimer) {
    clearInterval(filterRefreshTimer);
    filterRefreshTimer = null;
  }
}

// Stop event listener
function stopEventListener() {
  if (eventListener && notary) {
    notary.off('DocumentHashRecorded', eventListener);
    eventListener = null;
  }

  isListening = false;
  stopHealthCheck();
  stopEventTimeout();
  stopFilterRefresh();

  console.log('Event listener stopped');
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
  stopHealthCheck(); // Stop health check on shutdown
  stopEventTimeout(); // Stop event timeout on shutdown
  stopFilterRefresh(); // Stop filter refresh on shutdown
}

// Initialize everything
if (initializeContracts()) {
  // Only setup event listener if there are escrows to monitor
  if (docHashToEscrowId.size > 0) {
    console.log(
      `Found ${docHashToEscrowId.size} escrows to monitor, setting up event listener`
    );
    setupEventListener();
  } else {
    console.log('No escrows to monitor, event listener not needed');
  }
}

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
  registerEscrow,
  getListenerStatus,
  reconnect,
  shutdown,
  testProviderConnection,
  testEventListener,
  stopEventListener,
};
