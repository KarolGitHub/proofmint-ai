# 🚀 Backend Deployment Guide

## Overview

This guide explains how to deploy the ProofMintAI backend to production environments.

## Contract Artifacts

### Option 1: Include Contract Artifacts (Recommended)

If you want full blockchain functionality:

1. **Compile contracts before deployment:**

   ```bash
   cd contracts
   npm install
   npx hardhat compile
   ```

2. **Copy artifacts to backend:**

   ```bash
   cp -r artifacts/contracts ../backend/contracts/
   ```

3. **Deploy with artifacts included**

### Option 2: Deploy Without Artifacts (Fallback Mode)

If you don't need blockchain features or want to deploy quickly:

1. **Deploy backend without contract artifacts**
2. **Backend will use fallback ABIs**
3. **Blockchain features will be disabled**
4. **AI, IPFS, and other features will work normally**

## Environment Variables

Required for full functionality:

```bash
# Blockchain
NOTARY_CONTRACT_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
AMOY_RPC_URL=https://...
PRIVATE_KEY=0x...

# AI Services
OPENAI_API_KEY=sk-...

# Storage
WEB3_STORAGE_TOKEN=eyJ...
```

## Production Build

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Health Check

Monitor backend health at `/health` endpoint:

- System status
- Contract availability
- Blockchain connectivity
- Environment configuration

## Troubleshooting

### Contract Not Found Errors

- Ensure contract artifacts are compiled and copied
- Or deploy in fallback mode (no blockchain features)

### Blockchain Connection Issues

- Check RPC URL and network connectivity
- Verify contract addresses are correct
- Ensure private key has sufficient funds

## Performance

- Backend runs without blockchain features if contracts unavailable
- AI and IPFS services work independently
- Graceful degradation for missing components
