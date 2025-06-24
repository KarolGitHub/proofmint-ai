# 🔐 NotarAI – AI‑Powered + Crypto‑Enhanced Decentralized Document Verification

**NotarAI** is a modern Web3 application that combines **Artificial Intelligence (AI)**, **Blockchain**, and **Cryptocurrency mechanics** to analyze, validate, notarize, and optionally monetize documents in a fully decentralized and tamper-proof way.

Built with **Vue 3 + Quasar**, you’ll experience high-performance UI combined with smart contracts, IPFS, AI, and token-driven flows—all designed for next-gen trustless document workflows.

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

bash
notarai/
├── frontend/ # Quasar (Vue 3) frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── composables/
│ │ ├── services/ # JS modules calling backend
│ │ ├── contracts/ # ABI files
│ │ ├── css/
│ │ │ └── quasar.variables.scss
│ │ └── boot/ # Boot files (e.g., wallet, axios)
│ ├── public/
│ └── quasar.config.js

├── backend/ # Node.js Express backend
│ ├── routes/
│ │ ├── ai.js # POST /ai/summarize
│ │ ├── ipfs.js # POST /ipfs/upload
│ │ ├── ocr.js # POST /ocr/extract
│ │ └── hash.js # POST /hash/document
│ ├── services/
│ │ ├── openaiService.js # Talks to OpenAI/Claude
│ │ ├── ipfsService.js # Upload to IPFS (web3.storage)
│ │ ├── ocrService.js # Tesseract integration
│ │ └── cryptoUtils.js # Hashing functions (SHA-256)
│ ├── middleware/
│ │ └── multer.js # File upload config
│ ├── app.js # Express app entry point
│ └── .env

├── contracts/ # Hardhat project
│ ├── contracts/
│ │ └── Notary.sol
│ ├── scripts/
│ │ └── deploy.js
│ ├── test/
│ └── hardhat.config.js

├── docker/ # Docker + DevOps
│ ├── docker-compose.yml
│ ├── frontend.Dockerfile
│ ├── backend.Dockerfile
│ └── .env.example

├── .github/ # CI/CD config (GitHub Actions)
│ └── workflows/
│ └── deploy.yml

├── README.md
└── LICENSE

---

🌐 High-Level Architecture
pgsql
[Frontend: Vue 3 + Quasar]
↳ Uploads document
↳ Calls Express backend (OCR, AI, IPFS, Hash)
↳ Gets metadata + hash
↳ Signs with MetaMask (Ethers.js)
↳ Sends signed hash to smart contract (Polygon)

[Backend: Node.js + Express]
↳ OCR with Tesseract.js
↳ Metadata extraction with OpenAI
↳ IPFS file upload via web3.storage
↳ SHA-256 hashing and verification

---

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
- Polygon Mumbai testnet wallet (+ faucet MATIC)
- (Optional) CapRover/Coolify for deployment

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

🔮 Roadmap
AI document analysis
Document hashing & on-chain notarization
Wallet payment (MATIC or token escrow)
Mint receipt NFT
Encrypted/IPFS storage switches
Escrow payment flow
Wallet reputation/KYC badges
ZK-proof anonymized verification
Mobile/Desktop builds via Quasar

---

📷 UI Preview (Coming Soon)
Fully interactive upload+processing page
Wallet pay button + NFT receipt badge
Notary proof explorer dashboard

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
OpenAI
LangChain
Polygon
web3.storage
Quasar Framework
MetaMask
Tesseract.js

---
