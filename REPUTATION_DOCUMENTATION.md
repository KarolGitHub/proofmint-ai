# 🏆 Reputation & KYC Badge System Documentation

## Overview

ProofMintAI includes a comprehensive reputation and KYC (Know Your Customer) badge system that rewards users for positive platform engagement and provides identity verification. The system uses NFT-based badges stored on the blockchain for transparency and immutability.

## 🚀 Features

### ✅ **NFT-Based Badge System**

- ERC-721 badges for reputation and KYC verification
- On-chain storage for transparency and immutability
- Multiple badge types and levels (Bronze, Silver, Gold, Platinum)
- Automatic badge issuance based on user activity

### ✅ **KYC Verification**

- Identity verification for enhanced trust
- KYC Verified badge for verified users
- Timestamp tracking for verification dates
- Integration with document notarization workflow

### ✅ **Reputation Scoring**

- Dynamic reputation calculation based on user activity
- Positive actions increase score (notarizations, successful transactions)
- Negative actions decrease score (failed transactions, disputes)
- Time-based reputation growth

### ✅ **Badge Types**

- **KYC Verified**: Identity verification completed
- **Trusted User**: Good reputation (100+ points)
- **Premium User**: High reputation (500+ points)
- **Verifier**: Document verification specialist (1000+ points)
- **Moderator**: Platform moderator (2000+ points)
- **Developer**: Platform developer (5000+ points)

## 🛠 Technical Implementation

### Smart Contract

#### `contracts/ReputationBadge.sol`

- **Standard**: ERC-721 with URI storage
- **Access Control**: Only backend can issue/revoke badges
- **Features**: Badge types, levels, expiration, reputation tracking
- **Network**: Polygon Mumbai testnet

#### Key Functions:

```solidity
// Issue a badge
function issueBadge(address recipient, BadgeType badgeType, BadgeLevel level, uint256 expiresAt, string memory metadata)

// Update reputation score
function updateReputation(address user, uint256 newScore)

// Verify KYC
function verifyKYC(address user)

// Check badge status
function hasBadge(address user, BadgeType badgeType) external view returns (bool)
```

### Backend Services

#### `backend/services/reputationService.js`

- **Badge Management**: Issue, revoke, and query badges
- **Reputation Calculation**: Dynamic score calculation
- **KYC Integration**: Identity verification workflow
- **Profile Management**: Comprehensive user profiles

#### Key Functions:

```javascript
// Issue badge with metadata
issueBadge(recipient, badgeType, level, expiresAt, metadata);

// Update user reputation
updateReputation(user, newScore);

// Verify KYC
verifyKYC(user);

// Get comprehensive user profile
getUserProfile(user);
```

### Frontend Components

#### `frontend/src/pages/ReputationPage.vue`

- **Profile Display**: Reputation score, KYC status, badges
- **Badge Gallery**: Visual badge display with details
- **KYC Verification**: Identity verification workflow
- **Reputation Calculator**: Score estimation tool

#### `frontend/src/composables/useReputation.ts`

- **API Integration**: Complete reputation management
- **Badge Utilities**: Type/level names, colors, icons
- **Error Handling**: Comprehensive error management
- **Loading States**: Progress tracking

## 🔧 API Endpoints

### Profile Management

```
GET /reputation/profile/{user}
GET /reputation/score/{user}
POST /reputation/update
```

### KYC Management

```
POST /reputation/kyc/verify
GET /reputation/kyc/status/{user}
```

### Badge Management

```
GET /reputation/badges/{user}
POST /reputation/badges/issue
POST /reputation/badges/revoke
GET /reputation/badges/{tokenId}
GET /reputation/badges/check/{user}/{badgeType}
```

### Utilities

```
GET /reputation/requirements/{badgeType}
POST /reputation/calculate
```

## 📊 Reputation Calculation

### Score Components

```javascript
let score = 0;

// Base score for joining
score += 10;

// Document notarizations (50 points each)
score += notarizations * 50;

// Successful transactions (25 points each)
score += successfulTransactions * 25;

// Time on platform (2 points per day, max 100)
score += Math.min(daysOnPlatform * 2, 100);

// Community contributions (10 points each)
score += communityContributions * 10;

// Penalties
score -= failedTransactions * 10;
score -= disputes * 20;

// Ensure non-negative
return Math.max(score, 0);
```

### Badge Requirements

- **KYC Verified**: No requirements (manual verification)
- **Trusted User**: 100 reputation points
- **Premium User**: 500 reputation points
- **Verifier**: 1000 reputation points
- **Moderator**: 2000 reputation points
- **Developer**: 5000 reputation points

## 🎨 Badge Design

### Badge Types & Colors

- **KYC Verified** (Green): Identity verification
- **Trusted User** (Blue): Good reputation
- **Premium User** (Purple): High reputation
- **Verifier** (Orange): Document specialist
- **Moderator** (Red): Platform moderator
- **Developer** (Grey): Platform developer

