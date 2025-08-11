# ZK-Proof Anonymized Verification System

## Overview

The ZK-Proof Anonymized Verification System is a privacy-preserving solution that allows users to prove document ownership without revealing the actual document content or hash. This system implements zero-knowledge proof concepts to enable anonymous verification while maintaining security and integrity.

## Features

### 🔐 Privacy-Preserving Verification

- **Anonymous Proofs**: Create proofs without revealing document content
- **Commitment Schemes**: Use cryptographic commitments to hide document hashes
- **Nullifier Prevention**: Prevent double-spending of proofs
- **Selective Disclosure**: Control what information is revealed during verification

### 🛡️ Security Features

- **Cryptographic Integrity**: All proofs are cryptographically secure
- **Ownership Verification**: Only proof owners can revoke or manage their proofs
- **Double-Spending Prevention**: Unique nullifiers prevent proof reuse
- **Revocation Mechanism**: Proof owners can revoke their proofs when needed

### 🔄 Verification Workflow

- **Proof Creation**: Generate anonymous commitments for documents
- **Verification Requests**: Request verification of specific proofs
- **Proof Verification**: Verify proofs without revealing original data
- **Request Management**: Complete verification requests with results

### 📊 Management Features

- **Proof Gallery**: View all your created proofs
- **Status Tracking**: Monitor proof validity and revocation status
- **Statistics Dashboard**: Track total proofs and system usage
- **Detailed Analytics**: View proof details and transaction history

## Technical Implementation

### Smart Contract: ZKProofVerifier.sol

The core smart contract manages ZK proofs on the blockchain:

```solidity
contract ZKProofVerifier {
    struct ZKProof {
        uint256 proofId;
        address owner;
        bytes32 commitment; // Hash of document + salt
        bytes32 nullifier; // Prevents double-spending
        uint256 timestamp;
        bool isValid;
        bool isRevoked;
    }

    struct VerificationRequest {
        uint256 requestId;
        address requester;
        uint256 proofId;
        uint256 timestamp;
        bool isVerified;
        string verificationReason;
    }
}
```

#### Key Functions:

- `createZKProof(bytes32 commitment, bytes32 nullifier)`: Create new ZK proof
- `verifyZKProof(uint256 proofId, bytes proofData)`: Verify ZK proof
- `revokeZKProof(uint256 proofId)`: Revoke proof (owner only)
- `createVerificationRequest(uint256 proofId, string reason)`: Request verification
- `completeVerificationRequest(uint256 requestId, bool isVerified, string reason)`: Complete verification

### Backend Service: zkProofService.js

The backend service handles ZK proof operations and blockchain interactions:

#### Core Functions:

- `generateCommitment(documentHash, salt)`: Create commitment hash
- `generateNullifier(documentHash, secret)`: Generate nullifier
- `createZKProof(documentHash, salt, secret, privateKey)`: Create proof on-chain
- `verifyZKProof(proofId, proofData, privateKey)`: Verify proof
- `revokeZKProof(proofId, privateKey)`: Revoke proof
- `getUserProofs(address)`: Get user's proofs
- `getProofDetails(proofId)`: Get proof details

### Frontend Components

#### useZKProof.ts Composable

Provides frontend logic for ZK proof operations:

```typescript
export function useZKProof() {
  const createZKProof = async (documentHash: string, privateKey: string)
  const verifyZKProof = async (proofId: string, proofData: string, privateKey: string)
  const revokeZKProof = async (proofId: string, privateKey: string)
  const getUserProofs = async (address: string)
  // ... additional functions
}
```

#### ZKProofPage.vue

Main interface for ZK proof operations:

- **Proof Creation**: Create new anonymous proofs
- **Proof Verification**: Verify existing proofs
- **Proof Management**: View and manage user proofs
- **Verification Requests**: Create and manage verification requests
- **Statistics Dashboard**: View system statistics

## API Endpoints

### Proof Management

#### POST /zkproof/create

Create a new ZK proof commitment.

**Request:**

```json
{
  "documentHash": "0x1234...",
  "privateKey": "0xabcd..."
}
```

**Response:**

```json
{
  "success": true,
  "proofId": "1",
  "commitment": "0x5678...",
  "nullifier": "0x9abc...",
  "salt": "def012...",
  "secret": "345678...",
  "transactionHash": "0xdef0...",
  "timestamp": 1640995200
}
```

#### POST /zkproof/verify

Verify a ZK proof.

**Request:**

