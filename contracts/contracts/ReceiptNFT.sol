// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReceiptNFT
 * @dev NFT receipt for document notarization. Only owner (backend) can mint.
 */
contract ReceiptNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    // Optional: mapping from tokenId to document hash
    mapping(uint256 => bytes32) public documentHashes;

    constructor() ERC721("ProofMintAI Receipt", "PMRECEIPT") {}

    /**
     * @dev Mint a receipt NFT to recipient, with document hash and optional URI.
     * Only owner (backend authority) can mint.
     */
    function mintReceipt(address to, bytes32 documentHash, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        documentHashes[tokenId] = documentHash;
        nextTokenId++;
        return tokenId;
    }

    /**
     * @dev Get document hash for a given tokenId.
     */
    function getDocumentHash(uint256 tokenId) external view returns (bytes32) {
        return documentHashes[tokenId];
    }
}