### Badge Levels

- **Bronze** (0): Basic level
- **Silver** (1): Intermediate level
- **Gold** (2): Advanced level
- **Platinum** (3): Expert level

## 🚀 Usage Examples

### 1. Get User Profile

```javascript
const profile = await getUserProfile(userAddress);
console.log('Reputation Score:', profile.reputationScore);
console.log('KYC Verified:', profile.kycVerified);
console.log('Active Badges:', profile.activeBadges);
```

### 2. Verify KYC

```javascript
const success = await verifyKYC(userAddress);
if (success) {
  console.log('KYC verification successful');
}
```

### 3. Check Badge Status

```javascript
const hasTrustedBadge = await hasBadge(userAddress, 1); // TRUSTED_USER
console.log('Has Trusted User badge:', hasTrustedBadge);
```

### 4. Calculate Reputation

```javascript
const score = await calculateReputationScore({
  notarizations: 5,
  successfulTransactions: 10,
  daysOnPlatform: 30,
  communityContributions: 2,
});
console.log('Estimated score:', score);
```

## 🔧 Environment Variables

### Backend Required

```bash
REPUTATION_BADGE_ADDRESS=your_reputation_contract_address
PRIVATE_KEY=your_backend_private_key
AMOY_RPC_URL=https://www.okx.com/amoy
```

### Frontend Required

```bash
VITE_REPUTATION_BADGE_ADDRESS=your_reputation_contract_address
VITE_AMOY_RPC_URL=https://www.okx.com/amoy
```

## 🧪 Testing

### Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

### Test Badge Issuance

```bash
cd backend
node -e "
const service = require('./services/reputationService');
service.issueBadge(
  '0x...', // recipient
  0,        // KYC_VERIFIED
  0,        // BRONZE level
  0,        // no expiration
  'https://ipfs.io/metadata.json'
).then(console.log);
"
```

## 📊 Badge Features

### Metadata Structure

```json
{
  "name": "ProofMintAI KYC Verified Badge",
  "description": "Identity verification completed",
  "image": "https://ipfs.io/badge-image.png",
  "attributes": [
    {
      "trait_type": "Badge Type",
      "value": "KYC Verified"
    },
    {
      "trait_type": "Level",
      "value": "Bronze"
    },
    {
      "trait_type": "Issued Date",
      "value": "2024-01-01T00:00:00.000Z"
    }
  ],
  "external_url": "https://proofmintai.com"
}
```

### Badge Lifecycle

1. **Eligibility**: User meets badge requirements
2. **Issuance**: Backend issues badge NFT
3. **Display**: Badge shown in user profile
4. **Verification**: Badge can be verified on blockchain
5. **Expiration**: Optional expiration dates
6. **Revocation**: Badges can be revoked if needed

## 🔍 Troubleshooting

### Common Issues

1. **"Contract not deployed"**

   - Deploy ReputationBadge contract first
   - Set REPUTATION_BADGE_ADDRESS environment variable

2. **"Failed to issue badge"**

   - Check backend private key
   - Verify contract owner permissions
   - Ensure sufficient gas for transaction

3. **"KYC verification failed"**

   - Check user address format
   - Verify backend permissions
   - Ensure contract is properly deployed

4. **"Reputation score not updating"**
   - Check reputation calculation logic
   - Verify user activity data
   - Ensure score update transactions succeed

## 🔄 Integration Workflow

### Complete Reputation Flow

1. **User Registration** → Base reputation score assigned
2. **Platform Activity** → Score increases with positive actions
3. **Badge Eligibility** → Automatic badge issuance when requirements met
4. **KYC Verification** → Manual verification process
5. **Profile Display** → Badges and reputation shown to users

### KYC Verification Process

1. **User Request** → User initiates KYC verification
2. **Document Upload** → Identity documents submitted
3. **Manual Review** → Backend reviews documents
4. **Verification** → KYC status updated on blockchain
5. **Badge Issuance** → KYC Verified badge minted

## 🎯 Future Enhancements

### Planned Features

- [ ] Automated KYC verification
- [ ] Reputation-based access control
- [ ] Badge trading marketplace
- [ ] Advanced reputation algorithms
- [ ] Cross-chain badge bridges

### Advanced Features

- [ ] Reputation-based fee discounts
- [ ] Badge-based governance voting
- [ ] Dynamic badge requirements
- [ ] Reputation staking
- [ ] Badge-based rewards system

## 📚 Resources

- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Polygon Mumbai Testnet](https://mumbai.polygonscan.com/)
- [NFT Metadata Standards](https://docs.opensea.io/docs/metadata-standards)

---

**Note**: The reputation system provides transparent, on-chain verification of user trust and identity. Badges are immutable NFTs that can be verified on the blockchain, ensuring authenticity and preventing forgery.
