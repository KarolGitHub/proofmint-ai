import { ethers } from 'ethers';
import type { providers } from 'ethers';
import ReceiptNFTAbi from '../contracts/ReceiptNFT.json';

const RECEIPT_NFT_ADDRESS = import.meta.env.VITE_RECEIPT_NFT_ADDRESS;
const AMOY_EXPLORER = 'https://www.oklink.com/amoy';

type ReceiptNFTMetadata = {
  name?: string;
  description?: string;
  image?: string;
  documentHash?: string;
  timestamp?: number;
};

type ReceiptNFT = {
  tokenId: string;
  tokenURI: string;
  name: string;
  description: string;
  image: string;
  documentHash: string;
  timestamp: number;
  explorerUrl: string;
};

export async function fetchReceiptNFTs(
  address: string,
  provider: providers.Provider,
): Promise<ReceiptNFT[]> {
  const contract = new ethers.Contract(RECEIPT_NFT_ADDRESS, ReceiptNFTAbi, provider);
  const balance = await contract.balanceOf(address);
  const tokenIds = [];
  for (let i = 0; i < balance; i++) {
    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
    tokenIds.push(tokenId.toString());
  }
  const nfts: ReceiptNFT[] = [];
  for (const tokenId of tokenIds) {
    const tokenURI = await contract.tokenURI(tokenId);
    const docHash = await contract.getDocumentHash(tokenId);
    // Fetch metadata from IPFS
    let metadata: ReceiptNFTMetadata = {};
    try {
      const res = await fetch(tokenURI);
      metadata = await res.json();
    } catch {
      metadata = {
        name: 'Error loading metadata',
        image: '',
        description: '',
        documentHash: '',
        timestamp: 0,
      };
    }
    nfts.push({
      tokenId,
      tokenURI,
      name: metadata.name || 'Receipt NFT',
      description: metadata.description || '',
      image: metadata.image || '',
      documentHash: metadata.documentHash || docHash,
      timestamp: metadata.timestamp || 0,
      explorerUrl: `${AMOY_EXPLORER}/token/${RECEIPT_NFT_ADDRESS}?a=${tokenId}`,
    });
  }
  return nfts;
}
