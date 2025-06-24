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
</script>
