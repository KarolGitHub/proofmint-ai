const { create } = require('@web3-storage/w3up-client');
const { Web3Storage } = require('web3.storage');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Environment variables
const W3UP_TOKEN = process.env.W3UP_TOKEN;
const W3UP_SPACE_DID = process.env.W3UP_SPACE_DID;
const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Generate a random encryption key
 * @returns {Buffer} Random encryption key
 */
function generateEncryptionKey() {
  return crypto.randomBytes(ENCRYPTION_KEY_LENGTH);
}

/**
 * Encrypt a buffer using AES-256-GCM
 * @param {Buffer} data - Data to encrypt
 * @param {Buffer} key - Encryption key
 * @returns {Object} Encrypted data with IV and auth tag
 */
function encryptBuffer(data, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('proofmintai', 'utf8')); // Additional authenticated data

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv,
    authTag,
  };
}

/**
 * Decrypt a buffer using AES-256-GCM
 * @param {Buffer} encryptedData - Encrypted data
 * @param {Buffer} key - Decryption key
 * @param {Buffer} iv - Initialization vector
 * @param {Buffer} authTag - Authentication tag
 * @returns {Buffer} Decrypted data
 */
function decryptBuffer(encryptedData, key, iv, authTag) {
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from('proofmintai', 'utf8'));
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * Upload file to IPFS using web3.storage (public)
 * @param {Buffer} fileBuffer - File data
 * @param {string} fileName - Name of the file
 * @param {string} contentType - MIME type
 * @returns {Promise<Object>} Upload result with CID
 */
async function uploadToIPFS(
  fileBuffer,
  fileName,
  contentType = 'application/octet-stream'
) {
  try {
    if (!WEB3_STORAGE_TOKEN) {
      throw new Error('WEB3_STORAGE_TOKEN environment variable is required');
    }

    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

    // Create a File object
    const file = new File([fileBuffer], fileName, { type: contentType });

    // Upload to IPFS
    const cid = await client.uploadFile(file);

    return {
      success: true,
      cid: cid.toString(),
      url: `https://w3s.link/ipfs/${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`,
      fileName,
      contentType,
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

/**
 * Upload encrypted file to IPFS using web3.storage
 * @param {Buffer} fileBuffer - File data to encrypt and upload
 * @param {string} fileName - Name of the file
 * @param {string} contentType - MIME type
 * @param {Buffer} encryptionKey - Optional encryption key (generated if not provided)
 * @returns {Promise<Object>} Upload result with CID and encryption details
 */
async function uploadEncryptedToIPFS(
  fileBuffer,
  fileName,
  contentType = 'application/octet-stream',
  encryptionKey = null
) {
  try {
    if (!WEB3_STORAGE_TOKEN) {
      throw new Error('WEB3_STORAGE_TOKEN environment variable is required');
    }

    // Generate encryption key if not provided
    const key = encryptionKey || generateEncryptionKey();

    // Encrypt the file
    const { encrypted, iv, authTag } = encryptBuffer(fileBuffer, key);

    // Create metadata for the encrypted file
    const metadata = {
      originalName: fileName,
      contentType,
      encrypted: true,
      algorithm: ENCRYPTION_ALGORITHM,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: new Date().toISOString(),
    };

    // Combine encrypted data and metadata
    const combinedData = {
      data: encrypted.toString('base64'),
      metadata,
    };

    // Create file for upload
    const encryptedFileName = `encrypted_${Date.now()}_${fileName}`;
    const file = new File([JSON.stringify(combinedData)], encryptedFileName, {
      type: 'application/json',
    });

    // Upload to IPFS
    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });
    const cid = await client.uploadFile(file);

    return {
      success: true,
      cid: cid.toString(),
      url: `https://w3s.link/ipfs/${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`,
      fileName: encryptedFileName,
      originalName: fileName,
      contentType,
      encryptionKey: key.toString('hex'), // Return key for storage
      metadata,
    };
  } catch (error) {
    console.error('Encrypted IPFS upload error:', error);
    throw new Error(
      `Failed to upload encrypted file to IPFS: ${error.message}`
    );
  }
}

/**
 * Download and decrypt file from IPFS
 * @param {string} cid - IPFS CID
 * @param {string} encryptionKey - Encryption key in hex format
 * @returns {Promise<Object>} Decrypted file data
 */
async function downloadAndDecryptFromIPFS(cid, encryptionKey) {
  try {
    if (!WEB3_STORAGE_TOKEN) {
      throw new Error('WEB3_STORAGE_TOKEN environment variable is required');
    }

    const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

    // Download from IPFS
    const response = await fetch(`https://w3s.link/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to download from IPFS: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.encrypted || !data.metadata) {
      throw new Error('File is not encrypted or metadata is missing');
    }

    // Parse encryption details
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = Buffer.from(data.metadata.iv, 'hex');
    const authTag = Buffer.from(data.metadata.authTag, 'hex');
    const encryptedData = Buffer.from(data.data, 'base64');

    // Decrypt the data
    const decryptedData = decryptBuffer(encryptedData, key, iv, authTag);

    return {
      success: true,
      data: decryptedData,
      fileName: data.metadata.originalName,
      contentType: data.metadata.contentType,
      timestamp: data.metadata.timestamp,
    };
  } catch (error) {
    console.error('IPFS download and decrypt error:', error);
    throw new Error(
      `Failed to download and decrypt from IPFS: ${error.message}`
    );
  }
}

/**
 * Download file from IPFS (public files)
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} File data
 */
async function downloadFromIPFS(cid) {
  try {
    const response = await fetch(`https://w3s.link/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to download from IPFS: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();

    return {
      success: true,
      data: Buffer.from(data),
      cid,
    };
  } catch (error) {
    console.error('IPFS download error:', error);
    throw new Error(`Failed to download from IPFS: ${error.message}`);
  }
}

/**
 * Get file info from IPFS
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} File information
 */
async function getFileInfo(cid) {
  try {
    const response = await fetch(`https://w3s.link/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(
        `Failed to get file info from IPFS: ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    return {
      success: true,
      cid,
      contentType,
      contentLength: contentLength ? parseInt(contentLength) : null,
      url: `https://w3s.link/ipfs/${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`,
    };
  } catch (error) {
    console.error('IPFS file info error:', error);
    throw new Error(`Failed to get file info from IPFS: ${error.message}`);
  }
}

module.exports = {
  uploadToIPFS,
  uploadEncryptedToIPFS,
  downloadFromIPFS,
  downloadAndDecryptFromIPFS,
  getFileInfo,
  generateEncryptionKey,
  encryptBuffer,
  decryptBuffer,
};
