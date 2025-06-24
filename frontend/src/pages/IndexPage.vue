<template>
  <q-page class="flex flex-center column q-gutter-md">
    <q-btn color="primary" label="Connect Wallet" @click="connectWallet" v-if="!account" />
    <div v-else>
      <div class="q-mb-md">Connected: {{ account }}</div>
      <input type="file" @change="onFileChange" />
      <div v-if="fileHash">
        <div class="q-mt-md">SHA-256 Hash: <code>{{ fileHash }}</code></div>
        <q-btn color="secondary" label="Record Hash on Blockchain" @click="recordHash" :disable="isRecording"
          class="q-mt-md" />
      </div>
      <div v-if="txHash">
        <div class="q-mt-md">Transaction Hash: <a :href="txExplorerUrl" target="_blank">{{ txHash }}</a></div>
      </div>
      <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>

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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWallet } from 'src/composables/useWallet';

const { account, notaryContract, connectWallet } = useWallet();

const fileHash = ref<string | null>(null);
const txHash = ref<string | null>(null);
const error = ref<string | null>(null);
const isRecording = ref(false);

const verifyFileHash = ref<string | null>(null);
const verifyResult = ref<number | null>(null);
const verifyError = ref<string | null>(null);
const isVerifying = ref(false);

const txExplorerUrl = computed(() =>
  txHash.value
    ? `https://www.oklink.com/amoy/tx/${txHash.value}`
    : ''
);

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
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
  if (!notaryContract.value?.recordDocument || !fileHash.value) {
    error.value = 'Contract not connected or file hash missing';
    return;
  }
  isRecording.value = true;
  try {
    const hashBytes32 = fileHash.value;
    const tx = await notaryContract.value.recordDocument(hashBytes32);
    const receipt = await tx.wait();
    txHash.value = receipt.hash;
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
</script>
