const { ethers } = require('ethers');
require('dotenv').config();
const { Web3Storage, File } = require('web3.storage');

const RECEIPT_NFT_ADDRESS = process.env.RECEIPT_NFT_ADDRESS;
const RECEIPT_NFT_ABI = require('../contracts/ReceiptNFT.json');

const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const receiptNftContract = new ethers.Contract(
  RECEIPT_NFT_ADDRESS,
  RECEIPT_NFT_ABI,
  wallet
);

const web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
const web3Storage = new Web3Storage({ token: web3StorageToken });

async function uploadMetadataToIPFS(metadata) {
  const buffer = Buffer.from(JSON.stringify(metadata));
  const files = [
    new File([buffer], 'metadata.json', { type: 'application/json' }),
  ];
  const cid = await web3Storage.put(files);
  return `https://ipfs.io/ipfs/${cid}/metadata.json`;
}

async function mintReceipt(to, documentHash, _tokenURI) {
  // Generate real metadata
  const timestamp = Math.floor(Date.now() / 1000);
  const metadata = {
    name: 'ProofMintAI Notarization Receipt',
    description: 'NFT receipt for document notarization on ProofMintAI',
    documentHash,
    timestamp,
    image:
      'https://bafybeif6w3k2w2k2w2k2w2k2w2k2w2k2w2k2w2k2w2k2w2k2w2k2w2k2w.ipfs.nftstorage.link/receipt.png', // Replace with your own static or generated image
  };
  const tokenURI = await uploadMetadataToIPFS(metadata);
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
