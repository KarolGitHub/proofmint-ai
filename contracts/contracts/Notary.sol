// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Notary
 * @dev This contract allows for storing and verifying document hashes on the blockchain.
 * It serves as a proof of existence for a document at a specific point in time.
 */
contract Notary is Ownable {
    // Mapping from a document hash (bytes32) to the timestamp it was recorded
    mapping(bytes32 => uint256) private _documentHashes;

    // Event to be emitted when a new document hash is recorded
    event DocumentHashRecorded(bytes32 indexed documentHash, address indexed recorder, uint256 timestamp);

    /**
     * @dev Records a document hash on the blockchain, linking it to the sender and timestamp.
     * The hash must not have been previously recorded.
     * @param documentHash The SHA-256 hash of the document to be recorded.
     */
    function recordDocument(bytes32 documentHash) public {
        require(_documentHashes[documentHash] == 0, "Notary: Document hash already recorded.");
        _documentHashes[documentHash] = block.timestamp;
        emit DocumentHashRecorded(documentHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifies if a document hash has been recorded and returns its timestamp.
     * @param documentHash The SHA-256 hash of the document to verify.
     * @return The timestamp when the document was recorded. Returns 0 if not found.
     */
    function getDocumentTimestamp(bytes32 documentHash) public view returns (uint256) {
        return _documentHashes[documentHash];
    }
} 