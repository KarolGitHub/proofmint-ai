# 🔐 ProofMintAI – AI‑Powered + Crypto‑Enhanced Decentralized Document Verification

**ProofMintAI** is a modern Web3 application that combines **Artificial Intelligence (AI)**, **Blockchain**, and **Cryptocurrency mechanics** to analyze, validate, notarize, and optionally monetize documents in a fully decentralized and tamper-proof way.

Built with **Vue 3 + Quasar**, you'll experience high-performance UI combined with smart contracts, IPFS, AI, and token-driven flows—all designed for next-gen trustless document workflows.

---

## ✨ Key Features

### 🧠 AI-Enhanced Document Processing

- OCR-based text extraction from PDF and image documents
- Language model-driven metadata extraction (dates, signatories, clause detection)
- Document summarization and classification using OpenAI/Claude

### 🔗 Blockchain-Backed Proofs

- Immutable file hashes stored on the Polygon Mumbai testnet
- Smart contract-verifiable proof-of-existence and authenticity
- Cryptographic signing and transaction recording via MetaMask

### 🗂️ Decentralized Storage with IPFS

- Optional upload of documents to **IPFS** via [web3.storage](https://web3.storage/)
- Public or encrypted document access (future roadmap)

### 🦊 Web3 Wallet Integration

- MetaMask + WalletConnect support via `vue-dapp`
- Signature-based authorization of all blockchain operations

### 🔒 Privacy-First

- Local AI processing available
- No sensitive data shared externally without user consent

---

## 🛠 Tech Stack

| Layer          | Technologies                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Frontend**   | Vue 3, [Quasar Framework](https://quasar.dev/), TypeScript, Vite, Pinia, ethers.js, vue-dapp |
| **Backend**    | Node.js, Express.js, Tesseract.js (OCR), OpenAI API, dotenv, Multer, web3.storage SDK        |
| **Blockchain** | Solidity, Hardhat, Polygon Mumbai testnet, MetaMask, ethers.js                               |
| **Storage**    | IPFS via [web3.storage](https://web3.storage/)                                               |
| **AI Layer**   | OpenAI GPT (via API), optional: Hugging Face Transformers (for future integration)           |
| **DevOps**     | Docker, Docker Compose, GitHub Actions (CI/CD), CapRover or Coolify (PaaS), VS Code          |

---

## 📁 Project Structure

```bash
proofmintai/
├── frontend/ # Quasar (Vue 3) frontend
│ ├── src/components/
│ ├── src/pages/
│ ├── src/composables/
│ ├── src/services/ # backend API calls
│ ├── src/contracts/ # ABI + payment token contracts
│ ├── src/css/quasar.variables.scss
│ └── src/boot/ # wallet, axios, token logic
├── backend/ # Node.js API backend
│ ├── routes/
│ │ ├── ai.js # /ai/summarize
│ │ ├── ipfs.js # /ipfs/upload
│ │ ├── ocr.js # /ocr/extract
│ │ ├── hash.js # /hash/document
│ │ ├── payment.js # /payment/init & webhook
│ │ └── escrow.js # /escrow/create/release
│ ├── services/
│ │ ├── openaiService.js
│ │ ├── ipfsService.js
│ │ ├── ocrService.js
│ │ ├── cryptoUtils.js # hashing
│ │ └── paymentService.js # token & escrow logic
│ └── app.js
├── contracts/ # Solidity + Hardhat
│ ├── Notary.sol
│ ├── PaymentEscrow.sol
│ ├── ReceiptNFT.sol
│ ├── scripts/deploy.js
│ ├── test/
│ └── hardhat.config.js
├── docker/
│ ├── docker-compose.yml
│ ├── frontend.Dockerfile
│ ├── backend.Dockerfile
│ └── .env.example
├── .github/
│ └── workflows/deploy.yml
├── README.md
└── LICENSE
```

---

## 🌐 High-Level Architecture

[Frontend: Vue Quasar]

1. Files → POST to backend (OCR, AI, IPFS, hash)
2. User pays token via MetaMask → escrow or mint receipt NFT
3. Signed hash submitted to Notary contract
4. UI shows verification status + token receipt

[Backend: Node.js]

1. OCR via Tesseract.js
2. AI summary via OpenAI
3. IPFS upload via web3.storage
4. Hashing (SHA‑256)
5. Payment/Escrow logic
6. Smart contract interaction (via ethers.js)

---

## 🧪 How It Works

1. User uploads a document
2. OCR extracts text
3. AI parses clauses/metadata & produces summary
4. Document hash computed
5. User pays token fee (or triggers escrow flow)
6. Receipt NFT minted to user wallet
7. User signs hash and submits to smart contract
8. Hash stored on-chain and optionally IPFS link recorded
9. Verification UI shows chain proof + NFT/receipt

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- MetaMask or WalletConnect
- OpenAI API Key
- web3.storage API Token
- Polygon Mumbai testnet wallet (+ faucet MATIC)
- (Optional) CapRover/Coolify for deployment

---

### Setup Instructions

#### 1. Frontend

```bash
cd frontend
npm install
quasar dev
```

#### 2. Backend

```bash
cd backend
npm install
npm run dev
```

#### 3. Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network mumbai
```

🔐 Remember to set up .env files for:
API keys (OpenAI, web3.storage)
RPC provider (e.g. Alchemy or Infura for Mumbai)
Contract addresses

---

## 📚 Documentation

For comprehensive documentation on all features, components, and implementation details, see the **[📖 Documentation Hub](./docs/README.md)**.

The documentation includes:

- **Core Features**: AI analysis, blockchain notarization, IPFS storage, NFT system
- **Advanced Features**: Reputation badges, ZK-proofs, cross-platform builds
- **UI Components**: Enhanced interfaces, payment systems, dashboard
- **Development**: Setup guides, API references, troubleshooting

---

🔮 Roadmap

- [x] AI document analysis
- [x] Document hashing & on-chain notarization
- [x] Wallet payment (MATIC or token escrow)
- [x] Mint receipt NFT
- [x] Encrypted/IPFS storage switches (public & encrypted IPFS with UI)
- [x] Escrow payment flow (automated, event-driven, persisted)
- [x] Wallet reputation/KYC badges
- [x] ZK-proof anonymized verification
- [x] Mobile/Desktop builds via Quasar
- [x] UI Preview functionalities (enhanced upload+processing, wallet pay button + NFT receipt badge, notary proof explorer dashboard)

---

🧪 Testing
To run smart contract tests:

```bash
bash
cd contracts
npx hardhat test
```

For frontend testing (optional):

```bash
cd frontend
npm run test
Backend API can be tested via Postman or Swagger docs (autogenerated by FastAPI).
```

---

🙌 Acknowledgements
Thanks to:

1. OpenAI
2. LangChain
3. Polygon
4. web3.storage
5. Quasar Framework
6. MetaMask
7. Tesseract.js

---

## Backend Environment Variables

- `CORS_ORIGIN`: Comma-separated list of allowed origins for CORS. Example: `http://localhost:3000,https://myfrontend.com`. Use `*` to allow all origins (not recommended for production).
