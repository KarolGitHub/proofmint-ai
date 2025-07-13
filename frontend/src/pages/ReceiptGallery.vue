<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">My Notarization Receipt NFTs</div>
    <div v-if="!account" class="q-mb-md">
      <q-btn color="primary" label="Connect Wallet" @click="connectWallet" />
    </div>
    <div v-else>
      <div class="q-mb-md">Connected: {{ account }}</div>
      <q-spinner v-if="loading" color="primary" size="2em" class="q-mb-md" />
      <q-btn color="primary" label="Refresh Gallery" @click="fetchGallery" :loading="loading" class="q-mb-md" />
      <q-banner v-if="error" class="bg-red-2 text-negative q-mb-md">{{ error }}</q-banner>
      <q-banner v-if="nfts.length === 0 && !loading" class="bg-grey-2">No receipt NFTs found for this
        address.</q-banner>
      <q-card v-for="nft in nfts" :key="nft.tokenId" class="q-mb-md">
        <q-card-section class="row items-center">
          <q-img :src="nft.image" :alt="nft.name" style="width: 120px; height: 120px; object-fit: contain;" />
          <div class="q-ml-md">
            <div class="text-h6">{{ nft.name }}</div>
            <div class="text-caption">Token ID: {{ nft.tokenId }}</div>
            <div class="q-mt-xs">{{ nft.description }}</div>
            <div class="q-mt-xs"><b>Document Hash:</b> <code>{{ nft.documentHash }}</code></div>
            <div class="q-mt-xs"><b>Timestamp:</b> {{ formatTimestamp(nft.timestamp) }}</div>
            <div class="q-mt-xs">
              <a :href="nft.explorerUrl" target="_blank">View on Explorer</a>
            </div>
            <div class="q-mt-xs">
              <a :href="nft.tokenURI" target="_blank">View Metadata</a>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { ethers } from 'ethers';
import ReceiptNFTAbi from '../contracts/ReceiptNFT.json';
import { fetchReceiptNFTs } from '../services/ContractService';
import { useRoute } from 'vue-router';

const RECEIPT_NFT_ADDRESS = import.meta.env.VITE_RECEIPT_NFT_ADDRESS;
const AMOY_EXPLORER = 'https://www.oklink.com/amoy';

const { account, connectWallet, provider } = useWallet();
const nfts = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function formatTimestamp(ts: number) {
  if (!ts) return '';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

async function fetchGallery() {
  if (!account.value || !provider.value) return;
  loading.value = true;
  error.value = null;
  nfts.value = [];
  try {
    nfts.value = await fetchReceiptNFTs(account.value, provider.value);
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch NFTs';
  } finally {
    loading.value = false;
  }
}

// Auto-fetch on wallet connect
if (account.value) fetchGallery();

watch([account, route], () => {
  if (account.value) fetchGallery();
});
</script>
