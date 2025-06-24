# 🔐 NotarAI – AI-Powered Decentralized Document Verification

**NotarAI** is a modern Web3 application that combines **Artificial Intelligence (AI)** and **Blockchain** to analyze, validate, and notarize documents in a fully decentralized and tamper-proof way.

Built with **Vue 3 + Quasar**, it delivers a seamless, high-performance user experience while leveraging **smart contracts**, **IPFS**, and **AI services** to enable trustless document authentication.

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

## 🧪 How It Works

1. User uploads a document (PDF/image)
2. Text is extracted using **OCR**
3. Extracted text is analyzed by AI (OpenAI or local model)
4. Metadata is returned to frontend, document is hashed using SHA-256
5. User connects MetaMask and signs the document hash
6. Smart contract stores the hash immutably on-chain
7. Optionally, the document is uploaded to IPFS
8. Users can verify the document anytime via its hash and transaction record

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js 18+**
- **npm** or **pnpm** (recommended for workspace monorepo)
- **MetaMask** installed in your browser
- **OpenAI API Key** (or Claude/Hugging Face alternative)
- **web3.storage API Token** (for IPFS upload)
- **Polygon Mumbai Testnet Wallet**
  - Get test MATIC: [Polygon Faucet](https://mumbaifaucet.com/)
- (Optional) **CapRover or Coolify** for easy deployment

---

### 🚧 Setup Instructions

#### 1. Frontend

bash
cd frontend
npm install
quasar dev

#### 2. Backend

cd backend
npm install
npm run dev

#### 3. Smart Contracts

cd contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network mumbai

🔐 Remember to set up .env files for:
API keys (OpenAI, web3.storage)
RPC provider (e.g. Alchemy or Infura for Mumbai)
Contract addresses

---

🔮 Roadmap
AI-driven document summary
Smart contract for hash storage
Wallet connection (MetaMask/Web3)
IPFS document uploads
Document verification page
IPFS encryption support
DAO voting for notarization
zkProof verification (privacy layer)
Mobile and Desktop builds

---

📷 UI Preview (Coming Soon)
Upload view with real-time document preview
AI output card with summary + metadata
Wallet connect + transaction success UI
Proof explorer with hash + block details

---

🧪 Testing
To run smart contract tests:
bash
cd contracts
npx hardhat test

For frontend testing (optional):
cd frontend
npm run test
Backend API can be tested via Postman or Swagger docs (autogenerated by FastAPI).

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
