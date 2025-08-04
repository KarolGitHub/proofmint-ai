const { ethers } = require('ethers');
require('dotenv').config();
const { create } = require('@web3-storage/w3up-client');

const RECEIPT_NFT_ADDRESS = process.env.RECEIPT_NFT_ADDRESS;
const RECEIPT_NFT_ABI = require('../contracts/ReceiptNFT.json').abi;

const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const receiptNftContract = new ethers.Contract(
  RECEIPT_NFT_ADDRESS,
  RECEIPT_NFT_ABI,
  wallet
);

const W3UP_TOKEN = process.env.W3UP_TOKEN;
const W3UP_SPACE_DID = process.env.W3UP_SPACE_DID;

/**
 * Upload metadata to IPFS using web3.storage
 * @param {Object} metadata - NFT metadata object
 * @returns {Promise<string>} IPFS URI
 */
async function uploadMetadataToIpfs(metadata) {
  try {
    if (!W3UP_TOKEN || !W3UP_SPACE_DID) {
      throw new Error(
        'W3UP_TOKEN and W3UP_SPACE_DID environment variables are required'
      );
    }

    const client = await create();
    await client.login(W3UP_TOKEN);
    await client.setCurrentSpace(W3UP_SPACE_DID);

    const buffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const file = new File([buffer], 'metadata.json', {
      type: 'application/json',
    });
    const cid = await client.uploadFile(file);
    return `https://w3s.link/ipfs/${cid}`;
  } catch (error) {
    console.error('Failed to upload metadata to IPFS:', error);
    throw new Error(`Failed to upload metadata: ${error.message}`);
  }
}

/**
 * Create NFT metadata for a notarized document
 * @param {Object} params - Metadata parameters
 * @returns {Promise<Object>} Metadata object
 */
async function createNftMetadata({
  documentHash,
  documentName,
  timestamp,
  imageUrl = '',
  description = 'NFT receipt for document notarization on ProofMintAI',
}) {
  const metadata = {
    name: `ProofMintAI Receipt - ${documentName || 'Document'}`,
    description,
    image: imageUrl,
    attributes: [
      {
        trait_type: 'Document Hash',
        value: documentHash,
      },
      {
        trait_type: 'Notarization Date',
        value: new Date(timestamp * 1000).toISOString(),
      },
      {
        trait_type: 'Platform',
        value: 'ProofMintAI',
      },
      {
        trait_type: 'Network',
        value: 'Polygon Mumbai',
      },
    ],
    external_url: 'https://proofmintai.com',
    documentHash,
    timestamp,
  };

  return metadata;
}

/**
 * Mint a receipt NFT with metadata
 * @param {string} to - Recipient address
 * @param {string} documentHash - Document hash
 * @param {Object} metadataParams - Metadata parameters
 * @returns {Promise<Object>} Mint result with tokenId and metadata
 */
async function mintReceiptWithMetadata(to, documentHash, metadataParams) {
  try {
    // Create metadata
    const metadata = await createNftMetadata({
      documentHash,
      timestamp: Math.floor(Date.now() / 1000),
      ...metadataParams,
    });

    // Upload metadata to IPFS
    const tokenURI = await uploadMetadataToIpfs(metadata);

    // Mint the NFT
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

    const tokenId = event ? event.args.tokenId.toString() : null;

    if (!tokenId) {
      throw new Error('Failed to get token ID from transaction');
    }

    return {
      success: true,
      tokenId,
      tokenURI,
      metadata,
      transactionHash: receipt.hash,
    };
  } catch (error) {
    console.error('NFT minting error:', error);
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

/**
 * Mint a receipt NFT (legacy function for backward compatibility)
 * @param {string} to - Recipient address
 * @param {string} documentHash - Document hash
 * @param {string} tokenURI - Token metadata URI
 * @returns {Promise<string>} Token ID
 */
async function mintReceipt(to, documentHash, tokenURI) {
  try {
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
  } catch (error) {
    console.error('NFT minting error:', error);
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

/**
 * Get NFT metadata from IPFS
 * @param {string} tokenURI - Token URI
 * @returns {Promise<Object>} NFT metadata
 */
async function getNftMetadata(tokenURI) {
  try {
    const response = await fetch(tokenURI);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get NFT metadata:', error);
    throw new Error(`Failed to get metadata: ${error.message}`);
  }
}

/**
 * Get all NFTs owned by an address
 * @param {string} owner - Owner address
 * @returns {Promise<Array>} Array of NFT data
 */
async function getNftsByOwner(owner) {
  try {
    const balance = await receiptNftContract.balanceOf(owner);
    const nfts = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await receiptNftContract.tokenOfOwnerByIndex(owner, i);
      const tokenURI = await receiptNftContract.tokenURI(tokenId);
      const documentHash = await receiptNftContract.getDocumentHash(tokenId);

      try {
        const metadata = await getNftMetadata(tokenURI);
        nfts.push({
          tokenId: tokenId.toString(),
          tokenURI,
          documentHash,
          metadata,
        });
      } catch (error) {
        console.error(`Failed to get metadata for token ${tokenId}:`, error);
        nfts.push({
          tokenId: tokenId.toString(),
          tokenURI,
          documentHash,
          metadata: null,
        });
      }
    }

    return nfts;
  } catch (error) {
    console.error('Failed to get NFTs by owner:', error);
    throw new Error(`Failed to get NFTs: ${error.message}`);
  }
}

module.exports = {
  mintReceipt,
  mintReceiptWithMetadata,
  uploadMetadataToIpfs,
  createNftMetadata,
  getNftMetadata,
  getNftsByOwner,
};
