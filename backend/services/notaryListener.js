const { ethers } = require('ethers');
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

// In-memory mapping: documentHash (bytes32) => escrowId
// In production, use a database!
const docHashToEscrowId = new Map();

// Call this when escrow is created
function registerEscrow(documentHash, escrowId) {
  docHashToEscrowId.set(documentHash, escrowId);
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
    } catch (err) {
      console.error('Failed to release escrow:', err);
    }
  }
});

module.exports = { registerEscrow };
