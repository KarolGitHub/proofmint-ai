const { ethers } = require('ethers');
require('dotenv').config();

const PAYMENT_ESCROW_ADDRESS = process.env.PAYMENT_ESCROW_ADDRESS;
const PAYMENT_ESCROW_ABI = require('../contracts/PaymentEscrow.json');

const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const escrowContract = new ethers.Contract(
  PAYMENT_ESCROW_ADDRESS,
  PAYMENT_ESCROW_ABI,
  wallet
);

async function createEscrow(payee, amount) {
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
  return event ? event.args.escrowId : null;
}

async function releaseEscrow(escrowId) {
  const tx = await escrowContract.releaseEscrow(escrowId);
  await tx.wait();
  return true;
}

async function refundEscrow(escrowId) {
  const tx = await escrowContract.refundEscrow(escrowId);
  await tx.wait();
  return true;
}

async function getEscrow(escrowId) {
  return await escrowContract.getEscrow(escrowId);
}

module.exports = {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrow,
};
