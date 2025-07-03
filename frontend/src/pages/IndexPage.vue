<template>
  <q-page class="flex flex-center column q-gutter-md">
    <q-btn color="primary" label="Connect Wallet" @click="connectWallet" v-if="!account" />
    <div v-else>
      <div class="q-mb-md">Connected: {{ account }}</div>
      <input type="file" @change="onFileChange" />
      <div v-if="fileHash">
        <div class="q-mt-md">SHA-256 Hash: <code>{{ fileHash }}</code></div>
        <div v-if="!escrowLinked">
          <q-form @submit.prevent="onCreateEscrowForDoc">
            <q-input filled v-model="escrowPayee" label="Payee Address" class="q-mb-sm" :error="!!errors.payee" :error-message="errors.payee" />
            <q-input filled v-model="escrowAmount" label="Amount (wei)" class="q-mb-sm" type="number" :error="!!errors.amount" :error-message="errors.amount" />
            <q-btn color="primary" label="Create Escrow for Notarization" type="submit" :loading="escrowLoading || isSubmitting" :disable="isSubmitting" class="q-mb-md" />
          </q-form>
          <div v-if="escrowError" class="text-negative q-mt-sm">{{ escrowError }}</div>
        </div>
        <div v-else>
          <div class="q-mt-sm">Escrow Created! ID: <b>{{ escrowId }}</b></div>
          <q-btn color="secondary" label="Get Escrow Details" @click="fetchEscrow" class="q-mt-sm" />
          <div v-if="escrowDetails">
            <div class="q-mt-sm">Payer: <code>{{ escrowDetails.payer }}</code></div>
            <div>Payee: <code>{{ escrowDetails.payee }}</code></div>
            <div>Amount: <code>{{ escrowDetails.amount }}</code> wei</div>
            <div>Status: <span v-if="escrowDetails.isReleased">Released</span><span v-else-if="escrowDetails.isRefunded">Refunded</span><span v-else>Pending</span></div>
          </div>
        </div>
        <q-btn color="secondary" label="Record Hash on Blockchain" @click="recordHash" :disable="isRecording || !escrowLinked" class="q-mt-md" />
      </div>
      <div v-if="txHash">
        <div class="q-mt-md">Transaction Hash: <a :href="txExplorerUrl" target="_blank">{{ txHash }}</a></div>
        <div v-if="escrowReleaseStatus" class="q-mt-md text-positive">{{ escrowReleaseStatus }}</div>
        <q-btn v-if="escrowLinked && escrowId && escrowDetails && !escrowDetails.isReleased && !escrowDetails.isRefunded && !escrowReleaseStatus" color="positive" label="Release Escrow" @click="releaseEscrow" class="q-mt-md" />
      </div>
      <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>

      <div v-if="recentDocs.length" class="q-mt-lg q-pa-md bg-grey-2 rounded-borders"
        style="width:100%;max-width:600px;">
        <div class="row items-center q-mb-md">
          <div class="text-h6">Recently Notarized This Session</div>
          <q-space />
          <q-btn flat dense icon="delete" color="negative" @click="clearRecentDocs" label="Clear" />
        </div>
        <q-list bordered>
          <q-item v-for="doc in recentDocs" :key="doc.hash">
            <q-item-section>
              <div><b>{{ doc.name }}</b></div>
              <div class="text-caption">{{ doc.hash }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-separator class="q-my-lg" />

      <div class="q-mb-md"><b>Verify Document</b></div>
      <input type="file" @change="onVerifyFileChange" />
      <div v-if="verifyFileHash">
        <div class="q-mt-md">SHA-256 Hash: <code>{{ verifyFileHash }}</code></div>
        <q-btn color="secondary" label="Check On-Chain" @click="verifyHash" :disable="isVerifying" class="q-mt-md" />
      </div>
      <div v-if="verifyResult !== null">
        <div class="q-mt-md">
          <span v-if="verifyResult > 0">✅ Document was notarized at: {{ formatTimestamp(verifyResult) }}</span>
          <span v-else>❌ Document hash not found on-chain</span>
        </div>
      </div>
      <div v-if="verifyError" class="text-negative q-mt-md">{{ verifyError }}</div>

      <q-separator class="q-my-lg" />

      <!-- Escrow/Payment Section -->
      <div class="q-mb-md"><b>Escrow Payment Demo</b></div>
      <q-form @submit.prevent="onCreateEscrowForDoc">
        <q-input filled v-model="escrowPayee" label="Payee Address" class="q-mb-sm" :error="!!errors.payee" :error-message="errors.payee" />
        <q-input filled v-model="escrowAmount" label="Amount (wei)" class="q-mb-sm" type="number" :error="!!errors.amount" :error-message="errors.amount" />
        <q-btn color="primary" label="Create Escrow" type="submit" :loading="escrowLoading || isSubmitting" :disable="isSubmitting" class="q-mb-md" />
      </q-form>
      <div v-if="escrowError" class="text-negative q-mt-sm">{{ escrowError }}</div>
      <div v-if="escrowId !== null" class="q-mt-md">
        <div>Escrow Created! ID: <b>{{ escrowId }}</b></div>
        <q-btn color="secondary" label="Get Escrow Details" @click="fetchEscrow" class="q-mt-sm" />
        <div v-if="escrowDetails">
          <div class="q-mt-sm">Payer: <code>{{ escrowDetails.payer }}</code></div>
          <div>Payee: <code>{{ escrowDetails.payee }}</code></div>
          <div>Amount: <code>{{ escrowDetails.amount }}</code> wei</div>
          <div>Status: <span v-if="escrowDetails.isReleased">Released</span><span v-else-if="escrowDetails.isRefunded">Refunded</span><span v-else>Pending</span></div>
          <q-btn color="positive" label="Release Escrow" @click="releaseEscrow" :disable="escrowDetails.isReleased || escrowDetails.isRefunded" class="q-mt-sm q-mr-sm" />
          <q-btn color="negative" label="Refund Escrow" @click="refundEscrow" :disable="escrowDetails.isReleased || escrowDetails.isRefunded" class="q-mt-sm" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useEscrow } from '../composables/useEscrow';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const { account, notaryContract, connectWallet } = useWallet();

