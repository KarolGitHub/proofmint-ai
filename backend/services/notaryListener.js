const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const NOTARY_ADDRESS = process.env.NOTARY_CONTRACT_ADDRESS;
const NOTARY_ABI = require('../contracts/Notary.json');
const PAYMENT_ESCROW_ADDRESS = process.env.PAYMENT_ESCROW_ADDRESS;
const PAYMENT_ESCROW_ABI = require('../contracts/PaymentEscrow.json');
const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const notary = new ethers.Contract(NOTARY_ADDRESS, NOTARY_ABI, provider);
const escrow = new ethers.Contract(
  PAYMENT_ESCROW_ADDRESS,
  PAYMENT_ESCROW_ABI,
  wallet
);

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

// Listen for DocumentHashRecorded events
notary.on('DocumentHashRecorded', async (documentHash, recorder, timestamp) => {
  const escrowId = docHashToEscrowId.get(documentHash);
  if (escrowId !== undefined) {
    try {
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
  }
});

module.exports = { registerEscrow };
