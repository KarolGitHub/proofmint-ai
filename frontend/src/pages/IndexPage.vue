<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="text-center q-mb-xl">
      <div class="text-h3 text-primary q-mb-md">🔐 ProofMintAI</div>
      <div class="text-h6 text-grey-7">AI-Powered Document Notarization & Verification</div>
    </div>

    <!-- Wallet Connection Section -->
    <q-card class="q-mb-lg" v-if="!account">
      <q-card-section class="text-center">
        <div class="text-h6 q-mb-md">Connect Your Wallet</div>
        <div class="text-body2 text-grey-7 q-mb-lg">Connect your MetaMask wallet to start notarizing documents</div>
        <q-btn color="primary" size="lg" label="Connect Wallet" @click="connectWallet" icon="account_balance_wallet" />
      </q-card-section>
    </q-card>

    <div v-else>
      <!-- Connected Wallet Info -->
      <q-card class="q-mb-lg bg-primary text-white">
        <q-card-section class="row items-center">
          <q-icon name="check_circle" size="2rem" class="q-mr-md" />
          <div>
            <div class="text-h6">Wallet Connected</div>
            <div class="text-body2">{{ account }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="logout" @click="disconnectWallet" />
        </q-card-section>
      </q-card>

      <!-- Main Upload Section -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">📄 Document Upload & Processing</div>

          <!-- Drag & Drop File Upload -->
          <q-file v-model="selectedFile" label="Choose document to notarize" outlined accept="*/*" class="q-mb-md"
            @update:model-value="onFileChange" use-chips counter max-files="1">
            <template v-slot:prepend>
              <q-icon name="upload_file" />
            </template>
            <template v-slot:append>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- File Preview -->
          <div v-if="selectedFile" class="q-mb-md">
            <q-card class="bg-grey-1">
              <q-card-section>
                <div class="row items-center">
                  <q-icon name="description" size="2rem" color="primary" class="q-mr-md" />
                  <div>
                    <div class="text-subtitle1"><b>{{ selectedFile.name }}</b></div>
                    <div class="text-caption">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <q-space />
                  <q-btn flat round icon="close" @click="clearSelectedFile" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Hash Display -->
          <div v-if="fileHash" class="q-mb-md">
            <q-card class="bg-blue-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">📋 Document Hash (SHA-256)</div>
                <q-input :model-value="fileHash" readonly outlined class="q-mb-sm" bg-color="white">
                  <template v-slot:append>
                    <q-btn flat round icon="content_copy" @click="copyToClipboard(fileHash)" />
                  </template>
                </q-input>
                <div class="text-caption text-grey-7">This hash will be recorded on the blockchain</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Escrow Creation -->
          <div v-if="fileHash && !escrowLinked" class="q-mb-md">
            <WalletPayButton :document-hash="fileHash" :document-name="lastFileName || 'Document'" :auto-process="true"
              @payment-success="onPaymentSuccess" @payment-error="onPaymentError" @nft-minted="onNftMinted" />
          </div>

          <!-- Escrow Status -->
          <div v-if="escrowLinked && escrowId" class="q-mb-md">
            <q-card class="bg-green-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                  <div class="text-subtitle2">Escrow Created Successfully</div>
                </div>
                <div class="text-body2 q-mb-sm">Escrow ID: <code>{{ escrowId }}</code></div>
                <q-btn color="secondary" label="View Escrow Details" @click="fetchEscrow" :loading="escrowLoading"
                  icon="info" size="sm" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Notarization Button -->
          <div v-if="fileHash && escrowLinked" class="q-mb-md">
            <q-btn color="primary" size="lg" label="🚀 Notarize Document on Blockchain" @click="recordHash"
              :disable="isRecording || ipfsUploading" :loading="isRecording" icon="verified" class="full-width" />
            <div class="text-caption text-grey-7 q-mt-sm text-center">
              This will record the document hash on the Polygon blockchain
            </div>
          </div>

          <!-- Transaction Status -->
          <div v-if="txHash" class="q-mb-md">
            <q-card class="bg-blue-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                  <div class="text-subtitle2">Document Notarized Successfully!</div>
                </div>
                <div class="text-body2 q-mb-sm">
                  Transaction:
                  <a :href="txExplorerUrl" target="_blank" class="text-primary">
                    {{ txHash.substring(0, 10) }}...{{ txHash.substring(txHash.length - 8) }}
                  </a>
                </div>
                <div v-if="escrowReleaseStatus" class="text-positive q-mt-sm">
                  {{ escrowReleaseStatus }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- NFT Receipt Section -->
          <div v-if="mintedTokenId" class="q-mb-md">
            <q-card class="bg-purple-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="auto_awesome" color="purple" class="q-mr-sm" />
                  <div class="text-subtitle2">🎉 NFT Receipt Minted!</div>
                </div>
                <div class="text-body2 q-mb-sm">Token ID: <b>{{ mintedTokenId }}</b></div>
                <q-btn v-if="showViewGallery" color="purple" label="View in Gallery" @click="$router.push('/gallery')"
                  icon="collections" class="q-mt-sm" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="q-mb-md">
            <q-banner class="bg-red-2 text-negative">
              <template v-slot:avatar>
                <q-icon name="error" color="negative" />
              </template>
              {{ error }}
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Image Upload for NFT -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">🖼️ Optional: Upload Image for NFT</div>
          <q-file v-model="selectedImage" label="Choose image for NFT" outlined accept="image/*"
            @update:model-value="onImageChange" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
          </q-file>

          <!-- Image Preview -->
          <div v-if="imagePreviewUrl" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Image Preview:</div>
            <q-img :src="imagePreviewUrl" alt="Image Preview" style="max-width: 200px; max-height: 200px;"
              class="rounded-borders" />
          </div>

          <!-- IPFS Upload Progress -->
          <div v-if="ipfsUploading" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Uploading to IPFS...</div>
            <q-linear-progress :value="ipfsProgress / 100" color="primary" size="20px" rounded class="q-mb-sm">
              <div class="absolute-full flex flex-center text-white">
                {{ ipfsProgress }}%
              </div>
            </q-linear-progress>
          </div>

          <div v-if="ipfsError" class="q-mb-md">
            <q-banner class="bg-red-2 text-negative">
              <template v-slot:avatar>
                <q-icon name="error" color="negative" />
              </template>
              {{ ipfsError }}
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Document Verification Section -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">🔍 Verify Document</div>
          <q-file v-model="verifyFile" label="Choose document to verify" outlined accept="*/*"
            @update:model-value="onVerifyFileChange" class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-file>

          <div v-if="verifyFileHash" class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Document Hash:</div>
            <q-input :model-value="verifyFileHash" readonly outlined class="q-mb-sm" bg-color="grey-1" />
            <q-btn color="secondary" label="Check On-Chain" @click="verifyHash" :disable="isVerifying"
              :loading="isVerifying" icon="verified" />
          </div>

          <div v-if="verifyResult !== null" class="q-mt-md">
            <q-banner :class="verifyResult > 0 ? 'bg-green-2 text-positive' : 'bg-red-2 text-negative'">
              <template v-slot:avatar>
                <q-icon :name="verifyResult > 0 ? 'check_circle' : 'cancel'"
                  :color="verifyResult > 0 ? 'positive' : 'negative'" />
              </template>
              <span v-if="verifyResult > 0">
                ✅ Document was notarized at: {{ formatTimestamp(verifyResult) }}
              </span>
              <span v-else>❌ Document hash not found on-chain</span>
            </q-banner>
          </div>

          <div v-if="verifyError" class="q-mt-md">
            <q-banner class="bg-red-2 text-negative">
              <template v-slot:avatar>
                <q-icon name="error" color="negative" />
              </template>
              {{ verifyError }}
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Recent Documents -->
      <q-card v-if="recentDocs.length" class="q-mb-lg">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="text-h6">📚 Recently Notarized This Session</div>
            <q-space />
            <q-btn flat dense icon="delete" color="negative" @click="clearRecentDocs" label="Clear" />
          </div>
          <q-list bordered separator>
            <q-item v-for="doc in recentDocs" :key="doc.hash" clickable>
              <q-item-section avatar>
                <q-icon name="description" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label><b>{{ doc.name }}</b></q-item-label>
                <q-item-label caption>{{ doc.hash }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="content_copy" @click="copyToClipboard(doc.hash)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Standalone Escrow Demo -->
      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">💳 Escrow Payment Demo</div>
          <q-form @submit.prevent="onCreateEscrowForDoc" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input filled v-model="escrowPayee" label="Payee Address" :error="!!errors.payee"
                  :error-message="errors.payee" placeholder="0x...">
                  <template v-slot:prepend>
                    <q-icon name="account_circle" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input filled v-model="escrowAmount" label="Amount (MATIC)" type="number" :error="!!errors.amount"
                  :error-message="errors.amount" placeholder="0.01" step="0.001" min="0">
                  <template v-slot:prepend>
                    <q-icon name="payments" />
                  </template>
                </q-input>
              </div>
            </div>
            <q-btn color="primary" label="Create Escrow" type="submit" :loading="escrowLoading || isSubmitting"
              :disable="isSubmitting" icon="account_balance_wallet" />
          </q-form>

          <div v-if="escrowError" class="text-negative q-mt-sm">{{ escrowError }}</div>

          <div v-if="escrowId !== null" class="q-mt-md">
            <q-card class="bg-blue-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Escrow Created! ID: <b>{{ escrowId }}</b></div>
                <q-btn color="secondary" label="Get Escrow Details" @click="fetchEscrow" :loading="escrowLoading"
                  icon="info" size="sm" class="q-mr-sm" />
              </q-card-section>
            </q-card>

            <div v-if="escrowDetails" class="q-mt-md">
              <q-card class="bg-grey-1">
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">Escrow Details:</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Payer</q-item-label>
                        <q-item-label>{{ escrowDetails.payer }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Payee</q-item-label>
                        <q-item-label>{{ escrowDetails.payee }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Amount</q-item-label>
                        <q-item-label>{{ escrowDetails.amount }} wei</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Status</q-item-label>
                        <q-item-label>
                          <q-chip
                            :color="escrowDetails.isReleased ? 'positive' : escrowDetails.isRefunded ? 'negative' : 'warning'"
                            text-color="white"
                            :label="escrowDetails.isReleased ? 'Released' : escrowDetails.isRefunded ? 'Refunded' : 'Pending'" />
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <div class="q-mt-md">
                    <q-btn color="positive" label="Release Escrow" @click="releaseEscrow"
                      :disable="escrowDetails.isReleased || escrowDetails.isRefunded" icon="check_circle"
                      class="q-mr-sm" />
                    <q-btn color="negative" label="Refund Escrow" @click="refundEscrow"
                      :disable="escrowDetails.isReleased || escrowDetails.isRefunded" icon="cancel" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useEscrow } from '../composables/useEscrow';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useIpfsUpload } from '../composables/useIpfsUpload';
import { useQuasar } from 'quasar';
import WalletPayButton from '../components/WalletPayButton.vue'; // Added import for WalletPayButton

const { account, notaryContract, connectWallet, disconnectWallet } = useWallet();

const selectedFile = ref<File | null>(null);
const fileHash = ref<string | null>(null);
const txHash = ref<string | null>(null);
const error = ref<string | null>(null);
const isRecording = ref(false);

const RECENT_DOCS_KEY = 'recentNotarizedDocs';
const recentDocs = ref<{ name: string; hash: string }[]>([]);

const verifyFile = ref<File | null>(null);
const verifyFileHash = ref<string | null>(null);
const verifyResult = ref<number | null>(null);
const verifyError = ref<string | null>(null);
const isVerifying = ref(false);

const selectedImage = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);

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

const { loading: escrowLoading, error: escrowError, createEscrow, getEscrow, releaseEscrow: releaseEscrowApi, refundEscrow: refundEscrowApi, mintReceipt, mintReceiptEnhanced } = useEscrow();

const escrowReleaseStatus = ref<string | null>(null);
const mintedTokenId = ref<string | null>(null);
const { uploading: ipfsUploading, error: ipfsError, progress: ipfsProgress, uploadMetadataToIpfs, uploadImageToIpfs } = useIpfsUpload();
const showViewGallery = ref(false);
const $q = useQuasar();

onMounted(() => {
  const saved = localStorage.getItem(RECENT_DOCS_KEY);
  if (saved) {
    try {
      recentDocs.value = JSON.parse(saved);
    } catch (e) {
      // Ignore parsing errors
    }
  }
});

watch(recentDocs, (val) => {
  localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(val));
}, { deep: true });

function clearRecentDocs() {
  recentDocs.value = [];
  localStorage.removeItem(RECENT_DOCS_KEY);
}

function onFileChange(file: File | null) {
  if (file) {
    lastFileName = file.name;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      fileHash.value = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    reader.readAsArrayBuffer(file);
  } else {
    fileHash.value = null;
    lastFileName = null;
  }
}

function clearSelectedFile() {
  selectedFile.value = null;
  fileHash.value = null;
  lastFileName = null;
}

function onVerifyFileChange(file: File | null) {
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      verifyFileHash.value = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };
    reader.readAsArrayBuffer(file);
  } else {
    verifyFileHash.value = null;
  }
}

