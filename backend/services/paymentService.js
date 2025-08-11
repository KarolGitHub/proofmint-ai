const { ethers } = require('ethers');
require('dotenv').config();
const { registerEscrow } = require('./notaryListener');
const { loadContractABI } = require('./contractLoader');

const PAYMENT_ESCROW_ADDRESS = process.env.PAYMENT_ESCROW_ADDRESS;
const PAYMENT_ESCROW_ABI = loadContractABI('PaymentEscrow');

// Initialize contract only if address and ABI are provided
let escrowContract = null;
if (PAYMENT_ESCROW_ADDRESS && PAYMENT_ESCROW_ABI) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    escrowContract = new ethers.Contract(
      PAYMENT_ESCROW_ADDRESS,
      PAYMENT_ESCROW_ABI,
      wallet
    );
    console.log('✅ Payment escrow contract initialized');
  } catch (error) {
    console.error(
      '❌ Failed to initialize payment escrow contract:',
      error.message
    );
  }
} else {
  console.warn(
    '⚠️  Payment escrow contract not available - missing address or ABI'
  );
}

// Helper function to check if contract is initialized
function checkContractInitialized() {
  if (!escrowContract) {
    throw new Error(
      'Payment escrow contract not initialized. Please ensure PAYMENT_ESCROW_ADDRESS environment variable is set and contract ABI is available.'
    );
  }
}

async function createEscrow(payee, amount, documentHash) {
  checkContractInitialized();

  // amount in wei (string or BigNumber)
  const tx = await escrowContract.createEscrow(payee, { value: amount });
  const receipt = await tx.wait();
  // Find EscrowCreated event
  const event = receipt.logs
    .map((log) => {
      try {
        return escrowContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e && e.name === 'EscrowCreated');
  const escrowId = event ? event.args.escrowId : null;
  if (escrowId && documentHash) {
    registerEscrow(documentHash, escrowId.toString());
  }
  return escrowId;
}

async function releaseEscrow(escrowId) {
  checkContractInitialized();

  const tx = await escrowContract.releaseEscrow(escrowId);
  await tx.wait();
  return true;
}

async function refundEscrow(escrowId) {
  checkContractInitialized();

  const tx = await escrowContract.refundEscrow(escrowId);
  await tx.wait();
  return true;
}

async function getEscrow(escrowId) {
  checkContractInitialized();

  return await escrowContract.getEscrow(escrowId);
}

module.exports = {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrow,
};
