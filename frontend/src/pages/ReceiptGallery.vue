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

      <!-- Enhanced NFT Cards -->
      <div class="row q-gutter-md">
        <q-card v-for="nft in nfts" :key="nft.tokenId" class="col-12 col-md-6 col-lg-4" flat bordered>
          <q-card-section>
            <!-- NFT Image -->
            <div class="text-center q-mb-md">
              <q-img
                :src="nft.metadata?.image || ''"
                :alt="nft.metadata?.name || 'NFT'"
                style="width: 200px; height: 200px; object-fit: contain;"
                @error="onImageError($event, nft)"
              >
                <template #error>
                  <div class="flex flex-center bg-grey-3 text-grey-7" style="width: 100%; height: 100%;">
                    <q-icon name="image" size="48px" />
                  </div>
                </template>
              </q-img>
            </div>

            <!-- NFT Details -->
            <div class="text-h6 text-center q-mb-sm">{{ nft.metadata?.name || 'Receipt NFT' }}</div>
            <div class="text-caption text-center q-mb-md">{{ nft.metadata?.description || '' }}</div>

            <!-- Token Info -->
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Token ID</q-item-label>
                  <q-item-label class="row items-center">
                    {{ nft.tokenId }}
                    <q-btn flat dense icon="content_copy" size="sm"
                      @click="copyToClipboard(nft.tokenId, 'Token ID copied!')" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Document Hash</q-item-label>
                  <q-item-label class="row items-center">
                    <code class="text-caption">{{ nft.documentHash }}</code>
                    <q-btn flat dense icon="content_copy" size="sm"
                      @click="copyToClipboard(nft.documentHash, 'Document hash copied!')" />
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="nft.metadata?.timestamp">
                <q-item-section>
                  <q-item-label caption>Notarization Date</q-item-label>
                  <q-item-label>{{ formatTimestamp(nft.metadata.timestamp) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- NFT Attributes -->
            <div v-if="nft.metadata?.attributes" class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Attributes</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="attr in nft.metadata.attributes"
                  :key="attr.trait_type"
                  :label="`${attr.trait_type}: ${attr.value}`"
                  size="sm"
                  color="primary"
                  text-color="white"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="q-mt-md">
              <q-btn
                flat
                color="primary"
                label="View on Explorer"
                :href="nft.explorerUrl"
                target="_blank"
                class="q-mr-sm"
              />
              <q-btn
                flat
                color="secondary"
                label="View Metadata"
                :href="nft.tokenURI"
                target="_blank"
                class="q-mr-sm"
              />
              <q-btn
                v-if="nftOpenSeaUrl(nft.tokenId)"
                flat
                color="accent"
                label="OpenSea"
                :href="nftOpenSeaUrl(nft.tokenId)"
                target="_blank"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useEscrow } from '@/composables/useEscrow';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const { account, connectWallet } = useWallet();
const { getNftsByOwner, loading, error } = useEscrow();
const nfts = ref<NFTData[]>([]);
const route = useRoute();
const $q = useQuasar();

interface NFTData {
  tokenId: string;
  tokenURI: string;
  documentHash: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    timestamp?: number;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  } | null;
  explorerUrl: string;
}

function formatTimestamp(ts: number) {
  if (!ts) return '';
  const date = new Date(ts * 1000);
  return date.toLocaleString();
}

async function fetchGallery() {
  if (!account.value) return;

  try {
    const nftData = await getNftsByOwner(account.value);
    nfts.value = nftData.map((nft: any) => ({
      ...nft,
      explorerUrl: `https://www.oklink.com/amoy/token/${import.meta.env.VITE_RECEIPT_NFT_ADDRESS}?a=${nft.tokenId}`
    }));
  } catch (e: any) {
    console.error('Failed to fetch NFTs:', e);
  }
}

function copyToClipboard(text: string, message: string) {
  void navigator.clipboard.writeText(text);
  $q.notify({ type: 'positive', message, position: 'top' });
}

function onImageError(event: Event, nft: NFTData) {
  // Optionally log or handle image load errors
  (event.target as HTMLImageElement).src = '';
}

function nftOpenSeaUrl(tokenId: string) {
  // Only show for Polygon mainnet or testnets supported by OpenSea
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

<style scoped>
code {
  font-family: 'Courier New', monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
