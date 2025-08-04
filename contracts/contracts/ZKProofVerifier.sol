// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ZKProofVerifier
 * @dev Smart contract for ZK-proof anonymized document verification
 * Allows users to prove document ownership without revealing the actual document hash
 */
contract ZKProofVerifier is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _proofIdCounter;

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

    // Mapping from proofId to ZKProof
    mapping(uint256 => ZKProof) public proofs;

    // Mapping from commitment to proofId (for uniqueness)
    mapping(bytes32 => uint256) public commitmentToProofId;

    // Mapping from nullifier to bool (for double-spending prevention)
    mapping(bytes32 => bool) public nullifierUsed;

    // Mapping from requestId to VerificationRequest
    mapping(uint256 => VerificationRequest) public verificationRequests;

    // User's proofs mapping
    mapping(address => uint256[]) public userProofs;

    // Events
    event ZKProofCreated(uint256 indexed proofId, address indexed owner, bytes32 commitment, uint256 timestamp);
    event ZKProofVerified(uint256 indexed proofId, address indexed verifier, bool isValid, uint256 timestamp);
    event ZKProofRevoked(uint256 indexed proofId, address indexed owner, uint256 timestamp);
    event VerificationRequestCreated(uint256 indexed requestId, address indexed requester, uint256 indexed proofId);
    event VerificationRequestCompleted(uint256 indexed requestId, bool isVerified, string reason);

    constructor() {
        _proofIdCounter.increment(); // Start from 1
    }

    /**
     * @dev Create a new ZK proof commitment
     * @param commitment Hash of document + salt
     * @param nullifier Prevents double-spending
     */
    function createZKProof(bytes32 commitment, bytes32 nullifier) external {
        require(commitment != bytes32(0), "Invalid commitment");
        require(nullifier != bytes32(0), "Invalid nullifier");
        require(commitmentToProofId[commitment] == 0, "Commitment already exists");
        require(!nullifierUsed[nullifier], "Nullifier already used");

        uint256 proofId = _proofIdCounter.current();
        _proofIdCounter.increment();

        ZKProof memory newProof = ZKProof({
            proofId: proofId,
            owner: msg.sender,
            commitment: commitment,
            nullifier: nullifier,
            timestamp: block.timestamp,
            isValid: true,
            isRevoked: false
        });

        proofs[proofId] = newProof;
        commitmentToProofId[commitment] = proofId;
        nullifierUsed[nullifier] = true;
        userProofs[msg.sender].push(proofId);

        emit ZKProofCreated(proofId, msg.sender, commitment, block.timestamp);
    }

    /**
     * @dev Verify a ZK proof (simplified verification for demo)
     * In a real implementation, this would use actual ZK-SNARK verification
     * @param proofId ID of the proof to verify
     * @param proofData Additional proof data (would contain actual ZK proof)
     * @return isValid Whether the proof is valid
     */
    function verifyZKProof(uint256 proofId, bytes calldata proofData) external returns (bool isValid) {
        ZKProof storage proof = proofs[proofId];
        require(proof.proofId != 0, "Proof does not exist");
        require(proof.isValid, "Proof is not valid");
        require(!proof.isRevoked, "Proof has been revoked");

        // Simplified verification - in real implementation, this would verify ZK-SNARK
        // For demo purposes, we'll consider it valid if proofData is not empty
        isValid = proofData.length > 0;

        emit ZKProofVerified(proofId, msg.sender, isValid, block.timestamp);
        return isValid;
    }

    /**
     * @dev Revoke a ZK proof (only owner can revoke)
     * @param proofId ID of the proof to revoke
     */
    function revokeZKProof(uint256 proofId) external {
        ZKProof storage proof = proofs[proofId];
        require(proof.proofId != 0, "Proof does not exist");
        require(proof.owner == msg.sender, "Only owner can revoke");
        require(!proof.isRevoked, "Proof already revoked");

        proof.isRevoked = true;
        proof.isValid = false;

        emit ZKProofRevoked(proofId, msg.sender, block.timestamp);
    }

    /**
     * @dev Create a verification request
     * @param proofId ID of the proof to verify
     * @param reason Reason for verification request
     */
    function createVerificationRequest(uint256 proofId, string calldata reason) external {
        ZKProof storage proof = proofs[proofId];
        require(proof.proofId != 0, "Proof does not exist");
        require(proof.isValid, "Proof is not valid");
        require(!proof.isRevoked, "Proof has been revoked");

        uint256 requestId = _proofIdCounter.current();
        _proofIdCounter.increment();

        VerificationRequest memory request = VerificationRequest({
            requestId: requestId,
            requester: msg.sender,
            proofId: proofId,
            timestamp: block.timestamp,
            isVerified: false,
            verificationReason: reason
        });

        verificationRequests[requestId] = request;

        emit VerificationRequestCreated(requestId, msg.sender, proofId);
    }

    /**
     * @dev Complete a verification request (only owner of proof can complete)
     * @param requestId ID of the verification request
     * @param isVerified Whether the verification was successful
     * @param reason Reason for the verification result
     */
    function completeVerificationRequest(uint256 requestId, bool isVerified, string calldata reason) external {
        VerificationRequest storage request = verificationRequests[requestId];
        require(request.requestId != 0, "Request does not exist");
        require(!request.isVerified, "Request already completed");

        ZKProof storage proof = proofs[request.proofId];
        require(proof.owner == msg.sender, "Only proof owner can complete verification");

        request.isVerified = isVerified;
        request.verificationReason = reason;

        emit VerificationRequestCompleted(requestId, isVerified, reason);
    }

    /**
     * @dev Get all proofs for a user
     * @param user Address of the user
     * @return Array of proof IDs
     */
    function getUserProofs(address user) external view returns (uint256[] memory) {
        return userProofs[user];
    }

    /**
     * @dev Get proof details
     * @param proofId ID of the proof
     * @return proof The ZKProof struct
     */
    function getProof(uint256 proofId) external view returns (ZKProof memory proof) {
        return proofs[proofId];
    }

    /**
     * @dev Get verification request details
     * @param requestId ID of the verification request
     * @return request The VerificationRequest struct
     */
    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory request) {
        return verificationRequests[requestId];
    }

    /**
     * @dev Check if a commitment exists
     * @param commitment The commitment to check
     * @return exists Whether the commitment exists
     */
    function commitmentExists(bytes32 commitment) external view returns (bool exists) {
        return commitmentToProofId[commitment] != 0;
    }

    /**
     * @dev Check if a nullifier has been used
     * @param nullifier The nullifier to check
     * @return used Whether the nullifier has been used
     */
    function nullifierUsed(bytes32 nullifier) external view returns (bool used) {
        return nullifierUsed[nullifier];
    }

    /**
     * @dev Get total number of proofs
     * @return count Total number of proofs created
     */
    function getTotalProofs() external view returns (uint256 count) {
        return _proofIdCounter.current() - 1;
    }
}