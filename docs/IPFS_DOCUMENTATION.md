# 🔐 IPFS Storage & Encryption Documentation

## Overview

ProofMintAI now includes a complete IPFS (InterPlanetary File System) storage solution with optional AES-256-GCM encryption. This allows users to store documents securely on the decentralized web with full control over privacy and access.

## 🚀 Features

### ✅ **Public Storage**

- Upload files directly to IPFS without encryption
- Files are publicly accessible via CID
- Suitable for non-sensitive documents

### ✅ **Encrypted Storage**

- AES-256-GCM encryption with authenticated encryption
- User-controlled encryption keys
- Automatic key generation or custom key support
- Encrypted files are stored with metadata for decryption

### ✅ **Complete UI Integration**

- Vue.js component with Quasar Framework
- File upload with progress tracking
- Encryption options with key management
- Download functionality for both public and encrypted files
- File information retrieval

## 🛠 Technical Implementation

### Backend Services

#### `backend/services/ipfsService.js`

- **Encryption**: AES-256-GCM with 256-bit keys
- **Storage**: Web3.Storage integration
- **Key Management**: Automatic generation or custom keys
- **Metadata**: Structured JSON with encryption details

#### Key Functions:

```javascript
// Public upload
uploadToIPFS(fileBuffer, fileName, contentType);

// Encrypted upload
uploadEncryptedToIPFS(fileBuffer, fileName, contentType, encryptionKey);

// Download public files
downloadFromIPFS(cid);

// Download and decrypt
downloadAndDecryptFromIPFS(cid, encryptionKey);

// Get file information
getFileInfo(cid);

// Generate encryption key
generateEncryptionKey();
```

### Frontend Components

#### `frontend/src/components/IpfsUpload.vue`

- File selection with drag & drop
- Storage type selection (public/encrypted)
- Key generation and management
- Upload progress tracking
- Result display with copy functionality

#### `frontend/src/pages/IpfsPage.vue`

- Complete IPFS management interface
- Upload, download, and file info sections
- Error handling and user feedback

## 🔧 API Endpoints

### Upload Endpoints

```
POST /api/ipfs/upload
POST /api/ipfs/upload/encrypted
```

### Download Endpoints

```
GET /api/ipfs/download/:cid
POST /api/ipfs/download/encrypted/:cid
```

### Utility Endpoints

```
GET /api/ipfs/info/:cid
POST /api/ipfs/generate-key
```

## 🔐 Security Features

### Encryption Details

- **Algorithm**: AES-256-GCM
- **Key Length**: 256 bits (32 bytes)
- **IV Length**: 128 bits (16 bytes)
- **Auth Tag**: 128 bits (16 bytes)
- **AAD**: "proofmintai" (Additional Authenticated Data)

### Key Management

- Keys are generated using cryptographically secure random number generation
- Keys are returned to users for secure storage
- No keys are stored on the server
- Custom keys must be 64-character hex strings

## 📁 File Structure

### Encrypted File Format

```json
{
  "data": "base64-encoded-encrypted-data",
  "metadata": {
    "originalName": "document.pdf",
    "contentType": "application/pdf",
    "encrypted": true,
    "algorithm": "aes-256-gcm",
    "iv": "hex-encoded-iv",
    "authTag": "hex-encoded-auth-tag",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🚀 Usage Examples

### 1. Upload Public File

```javascript
const formData = new FormData();
formData.append('file', file);

const response = await axios.post('/api/ipfs/upload', formData);
console.log('CID:', response.data.cid);
console.log('URL:', response.data.url);
```

### 2. Upload Encrypted File

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('encryptionKey', 'generated-or-custom-key');

const response = await axios.post('/api/ipfs/upload/encrypted', formData);
console.log('CID:', response.data.cid);
console.log('Encryption Key:', response.data.encryptionKey);
```

### 3. Download Encrypted File

```javascript
const response = await axios.post(
  `/api/ipfs/download/encrypted/${cid}`,
  {
    encryptionKey: 'your-encryption-key',
  },
  {
    responseType: 'blob',
  }
);
```

## 🔧 Environment Variables

### Required

```bash
WEB3_STORAGE_TOKEN=your_web3_storage_token
```

### Optional

```bash
W3UP_TOKEN=your_w3up_token
W3UP_SPACE_DID=your_w3up_space_did
```

## 🧪 Testing

### Run Basic Tests

```bash
cd backend
node test-ipfs.js
```

### Test Encryption/Decryption

The test script verifies:

- Key generation (256-bit keys)
- Encryption/decryption round-trip
- Data integrity validation

## 📊 Performance

### File Size Limits

- **Backend**: 50MB per file (configurable)
- **Web3.Storage**: 32GB per file
- **Recommended**: < 100MB for optimal performance

### Upload Performance

- **Small files (< 1MB)**: ~2-5 seconds
- **Medium files (1-10MB)**: ~5-15 seconds
- **Large files (10-50MB)**: ~15-60 seconds

## 🔍 Troubleshooting

### Common Issues

1. **"WEB3_STORAGE_TOKEN environment variable is required"**

   - Set the environment variable in your `.env` file
   - Get a token from [web3.storage](https://web3.storage/)

2. **"Invalid encryption key format"**

   - Keys must be 64-character hex strings
   - Use the generate key feature for automatic key generation

3. **"Failed to upload to IPFS"**

   - Check your internet connection
   - Verify your Web3.Storage token is valid
   - Ensure file size is within limits

4. **"Failed to download and decrypt"**
   - Verify the CID is correct
   - Ensure the encryption key matches the one used for upload
   - Check if the file was actually encrypted

## 🔄 Integration with Document Notarization

The IPFS functionality can be integrated with the document notarization workflow:

1. **Document Upload** → IPFS Storage (encrypted or public)
2. **Hash Generation** → Document hash for blockchain
3. **Notarization** → Hash stored on blockchain
4. **NFT Receipt** → IPFS CID can be included in NFT metadata

## 🎯 Future Enhancements

### Planned Features

- [ ] Batch upload/download
- [ ] File compression before encryption
- [ ] Streaming upload for large files
- [ ] IPFS pinning service integration
- [ ] File sharing with temporary access tokens
- [ ] Integration with document notarization workflow

### Advanced Features

- [ ] Zero-knowledge proofs for file verification
- [ ] Multi-party encryption (threshold encryption)
- [ ] Time-locked decryption
- [ ] Decentralized key management

## 📚 Resources

- [Web3.Storage Documentation](https://web3.storage/docs/)
- [IPFS Protocol](https://ipfs.io/)
- [AES-GCM Encryption](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Note**: This implementation provides enterprise-grade security with user-controlled encryption keys. Users are responsible for securely storing their encryption keys, as they are not stored on the server.