function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedImage.value = input.files[0];
    imagePreviewUrl.value = URL.createObjectURL(input.files[0]);
  } else {
    selectedImage.value = null;
    imagePreviewUrl.value = null;
  }
}

async function recordHash() {
  error.value = null;
  txHash.value = null;
  escrowReleaseStatus.value = null;
  mintedTokenId.value = null;
  showViewGallery.value = false;
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
    // Mint NFT receipt after notarization
    if (account.value && fileHash.value) {
      let imageUrl = '';
      if (selectedImage.value) {
        imageUrl = await uploadImageToIpfs(selectedImage.value) || '';
        if (!imageUrl) {
          error.value = ipfsError.value || 'Failed to upload image to IPFS';
          $q.notify({ type: 'negative', message: error.value, position: 'top' });
          return;
        }
      }

      // Use enhanced NFT minting
      const result = await mintReceiptEnhanced({
        to: account.value,
        documentHash: fileHash.value,
        documentName: lastFileName || 'Document',
        imageUrl,
        description: 'NFT receipt for document notarization on ProofMintAI'
      });

      if (result && result.success) {
        mintedTokenId.value = result.tokenId;
        showViewGallery.value = true;
        $q.notify({
          type: 'positive',
          message: `NFT Minted Successfully! Token ID: ${result.tokenId}`,
          position: 'top'
        });
        // Reset image and progress
        selectedImage.value = null;
        imagePreviewUrl.value = null;
        ipfsProgress.value = 0;
      } else {
        error.value = escrowError.value || 'Failed to mint NFT';
        $q.notify({ type: 'negative', message: error.value, position: 'top' });
      }
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Transaction failed';
    $q.notify({ type: 'negative', message: error.value, position: 'top' });
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

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Hash copied to clipboard!',
      position: 'top'
    });
  }).catch(() => {
    $q.notify({
      type: 'negative',
      message: 'Failed to copy hash to clipboard.',
      position: 'top'
    });
  });
}

// New functions for WalletPayButton integration
async function onPaymentSuccess(paymentId: string, amount: string, payee: string) {
  escrowId.value = paymentId;
  escrowLinked.value = true;
  $q.notify({
    type: 'positive',
    message: `Payment successful! Payment ID: ${paymentId}`,
    position: 'top'
  });
  await fetchEscrow();
}

function onPaymentError(error: string) {
  $q.notify({
    type: 'negative',
    message: `Payment failed: ${error}`,
    position: 'top'
  });
}

function onNftMinted(nftData: any) {
  if (nftData && nftData.tokenId) {
    mintedTokenId.value = nftData.tokenId;
    showViewGallery.value = true;
    $q.notify({
      type: 'positive',
      message: `NFT Minted Successfully! Token ID: ${nftData.tokenId}`,
      position: 'top'
    });
  }
}
</script>