const fileHash = ref<string | null>(null);
const txHash = ref<string | null>(null);
const error = ref<string | null>(null);
const isRecording = ref(false);

const RECENT_DOCS_KEY = 'recentNotarizedDocs';
const recentDocs = ref<{ name: string; hash: string }[]>([]);

const verifyFileHash = ref<string | null>(null);
const verifyResult = ref<number | null>(null);
const verifyError = ref<string | null>(null);
const isVerifying = ref(false);

const txExplorerUrl = computed(() =>
  txHash.value
    ? `https://www.oklink.com/amoy/tx/${txHash.value}`
    : ''
);

let lastFileName: string | null = null;

const escrowSchema = yup.object({
  payee: yup.string().required('Payee is required').matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: yup.string().required('Amount is required').matches(/^[0-9]+$/, 'Amount must be a number').test('is-positive', 'Amount must be positive', val => !!val && BigInt(val) > 0n),
});

const { handleSubmit, errors, isSubmitting, resetForm } = useForm({
  validationSchema: escrowSchema,
});
const { value: escrowPayee } = useField<string>('payee');
const { value: escrowAmount } = useField<string>('amount');

type EscrowDetails = {
  payer: string;
  payee: string;
  amount: string;
  isReleased: boolean;
  isRefunded: boolean;
};

const escrowId = ref<string | null>(null);
const escrowDetails = ref<EscrowDetails | null>(null);
const escrowLinked = ref(false);

const { loading: escrowLoading, error: escrowError, createEscrow, getEscrow, releaseEscrow: releaseEscrowApi, refundEscrow: refundEscrowApi } = useEscrow();

const escrowReleaseStatus = ref<string | null>(null);

onMounted(() => {
  const saved = localStorage.getItem(RECENT_DOCS_KEY);
  if (saved) {
    try {
      recentDocs.value = JSON.parse(saved);
    } catch { }
  }
});

watch(recentDocs, (val) => {
  localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(val));
}, { deep: true });

function clearRecentDocs() {
  recentDocs.value = [];
  localStorage.removeItem(RECENT_DOCS_KEY);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    lastFileName = file.name;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      fileHash.value = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    reader.readAsArrayBuffer(file);
  }
}

function onVerifyFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      verifyFileHash.value = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    reader.readAsArrayBuffer(file);
  }
}

async function recordHash() {
  error.value = null;
  txHash.value = null;
  escrowReleaseStatus.value = null;
  if (!notaryContract.value?.recordDocument || !fileHash.value) {
    error.value = 'Contract not connected or file hash missing';
    return;
  }
  if (!escrowLinked.value) {
    error.value = 'You must create an escrow before notarizing.';
    return;
  }
  isRecording.value = true;
  try {
    const hashBytes32 = fileHash.value;
    const tx = await notaryContract.value.recordDocument(hashBytes32);
    const receipt = await tx.wait();
    txHash.value = receipt.hash;
    // Add to recentDocs
    if (lastFileName && fileHash.value) {
      recentDocs.value.unshift({ name: lastFileName, hash: fileHash.value });
      // Limit to 5 recent docs
      if (recentDocs.value.length > 5) recentDocs.value.pop();
    }
    // Automatically release escrow after notarization
    if (escrowLinked.value && escrowId.value) {
      const released = await releaseEscrowApi(escrowId.value);
      if (released) {
        escrowReleaseStatus.value = 'Escrow released automatically after notarization.';
        await fetchEscrow();
      } else {
        escrowReleaseStatus.value = 'Failed to release escrow automatically.';
      }
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Transaction failed';
  } finally {
    isRecording.value = false;
  }
}

async function verifyHash() {
  verifyError.value = null;
  verifyResult.value = null;
  if (!notaryContract.value?.getDocumentTimestamp || !verifyFileHash.value) {
    verifyError.value = 'Contract not connected or file hash missing';
    return;
  }
  isVerifying.value = true;
  try {
    const timestamp = await notaryContract.value.getDocumentTimestamp(verifyFileHash.value);
    verifyResult.value = Number(timestamp);
  } catch (e: unknown) {
    verifyError.value = e instanceof Error ? e.message : 'Verification failed';
  } finally {
    isVerifying.value = false;
  }
}

function formatTimestamp(ts: number) {
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

const onCreateEscrowForDoc = handleSubmit(async (values) => {
  escrowId.value = null;
  escrowDetails.value = null;
  if (!fileHash.value) return;
  const id = await createEscrow(values.payee, values.amount, fileHash.value);
  if (id) {
    escrowId.value = id;
    escrowLinked.value = true;
    resetForm();
  }
});

async function fetchEscrow() {
  if (!escrowId.value) return;
  escrowDetails.value = await getEscrow(escrowId.value);
}

async function releaseEscrow() {
  if (!escrowId.value) return;
  await releaseEscrowApi(escrowId.value);
  await fetchEscrow();
}

async function refundEscrow() {
  if (!escrowId.value) return;
  await refundEscrowApi(escrowId.value);
  await fetchEscrow();
}
</script>
