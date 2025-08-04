import { ref } from 'vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ZKProof {
  proofId: string;
  owner: string;
  commitment: string;
  nullifier: string;
  timestamp: string;
  isValid: boolean;
  isRevoked: boolean;
}

export interface VerificationRequest {
  requestId: string;
  requester: string;
  proofId: string;
  timestamp: string;
  isVerified: boolean;
  verificationReason: string;
}

export interface ZKProofCreationResult {
  success: boolean;
  proofId?: string;
  commitment?: string;
  nullifier?: string;
  salt?: string;
  secret?: string;
  transactionHash?: string;
  timestamp?: number;
  error?: string;
}

export interface ZKProofVerificationResult {
  success: boolean;
  isValid?: boolean;
  proofId?: string;
  owner?: string;
  commitment?: string;
  timestamp?: string;
  error?: string;
}

export function useZKProof() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Create a new ZK proof commitment
   */
  async function createZKProof(
    documentHash: string,
    privateKey: string,
  ): Promise<ZKProofCreationResult> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/zkproof/create`, {
        documentHash,
        privateKey,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create ZK proof';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Verify a ZK proof
   */
  async function verifyZKProof(
    proofId: string,
    proofData: string,
    privateKey: string,
  ): Promise<ZKProofVerificationResult> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/zkproof/verify`, {
        proofId,
        proofData,
        privateKey,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to verify ZK proof';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Revoke a ZK proof
   */
  async function revokeZKProof(
    proofId: string,
    privateKey: string,
  ): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/zkproof/revoke`, {
        proofId,
        privateKey,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to revoke ZK proof';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a verification request
   */
  async function createVerificationRequest(
    proofId: string,
    reason: string,
    privateKey: string,
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/zkproof/verification-request`, {
        proofId,
        reason,
        privateKey,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to create verification request';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Complete a verification request
   */
  async function completeVerificationRequest(
    requestId: string,
    isVerified: boolean,
    reason: string,
    privateKey: string,
  ): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/zkproof/complete-verification`, {
        requestId,
        isVerified,
        reason,
        privateKey,
      });

      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to complete verification request';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get all proofs for a user
   */
  async function getUserProofs(
    address: string,
  ): Promise<{ success: boolean; proofs?: ZKProof[]; count?: number; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/zkproof/user-proofs/${address}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get user proofs';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get proof details
   */
  async function getProofDetails(
    proofId: string,
  ): Promise<{ success: boolean; proof?: ZKProof; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/zkproof/proof/${proofId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to get proof details';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get verification request details
   */
  async function getVerificationRequestDetails(
    requestId: string,
  ): Promise<{ success: boolean; request?: VerificationRequest; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/zkproof/verification-request/${requestId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to get verification request details';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get total number of proofs
   */
  async function getTotalProofs(): Promise<{ success: boolean; count?: string; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`${API_BASE_URL}/zkproof/total`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get total proofs';
      error.value = errorMessage;
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Generate a random salt for privacy
   */
  function generateSalt(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a random secret for nullifier
   */
  function generateSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Format timestamp for display
   */
  function formatTimestamp(timestamp: string | number): string {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  }

  /**
   * Get proof status color
   */
  function getProofStatusColor(proof: ZKProof): string {
    if (proof.isRevoked) return 'negative';
    if (proof.isValid) return 'positive';
    return 'warning';
  }

  /**
   * Get proof status text
   */
  function getProofStatusText(proof: ZKProof): string {
    if (proof.isRevoked) return 'Revoked';
    if (proof.isValid) return 'Valid';
    return 'Invalid';
  }

  /**
   * Get verification request status color
   */
  function getRequestStatusColor(request: VerificationRequest): string {
    if (!request.isVerified) return 'warning';
    return 'positive';
  }

  /**
   * Get verification request status text
   */
  function getRequestStatusText(request: VerificationRequest): string {
    if (!request.isVerified) return 'Pending';
    return 'Completed';
  }

  return {
    loading,
    error,
    createZKProof,
    verifyZKProof,
    revokeZKProof,
    createVerificationRequest,
    completeVerificationRequest,
    getUserProofs,
    getProofDetails,
    getVerificationRequestDetails,
    getTotalProofs,
    generateSalt,
    generateSecret,
    formatTimestamp,
    getProofStatusColor,
    getProofStatusText,
    getRequestStatusColor,
    getRequestStatusText,
  };
}