```json
{
  "proofId": "1",
  "proofData": "additional_data",
  "privateKey": "0xabcd..."
}
```

**Response:**

```json
{
  "success": true,
  "isValid": true,
  "proofId": "1",
  "owner": "0x1234...",
  "commitment": "0x5678...",
  "timestamp": "1640995200"
}
```

#### POST /zkproof/revoke

Revoke a ZK proof (owner only).

**Request:**

```json
{
  "proofId": "1",
  "privateKey": "0xabcd..."
}
```

**Response:**

```json
{
  "success": true,
  "proofId": "1",
  "transactionHash": "0xdef0...",
  "timestamp": 1640995200
}
```

### Verification Requests

#### POST /zkproof/verification-request

Create a verification request.

**Request:**

```json
{
  "proofId": "1",
  "reason": "Background check",
  "privateKey": "0xabcd..."
}
```

**Response:**

```json
{
  "success": true,
  "requestId": "2",
  "proofId": "1",
  "reason": "Background check",
  "transactionHash": "0xdef0...",
  "timestamp": 1640995200
}
```

#### POST /zkproof/complete-verification

Complete a verification request.

**Request:**

```json
{
  "requestId": "2",
  "isVerified": true,
  "reason": "Verification successful",
  "privateKey": "0xabcd..."
}
```

**Response:**

```json
{
  "success": true,
  "requestId": "2",
  "isVerified": true,
  "reason": "Verification successful",
  "transactionHash": "0xdef0...",
  "timestamp": 1640995200
}
```

### Query Endpoints

#### GET /zkproof/user-proofs/{address}

Get all proofs for a user.

**Response:**

```json
{
  "success": true,
  "proofs": [
    {
      "proofId": "1",
      "owner": "0x1234...",
      "commitment": "0x5678...",
      "nullifier": "0x9abc...",
      "timestamp": "1640995200",
      "isValid": true,
      "isRevoked": false
    }
  ],
  "count": 1
}
```

#### GET /zkproof/proof/{proofId}

Get proof details.

**Response:**

```json
{
  "success": true,
  "proof": {
    "proofId": "1",
    "owner": "0x1234...",
    "commitment": "0x5678...",
    "nullifier": "0x9abc...",
    "timestamp": "1640995200",
    "isValid": true,
    "isRevoked": false
  }
}
```

#### GET /zkproof/verification-request/{requestId}

Get verification request details.

**Response:**

```json
{
  "success": true,
  "request": {
    "requestId": "2",
    "requester": "0x5678...",
    "proofId": "1",
    "timestamp": "1640995200",
    "isVerified": true,
    "verificationReason": "Background check completed"
  }
}
```

#### GET /zkproof/total

Get total number of proofs.

**Response:**

```json
{
  "success": true,
  "count": "10"
}
```

## Usage Examples

### Creating a ZK Proof

1. **Generate Document Hash**: Hash your document using SHA-256
2. **Create Proof**: Use the document hash to create an anonymous proof
3. **Store Secrets**: Securely store the salt and secret for future use

```javascript
// Frontend example
const documentHash = '0x1234567890abcdef...';
const privateKey = '0xabcd...';

const result = await createZKProof(documentHash, privateKey);
if (result.success) {
  console.log('Proof created:', result.proofId);
  // Store salt and secret securely
  localStorage.setItem(
    'proof_' + result.proofId,
    JSON.stringify({
      salt: result.salt,
      secret: result.secret,
    })
  );
}
```

### Verifying a ZK Proof

1. **Get Proof ID**: Obtain the proof ID to verify
2. **Verify Proof**: Submit verification request
3. **Check Result**: Review verification results

```javascript
// Frontend example
const proofId = '1';
const proofData = 'verification_data';
const privateKey = '0xabcd...';

const result = await verifyZKProof(proofId, proofData, privateKey);
if (result.success && result.isValid) {
  console.log('Proof is valid!');
} else {
  console.log('Proof verification failed');
}
```

### Managing Proofs

```javascript
// Get user's proofs
const userProofs = await getUserProofs(userAddress);
userProofs.proofs.forEach((proof) => {
  console.log(`Proof ${proof.proofId}: ${proof.isValid ? 'Valid' : 'Invalid'}`);
});

// Revoke a proof
const revokeResult = await revokeZKProof(proofId, privateKey);
if (revokeResult.success) {
  console.log('Proof revoked successfully');
}
```

## Security Considerations

### Privacy Protection

