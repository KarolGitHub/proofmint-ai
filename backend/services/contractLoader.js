/**
 * Contract Loader Service
 * Provides fallback contract ABIs and handles missing artifacts gracefully
 */

// Fallback ABIs for when artifacts are not available
const FALLBACK_ABIS = {
  Notary: {
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: 'bytes32',
            name: 'documentHash',
            type: 'bytes32',
          },
          {
            indexed: true,
            internalType: 'address',
            name: 'recorder',
            type: 'address',
          },
          {
            indexed: false,
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
        ],
        name: 'DocumentHashRecorded',
        type: 'event',
      },
    ],
  },
  PaymentEscrow: {
    abi: [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'escrowId',
            type: 'uint256',
          },
        ],
        name: 'releaseEscrow',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
  ReceiptNFT: {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'tokenURI',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
  },
  ReputationBadge: {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'to',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
  ZKProofVerifier: {
    abi: [
      {
        inputs: [
          {
            internalType: 'bytes32',
            name: 'proofHash',
            type: 'bytes32',
          },
        ],
        name: 'verifyProof',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
  },
};

/**
 * Load contract ABI with fallback support
 * @param {string} contractName - Name of the contract
 * @returns {object|null} - Contract ABI or null if not available
 */
function loadContractABI(contractName) {
  try {
    // First try to load from artifacts
    const artifactPath = require('path').join(
      __dirname,
      `../contracts/artifacts/contracts/${contractName}.sol/${contractName}.json`
    );
    const fs = require('fs');

    if (fs.existsSync(artifactPath)) {
      const artifact = require(artifactPath);
      console.log(`✅ Loaded ${contractName} ABI from artifacts`);
      return artifact.abi;
    }
  } catch (error) {
    console.warn(
      `⚠️  Failed to load ${contractName} from artifacts:`,
      error.message
    );
  }

  // Fallback to predefined ABIs
  if (FALLBACK_ABIS[contractName]) {
    console.log(`📋 Using fallback ABI for ${contractName}`);
    return FALLBACK_ABIS[contractName].abi;
  }

  console.warn(`❌ No ABI available for ${contractName}`);
  return null;
}

/**
 * Check if contracts are available
 * @returns {boolean} - True if contracts are available
 */
function areContractsAvailable() {
  const requiredContracts = ['Notary', 'PaymentEscrow'];
  return requiredContracts.every(
    (contract) => loadContractABI(contract) !== null
  );
}

/**
 * Get contract status
 * @returns {object} - Status of all contracts
 */
function getContractStatus() {
  const contracts = [
    'Notary',
    'PaymentEscrow',
    'ReceiptNFT',
    'ReputationBadge',
    'ZKProofVerifier',
  ];
  const status = {};

  contracts.forEach((contract) => {
    const abi = loadContractABI(contract);
    status[contract] = {
      available: abi !== null,
      source: abi
        ? abi === FALLBACK_ABIS[contract]?.abi
          ? 'fallback'
          : 'artifacts'
        : 'none',
    };
  });

  return status;
}

module.exports = {
  loadContractABI,
  areContractsAvailable,
  getContractStatus,
  FALLBACK_ABIS,
};
