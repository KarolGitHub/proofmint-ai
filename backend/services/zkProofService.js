const { ethers } = require('ethers');
const crypto = require('crypto');

// Import contract ABI and address
const ZKProofVerifierABI = require('../contracts/ZKProofVerifier.json').abi;
const ZK_PROOF_VERIFIER_ADDRESS = process.env.ZK_PROOF_VERIFIER_ADDRESS;

// Initialize provider and contract
const provider = new ethers.providers.JsonRpcProvider(
  process.env.POLYGON_MUMBAI_RPC_URL
);
const zkProofContract = new ethers.Contract(
  ZK_PROOF_VERIFIER_ADDRESS,
  ZKProofVerifierABI,
  provider
);

/**
 * Generate a commitment hash for a document
 * @param {string} documentHash - The document hash
 * @param {string} salt - Random salt for privacy
 * @returns {string} The commitment hash
 */
function generateCommitment(documentHash, salt) {
  const combined = documentHash + salt;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(combined));
}

/**
 * Generate a nullifier to prevent double-spending
 * @param {string} documentHash - The document hash
 * @param {string} secret - User's secret
 * @returns {string} The nullifier hash
 */
function generateNullifier(documentHash, secret) {
  const combined = documentHash + secret;
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(combined));
}

/**
 * Generate a random salt for privacy
 * @returns {string} Random salt
 */
function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random secret for nullifier
 * @returns {string} Random secret
 */
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a ZK proof commitment on-chain
 * @param {string} documentHash - The document hash
 * @param {string} salt - Random salt
 * @param {string} secret - User's secret
 * @param {string} privateKey - User's private key for signing
 * @returns {Object} Proof creation result
 */
