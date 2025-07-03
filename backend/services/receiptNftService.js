const { ethers } = require('ethers');
require('dotenv').config();

const RECEIPT_NFT_ADDRESS = process.env.RECEIPT_NFT_ADDRESS;
const RECEIPT_NFT_ABI = require('../contracts/ReceiptNFT.json');

const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const receiptNftContract = new ethers.Contract(
  RECEIPT_NFT_ADDRESS,
  RECEIPT_NFT_ABI,
  wallet
);

async function mintReceipt(to, documentHash, tokenURI) {
  // documentHash should be a bytes32 string (0x...)
  const tx = await receiptNftContract.mintReceipt(to, documentHash, tokenURI);
  const receipt = await tx.wait();
  // Find Transfer event for tokenId
  const event = receipt.logs
    .map((log) => {
      try {
        return receiptNftContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e) => e && e.name === 'Transfer');
  return event ? event.args.tokenId.toString() : null;
}

module.exports = {
  mintReceipt,
};