- **Commitment Schemes**: Document hashes are never stored directly
- **Salt Generation**: Random salts ensure uniqueness
- **Nullifier Prevention**: Prevents double-spending of proofs
- **Selective Disclosure**: Users control what information is revealed

### Cryptographic Security

- **SHA-256 Hashing**: Secure document hashing
- **Random Generation**: Cryptographically secure random values
- **Private Key Management**: Secure private key handling
- **Transaction Signing**: All blockchain operations are signed

### Access Control

- **Owner Verification**: Only proof owners can revoke proofs
- **Request Authorization**: Verification requests require proper authorization
- **Status Validation**: Proofs are validated before operations

## Environment Variables

### Backend (.env)

```bash
# ZK Proof Contract
ZK_PROOF_VERIFIER_ADDRESS=0x1234567890abcdef...

# Blockchain Configuration
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID

# API Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Contract Addresses
VITE_ZK_PROOF_VERIFIER_ADDRESS=0x1234567890abcdef...
```

## Testing

### Smart Contract Testing

```bash
cd contracts
npx hardhat test
```

### Backend API Testing

```bash
# Test ZK proof creation
curl -X POST http://localhost:3000/zkproof/create \
  -H "Content-Type: application/json" \
  -d '{
    "documentHash": "0x1234...",
    "privateKey": "0xabcd..."
  }'
```

### Frontend Testing

```bash
cd frontend
npm run test
```

## Performance Considerations

### Gas Optimization

- **Batch Operations**: Group multiple operations when possible
- **Efficient Storage**: Optimize contract storage patterns
- **Event Usage**: Use events for off-chain data retrieval

### Scalability

- **Proof Batching**: Process multiple proofs in single transactions
- **Caching**: Cache frequently accessed proof data
- **Indexing**: Maintain efficient proof indexing

## Troubleshooting

### Common Issues

#### "Commitment already exists"

- **Cause**: Trying to create proof with existing commitment
- **Solution**: Generate new salt and secret

#### "Nullifier already used"

- **Cause**: Attempting to reuse nullifier
- **Solution**: Generate new secret for each proof

#### "Proof does not exist"

- **Cause**: Invalid proof ID
- **Solution**: Verify proof ID is correct

#### "Only owner can revoke"

- **Cause**: Attempting to revoke proof without ownership
- **Solution**: Use correct private key for proof owner

### Debug Mode

Enable debug logging in backend:

```javascript
// In zkProofService.js
console.log('Debug:', { documentHash, commitment, nullifier });
```

## Integration with Document Verification

### Workflow Integration

1. **Document Upload**: User uploads document to main system
2. **Hash Generation**: System generates document hash
3. **ZK Proof Creation**: Create anonymous proof for document
4. **Verification**: Use ZK proof for verification without revealing document

### API Integration

```javascript
// Integrate with existing document verification
const documentHash = await generateDocumentHash(file);
const zkProof = await createZKProof(documentHash, privateKey);

// Store proof reference with document
await storeDocumentWithProof(documentId, zkProof.proofId);
```

## Future Enhancements

### Advanced ZK Features

- **ZK-SNARK Integration**: Implement actual zero-knowledge proofs
- **Range Proofs**: Prove values within specific ranges
- **Set Membership**: Prove membership in sets without revealing elements

### Privacy Features

- **Ring Signatures**: Enhanced privacy for proof creation
- **Mixer Integration**: Anonymous proof transfers
- **Privacy Pools**: Group privacy features

### Scalability Improvements

- **Layer 2 Integration**: Use Polygon zkEVM for scaling
- **Proof Aggregation**: Batch multiple proofs
- **Off-chain Verification**: Reduce on-chain operations

## Resources

### Documentation

- [Zero-Knowledge Proofs](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
- [Commitment Schemes](https://en.wikipedia.org/wiki/Commitment_scheme)
- [Ethereum Privacy](https://ethereum.org/en/privacy/)

### Tools and Libraries

- [Circom](https://docs.circom.io/): ZK-SNARK circuit compiler
- [SnarkJS](https://github.com/iden3/snarkjs): ZK-SNARK toolkit
- [Hardhat](https://hardhat.org/): Ethereum development environment

### Community

- [ZK Proof Discord](https://discord.gg/zkproof)
- [Ethereum Research](https://ethresear.ch/)
- [Privacy Tools](https://privacy.tools/)

---

This ZK-Proof system provides a robust foundation for privacy-preserving document verification while maintaining security and usability. The modular design allows for easy integration with existing systems and future enhancements.