async function createZKProof(documentHash, salt, secret, privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = zkProofContract.connect(wallet);

    const commitment = generateCommitment(documentHash, salt);
    const nullifier = generateNullifier(documentHash, secret);

    // Check if commitment already exists
    const commitmentExists = await contractWithSigner.commitmentExists(
      commitment
    );
    if (commitmentExists) {
      throw new Error('Commitment already exists');
    }

    // Check if nullifier already used
    const nullifierUsed = await contractWithSigner.nullifierUsed(nullifier);
    if (nullifierUsed) {
      throw new Error('Nullifier already used');
    }

    // Create the ZK proof on-chain
    const tx = await contractWithSigner.createZKProof(commitment, nullifier);
    const receipt = await tx.wait();

    // Get the proof ID from the event
    const event = receipt.events.find((e) => e.event === 'ZKProofCreated');
    const proofId = event.args.proofId.toString();

    return {
      success: true,
      proofId,
      commitment: commitment,
      nullifier: nullifier,
      salt,
      secret,
      transactionHash: receipt.transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Error creating ZK proof:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify a ZK proof
 * @param {string} proofId - The proof ID to verify
 * @param {string} proofData - Additional proof data
 * @param {string} privateKey - Verifier's private key
 * @returns {Object} Verification result
 */
async function verifyZKProof(proofId, proofData, privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = zkProofContract.connect(wallet);

    // Get proof details
    const proof = await contractWithSigner.getProof(proofId);

    if (proof.proofId.toString() === '0') {
      throw new Error('Proof does not exist');
    }

    if (!proof.isValid) {
      throw new Error('Proof is not valid');
    }

    if (proof.isRevoked) {
      throw new Error('Proof has been revoked');
    }

    // Verify the proof (simplified for demo)
    const isValid = await contractWithSigner.verifyZKProof(proofId, proofData);

    return {
      success: true,
      isValid,
      proofId,
      owner: proof.owner,
      commitment: proof.commitment,
      timestamp: proof.timestamp.toString(),
    };
  } catch (error) {
    console.error('Error verifying ZK proof:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Revoke a ZK proof
 * @param {string} proofId - The proof ID to revoke
 * @param {string} privateKey - Owner's private key
 * @returns {Object} Revocation result
 */
async function revokeZKProof(proofId, privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = zkProofContract.connect(wallet);

    // Get proof details to check ownership
    const proof = await contractWithSigner.getProof(proofId);

    if (proof.proofId.toString() === '0') {
      throw new Error('Proof does not exist');
    }

    if (proof.owner !== wallet.address) {
      throw new Error('Only proof owner can revoke');
    }

    if (proof.isRevoked) {
      throw new Error('Proof already revoked');
    }

    // Revoke the proof
    const tx = await contractWithSigner.revokeZKProof(proofId);
    const receipt = await tx.wait();

    return {
      success: true,
      proofId,
      transactionHash: receipt.transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Error revoking ZK proof:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a verification request
 * @param {string} proofId - The proof ID to verify
 * @param {string} reason - Reason for verification
 * @param {string} privateKey - Requester's private key
 * @returns {Object} Request creation result
 */
async function createVerificationRequest(proofId, reason, privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = zkProofContract.connect(wallet);

    // Check if proof exists and is valid
    const proof = await contractWithSigner.getProof(proofId);

    if (proof.proofId.toString() === '0') {
      throw new Error('Proof does not exist');
    }

    if (!proof.isValid) {
      throw new Error('Proof is not valid');
    }

    if (proof.isRevoked) {
      throw new Error('Proof has been revoked');
    }

    // Create verification request
    const tx = await contractWithSigner.createVerificationRequest(
      proofId,
      reason
    );
    const receipt = await tx.wait();

    // Get the request ID from the event
    const event = receipt.events.find(
      (e) => e.event === 'VerificationRequestCreated'
    );
    const requestId = event.args.requestId.toString();

    return {
      success: true,
      requestId,
      proofId,
      reason,
      transactionHash: receipt.transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Error creating verification request:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Complete a verification request
 * @param {string} requestId - The request ID to complete
 * @param {boolean} isVerified - Whether verification was successful
 * @param {string} reason - Reason for the result
 * @param {string} privateKey - Proof owner's private key
 * @returns {Object} Completion result
 */
async function completeVerificationRequest(
  requestId,
  isVerified,
  reason,
  privateKey
) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractWithSigner = zkProofContract.connect(wallet);

    // Get request details
    const request = await contractWithSigner.getVerificationRequest(requestId);

    if (request.requestId.toString() === '0') {
      throw new Error('Request does not exist');
    }

    if (request.isVerified) {
      throw new Error('Request already completed');
    }

    // Get proof details to check ownership
    const proof = await contractWithSigner.getProof(request.proofId);

    if (proof.owner !== wallet.address) {
      throw new Error('Only proof owner can complete verification');
    }

    // Complete the verification request
    const tx = await contractWithSigner.completeVerificationRequest(
      requestId,
      isVerified,
      reason
    );
    const receipt = await tx.wait();

    return {
      success: true,
      requestId,
      isVerified,
      reason,
      transactionHash: receipt.transactionHash,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    console.error('Error completing verification request:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all proofs for a user
 * @param {string} userAddress - User's address
 * @returns {Object} User's proofs
 */
async function getUserProofs(userAddress) {
  try {
    const proofIds = await zkProofContract.getUserProofs(userAddress);
    const proofs = [];

    for (const proofId of proofIds) {
      const proof = await zkProofContract.getProof(proofId);
      proofs.push({
        proofId: proof.proofId.toString(),
        owner: proof.owner,
        commitment: proof.commitment,
        nullifier: proof.nullifier,
        timestamp: proof.timestamp.toString(),
        isValid: proof.isValid,
        isRevoked: proof.isRevoked,
      });
    }

    return {
      success: true,
      proofs,
      count: proofs.length,
    };
  } catch (error) {
    console.error('Error getting user proofs:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get proof details
 * @param {string} proofId - The proof ID
 * @returns {Object} Proof details
 */
async function getProofDetails(proofId) {
  try {
    const proof = await zkProofContract.getProof(proofId);

    if (proof.proofId.toString() === '0') {
      throw new Error('Proof does not exist');
    }

    return {
      success: true,
      proof: {
        proofId: proof.proofId.toString(),
        owner: proof.owner,
        commitment: proof.commitment,
        nullifier: proof.nullifier,
        timestamp: proof.timestamp.toString(),
        isValid: proof.isValid,
        isRevoked: proof.isRevoked,
      },
    };
  } catch (error) {
    console.error('Error getting proof details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get verification request details
 * @param {string} requestId - The request ID
 * @returns {Object} Request details
 */
async function getVerificationRequestDetails(requestId) {
  try {
    const request = await zkProofContract.getVerificationRequest(requestId);

    if (request.requestId.toString() === '0') {
      throw new Error('Request does not exist');
    }

    return {
      success: true,
      request: {
        requestId: request.requestId.toString(),
        requester: request.requester,
        proofId: request.proofId.toString(),
        timestamp: request.timestamp.toString(),
        isVerified: request.isVerified,
        verificationReason: request.verificationReason,
      },
    };
  } catch (error) {
    console.error('Error getting verification request details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get total number of proofs
 * @returns {Object} Total proofs count
 */
async function getTotalProofs() {
  try {
    const count = await zkProofContract.getTotalProofs();
    return {
      success: true,
      count: count.toString(),
    };
  } catch (error) {
    console.error('Error getting total proofs:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateCommitment,
  generateNullifier,
  generateSalt,
  generateSecret,
  createZKProof,
  verifyZKProof,
  revokeZKProof,
  createVerificationRequest,
  completeVerificationRequest,
  getUserProofs,
  getProofDetails,
  getVerificationRequestDetails,
  getTotalProofs,
};
