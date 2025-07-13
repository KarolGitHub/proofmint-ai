<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">My Notarization Receipt NFTs</div>
    <div v-if="!account" class="q-mb-md">
      <q-btn color="primary" label="Connect Wallet" @click="connectWallet" />
    </div>
    <div v-else>
      <div class="q-mb-md">Connected: {{ account }}</div>
      <q-btn color="secondary" label="Back to Home" icon="home" @click="$router.push('/')" class="q-mb-md" />
      <q-spinner v-if="loading" color="primary" size="2em" class="q-mb-md" />
      <q-btn color="primary" label="Refresh Gallery" @click="fetchGallery" :loading="loading" class="q-mb-md" />
      <q-banner v-if="error" class="bg-red-2 text-negative q-mb-md">{{ error }}</q-banner>
      <q-banner v-if="nfts.length === 0 && !loading" class="bg-grey-2 q-pa-md text-center">
        <div>No receipt NFTs found for this address.</div>
        <q-btn color="primary" label="Mint a Receipt NFT" @click="$router.push('/')" class="q-mt-md" />
      </q-banner>
      <q-card v-for="nft in nfts" :key="nft.tokenId" class="q-mb-md" flat bordered>
        <q-card-section class="row items-center">
          <q-img :src="nft.image" :alt="nft.name" style="width: 120px; height: 120px; object-fit: contain;"
            @error="onImageError($event, nft)">
            <template #error>
              <div class="flex flex-center bg-grey-3 text-grey-7" style="width: 100%; height: 100%;">No Image</div>
            </template>
          </q-img>
          <div class="q-ml-md">
            <div class="text-h6">{{ nft.name }}</div>
            <div class="text-caption row items-center">
              Token ID: <span class="q-ml-xs">{{ nft.tokenId }}</span>
              <q-btn flat dense icon="content_copy" size="sm" @click="copyToClipboard(nft.tokenId, 'Token ID copied!')"
                aria-label="Copy Token ID" />
            </div>
            <div class="q-mt-xs">{{ nft.description }}</div>
            <div class="q-mt-xs row items-center">
              <b>Document Hash:</b> <code class="q-ml-xs">{{ nft.documentHash }}</code>
              <q-btn flat dense icon="content_copy" size="sm"
                @click="copyToClipboard(nft.documentHash, 'Document hash copied!')" aria-label="Copy Document Hash" />
            </div>
            <div class="q-mt-xs"><b>Timestamp:</b> {{ formatTimestamp(nft.timestamp) }}</div>
            <div class="q-mt-xs">
              <a :href="nft.explorerUrl" target="_blank" rel="noopener">View on Explorer</a>
            </div>
            <div class="q-mt-xs">
              <a :href="nft.tokenURI" target="_blank" rel="noopener">View Metadata</a>
            </div>
            <div class="q-mt-xs" v-if="nftOpenSeaUrl(nft.tokenId)">
              <a :href="nftOpenSeaUrl(nft.tokenId)" target="_blank" rel="noopener">View on OpenSea</a>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { fetchReceiptNFTs } from '../services/ContractService';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const { account, connectWallet, provider } = useWallet();
const nfts = ref<ReceiptNFT[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

interface ReceiptNFT {
  tokenId: string;
  tokenURI: string;
  name: string;
  description: string;
  image: string;
  documentHash: string;
  timestamp: number;
  explorerUrl: string;
}

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

function copyToClipboard(text: string, message: string) {
  void navigator.clipboard.writeText(text);
  $q.notify({ type: 'positive', message, position: 'top' });
}

function onImageError(event: Event, nft: ReceiptNFT) {
  // Optionally log or handle image load errors
  (event.target as HTMLImageElement).src = '';
}

function nftOpenSeaUrl(tokenId: string) {
  // Only show for Polygon mainnet or testnets supported by OpenSea
  // Example for Mumbai: https://testnets.opensea.io/assets/mumbai/<contract>/<tokenId>
  const contract = import.meta.env.VITE_RECEIPT_NFT_ADDRESS;
  if (!contract) return '';
  // You can adjust this for your network
  return `https://testnets.opensea.io/assets/mumbai/${contract}/${tokenId}`;
}

if (account.value) void fetchGallery();

watch([account, route], () => {
  if (account.value) void fetchGallery();
});
</script>
