# 🎨 NFT Receipt Documentation

## Overview

ProofMintAI includes a complete NFT (Non-Fungible Token) receipt system that automatically mints unique tokens when documents are notarized. Each NFT serves as a digital certificate of notarization with rich metadata stored on IPFS.

## 🚀 Features

### ✅ **Automatic NFT Minting**

- NFTs are automatically minted after successful document notarization
- Each NFT is unique and tied to a specific document hash
- Rich metadata including document information and timestamps

### ✅ **Enhanced Metadata**

- Document hash and notarization timestamp
- Optional document images uploaded to IPFS
- Custom attributes for platform and network information
- OpenSea-compatible metadata format

### ✅ **Complete Gallery Interface**

- View all owned receipt NFTs
- Display NFT images, metadata, and attributes
- Links to blockchain explorers and OpenSea
- Copy functionality for token IDs and document hashes

### ✅ **IPFS Integration**

- Metadata stored on IPFS for decentralization
- Images uploaded to IPFS for permanent storage
- Automatic metadata generation and upload

## 🛠 Technical Implementation

### Smart Contract

#### `contracts/ReceiptNFT.sol`

- **Standard**: ERC-721 with URI storage
- **Access Control**: Only backend can mint (owner-only)
- **Features**: Document hash mapping, token URI storage
- **Network**: Polygon Mumbai testnet

#### Key Functions:

```solidity
// Mint a receipt NFT
function mintReceipt(address to, bytes32 documentHash, string memory tokenURI)
    external onlyOwner returns (uint256)

// Get document hash for a token
function getDocumentHash(uint256 tokenId) external view returns (bytes32)
```

### Backend Services

#### `backend/services/receiptNftService.js`

- **Minting**: Enhanced NFT minting with metadata
- **Metadata**: IPFS upload and management
- **Retrieval**: NFT data fetching and parsing

#### Key Functions:

```javascript
// Enhanced minting with metadata
mintReceiptWithMetadata(to, documentHash, metadataParams);

// Upload metadata to IPFS
uploadMetadataToIpfs(metadata);

// Get NFTs by owner
getNftsByOwner(owner);

// Get NFT metadata
getNftMetadata(tokenURI);
```

### Frontend Components

#### `frontend/src/pages/ReceiptGallery.vue`

- **Display**: Grid layout for NFT cards
- **Metadata**: Rich display of NFT information
- **Actions**: Copy, explore, and view links

#### `frontend/src/composables/useEscrow.ts`

- **API Integration**: Enhanced NFT minting functions
- **Error Handling**: Comprehensive error management
- **Loading States**: Progress tracking for operations

## 🔧 API Endpoints

### Minting Endpoints

```
POST /api/payment/mint-receipt
POST /api/payment/mint-receipt-enhanced
```

### Retrieval Endpoints

```
GET /api/payment/nfts/{owner}
POST /api/payment/nft-metadata
```

## 📁 Metadata Structure

### Standard NFT Metadata

```json
{
  "name": "ProofMintAI Receipt - Document Name",
  "description": "NFT receipt for document notarization on ProofMintAI",
  "image": "https://w3s.link/ipfs/{image_cid}",
  "attributes": [
    {
      "trait_type": "Document Hash",
      "value": "0x1234..."
    },
    {
      "trait_type": "Notarization Date",
      "value": "2024-01-01T00:00:00.000Z"
    },
    {
      "trait_type": "Platform",
      "value": "ProofMintAI"
    },
    {
      "trait_type": "Network",
      "value": "Polygon Mumbai"
    }
  ],
  "external_url": "https://proofmintai.com",
  "documentHash": "0x1234...",
  "timestamp": 1704067200
}
```

## 🚀 Usage Examples

### 1. Automatic NFT Minting

```javascript
// Happens automatically after document notarization
const result = await mintReceiptEnhanced({
  to: userAddress,
  documentHash: documentHash,
  documentName: 'Contract.pdf',
  imageUrl: 'https://w3s.link/ipfs/image_cid',
  description: 'Custom description',
});
```

### 2. Fetch User's NFTs

```javascript
const nfts = await getNftsByOwner(userAddress);
console.log('User owns:', nfts.length, 'NFTs');
```

### 3. Get NFT Metadata

```javascript
const metadata = await getNftMetadata(tokenURI);
console.log('NFT Name:', metadata.name);
```

## 🔧 Environment Variables

### Backend Required

```bash
RECEIPT_NFT_ADDRESS=your_nft_contract_address
PRIVATE_KEY=your_backend_private_key
AMOY_RPC_URL=https://www.okx.com/amoy
W3UP_TOKEN=your_w3up_token
W3UP_SPACE_DID=your_w3up_space_did
```

### Frontend Required

```bash
VITE_RECEIPT_NFT_ADDRESS=your_nft_contract_address
VITE_AMOY_RPC_URL=https://www.okx.com/amoy
```

## 🧪 Testing

### Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

### Test NFT Minting

```bash
cd backend
node -e "
const service = require('./services/receiptNftService');
service.mintReceiptWithMetadata(
  '0x...', // recipient
  '0x...', // document hash
  { documentName: 'Test Document' }
).then(console.log);
"
```

## 📊 NFT Features

### Metadata Attributes

- **Document Hash**: Links NFT to specific document
- **Notarization Date**: Timestamp of notarization
- **Platform**: ProofMintAI branding
- **Network**: Blockchain network information

### Image Support

- Optional document images
- IPFS storage for permanence
- Automatic fallback for missing images

### Explorer Integration

- Direct links to blockchain explorers
- OpenSea compatibility for testnets
- Metadata viewing on IPFS

## 🔍 Troubleshooting

### Common Issues

1. **"Contract not deployed"**

   - Deploy ReceiptNFT contract first
   - Set RECEIPT_NFT_ADDRESS environment variable

2. **"Failed to mint NFT"**

   - Check backend private key
   - Verify contract owner permissions
   - Ensure sufficient gas for transaction

3. **"Metadata not loading"**

   - Check IPFS gateway availability
   - Verify metadata URI format
   - Check W3UP token configuration

4. **"Gallery not showing NFTs"**
   - Verify wallet connection
   - Check contract address configuration
   - Ensure NFTs are owned by connected address

## 🔄 Integration Workflow

### Complete Notarization Flow

1. **Document Upload** → File processing and hashing
2. **Escrow Creation** → Payment setup
3. **Document Notarization** → Hash stored on blockchain
4. **Automatic NFT Minting** → Receipt token created
5. **Metadata Upload** → IPFS storage
6. **Gallery Update** → NFT displayed in user's collection

### NFT Lifecycle

1. **Creation**: Automatic minting after notarization
2. **Storage**: Metadata on IPFS, token on blockchain
3. **Display**: Gallery interface for viewing
4. **Verification**: Blockchain explorer links
5. **Trading**: OpenSea compatibility (future)

## 🎯 Future Enhancements

### Planned Features

- [ ] NFT trading functionality
- [ ] Batch NFT operations
- [ ] NFT rarity system
- [ ] Advanced metadata schemas
- [ ] Cross-chain NFT bridges

### Advanced Features

- [ ] NFT staking for rewards
- [ ] NFT-based access control
- [ ] Dynamic NFT metadata
- [ ] NFT marketplace integration
- [ ] NFT governance tokens

## 📚 Resources

- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [IPFS Documentation](https://ipfs.io/docs/)
- [Polygon Mumbai Testnet](https://mumbai.polygonscan.com/)

---

**Note**: The NFT system provides verifiable proof of document notarization with rich metadata and permanent storage on IPFS. Each NFT is unique and tied to a specific document hash for complete traceability.
