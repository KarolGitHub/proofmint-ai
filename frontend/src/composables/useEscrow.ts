import { ref } from 'vue';
import { api } from 'src/boot/axios';

export function useEscrow() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function createEscrow(payee: string, amount: string, documentHash: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/payment/escrow', { payee, amount, documentHash });
      return res.data.escrowId;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getEscrow(escrowId: string | number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/payment/escrow/${escrowId}`);
      return res.data.escrow;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function releaseEscrow(escrowId: string | number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/payment/release', { escrowId });
      return res.data.success;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function refundEscrow(escrowId: string | number) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/payment/refund', { escrowId });
      return res.data.success;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function mintReceipt(to: string, documentHash: string, tokenURI: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/payment/mint-receipt', { to, documentHash, tokenURI });
      return res.data.tokenId;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    createEscrow,
    getEscrow,
    releaseEscrow,
    refundEscrow,
    mintReceipt,
  };
}
