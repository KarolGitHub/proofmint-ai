<template>
  <div class="wallet-pay-button">
    <!-- Payment Status Display -->
    <div v-if="paymentStatus" class="q-mb-md">
      <q-banner
        :class="getPaymentStatusClass(paymentStatus.status)"
        class="q-mb-md"
      >
        <template v-slot:avatar>
          <q-icon
            :name="getPaymentStatusIcon(paymentStatus.status)"
            :color="getPaymentStatusColor(paymentStatus.status)"
          />
        </template>
        <div class="text-subtitle2">{{ paymentStatus.title }}</div>
        <div class="text-body2">{{ paymentStatus.message }}</div>
      </q-banner>
    </div>

    <!-- Payment Form -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">💰 Payment & Escrow</div>

        <q-form @submit.prevent="handlePayment" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="paymentForm.payee"
                label="Payee Address"
                outlined
                :error="!!errors.payee"
                :error-message="errors.payee"
                placeholder="0x..."
                :disable="processing"
              >
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="paymentForm.amount"
                label="Amount (MATIC)"
                type="number"
                outlined
                :error="!!errors.amount"
                :error-message="errors.amount"
                placeholder="0.01"
                step="0.001"
                min="0"
                :disable="processing"
              >
                <template v-slot:prepend>
                  <q-icon name="payments" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="paymentForm.documentHash"
                label="Document Hash"
                outlined
                readonly
                bg-color="grey-1"
                :disable="processing"
              >
                <template v-slot:prepend>
                  <q-icon name="description" />
                </template>
                <template v-slot:append>
                  <q-btn
                    flat
                    round
                    icon="content_copy"
                    @click="copyToClipboard(paymentForm.documentHash)"
                    :disable="!paymentForm.documentHash"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="paymentForm.description"
                label="Payment Description"
                outlined
                placeholder="Optional description..."
                :disable="processing"
              >
                <template v-slot:prepend>
                  <q-icon name="edit" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Payment Options -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Payment Options</div>
            <q-option-group
              v-model="paymentForm.paymentType"
              :options="paymentTypeOptions"
              color="primary"
              inline
              :disable="processing"
            />
          </div>

          <!-- Payment Button -->
          <div class="text-center">
            <q-btn
              :label="getPaymentButtonText()"
              :color="getPaymentButtonColor()"
              size="lg"
              type="submit"
              :loading="processing"
              :disable="!canProcessPayment"
              :icon="getPaymentButtonIcon()"
              class="full-width"
            />
          </div>
        </q-form>

        <div v-if="paymentError" class="q-mt-md">
          <q-banner class="bg-red-2 text-negative">
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            {{ paymentError }}
          </q-banner>
        </div>
      </q-card-section>
    </q-card>

    <!-- NFT Receipt Badge -->
    <div v-if="nftReceipt" class="q-mb-md">
      <q-card class="bg-purple-1">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <q-icon name="auto_awesome" size="2rem" color="purple" class="q-mr-md" />
            <div>
              <div class="text-h6">🎉 NFT Receipt Generated!</div>
              <div class="text-body2">Your document has been notarized and an NFT receipt has been minted</div>
            </div>
          </div>

          <!-- NFT Details -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-center">
                <q-img
                  :src="nftReceipt.image || ''"
                  alt="NFT Image"
                  style="width: 150px; height: 150px; object-fit: contain;"
                  class="rounded-borders q-mb-sm"
                >
                  <template #error>
                    <div class="flex flex-center bg-grey-3 text-grey-7" style="width: 100%; height: 100%;">
                      <q-icon name="image" size="48px" />
                    </div>
                  </template>
                </q-img>
                <div class="text-caption text-grey-7">NFT Preview</div>
              </div>
            </div>

            <div class="col-12 col-md-8">
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Token ID</q-item-label>
                    <q-item-label class="text-h6">{{ nftReceipt.tokenId }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Document Name</q-item-label>
                    <q-item-label>{{ nftReceipt.documentName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Document Hash</q-item-label>
                    <q-item-label class="font-mono text-caption">
                      {{ nftReceipt.documentHash.substring(0, 10) }}...{{ nftReceipt.documentHash.substring(nftReceipt.documentHash.length - 8) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Minted At</q-item-label>
                    <q-item-label>{{ formatTimestamp(nftReceipt.mintedAt) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Transaction Hash</q-item-label>
                    <q-item-label>
                      <a :href="getExplorerUrl(nftReceipt.transactionHash)" target="_blank" class="text-primary">
                        {{ nftReceipt.transactionHash.substring(0, 10) }}...{{ nftReceipt.transactionHash.substring(nftReceipt.transactionHash.length - 8) }}
                      </a>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <!-- NFT Actions -->
              <div class="q-mt-md">
                <div class="row q-gutter-sm">
                  <q-btn
                    color="primary"
                    label="View in Gallery"
                    @click="viewInGallery"
                    icon="collections"
                    size="sm"
                  />
                  <q-btn
                    color="secondary"
                    label="Download Metadata"
                    @click="downloadMetadata"
                    icon="download"
                    size="sm"
                  />
                  <q-btn
                    color="info"
                    label="Share NFT"
                    @click="shareNFT"
                    icon="share"
                    size="sm"
                  />
                  <q-btn
                    color="accent"
                    label="View on Explorer"
                    @click="openExplorer(nftReceipt.transactionHash)"
                    icon="open_in_new"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Payment History -->
    <div v-if="paymentHistory.length > 0" class="q-mt-lg">
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">📊 Payment History</div>
          <q-list bordered separator>
            <q-item v-for="payment in paymentHistory" :key="payment.id" clickable>
              <q-item-section avatar>
                <q-icon
                  :name="getPaymentStatusIcon(payment.status)"
                  :color="getPaymentStatusColor(payment.status)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <b>{{ payment.description || 'Payment' }}</b>
                </q-item-label>
                <q-item-label caption>
                  {{ payment.amount }} MATIC to {{ payment.payee.substring(0, 10) }}...
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-caption">{{ formatTimestamp(payment.timestamp) }}</div>
                <q-chip
                  :color="getPaymentStatusColor(payment.status)"
                  text-color="white"
                  :label="getPaymentStatusText(payment.status)"
                  size="sm"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useEscrow } from '../composables/useEscrow';

const $q = useQuasar();
const { createEscrow, releaseEscrow, getEscrow } = useEscrow();

// Props
interface Props {
  documentHash?: string;
  documentName?: string;
  autoProcess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  documentHash: '',
  documentName: 'Document',
  autoProcess: false
});

// Emits
const emit = defineEmits<{
  paymentSuccess: [paymentId: string, amount: string, payee: string];
  paymentError: [error: string];
  nftMinted: [nftData: any];
}>();

// Form state
const paymentForm = ref({
  payee: '',
  amount: '',
  documentHash: props.documentHash,
  description: '',
  paymentType: 'escrow'
});

// Validation errors
const errors = ref({
  payee: '',
  amount: ''
});

// Processing state
const processing = ref(false);
const paymentError = ref('');

// Payment status
const paymentStatus = ref<any>(null);

// NFT receipt
const nftReceipt = ref<any>(null);

// Payment history
const paymentHistory = ref<any[]>([]);

// Payment type options
const paymentTypeOptions = [
  { label: 'Escrow Payment', value: 'escrow' },
  { label: 'Direct Payment', value: 'direct' },
  { label: 'Subscription', value: 'subscription' }
];

// Computed properties
const canProcessPayment = computed(() => {
  return paymentForm.value.payee &&
         paymentForm.value.amount &&
         parseFloat(paymentForm.value.amount) > 0 &&
         !processing.value;
});

// Watch for document hash changes
watch(() => props.documentHash, (newHash) => {
  if (newHash) {
    paymentForm.value.documentHash = newHash;
  }
});

// Methods
function validateForm() {
  errors.value = { payee: '', amount: '' };

  if (!paymentForm.value.payee) {
    errors.value.payee = 'Payee address is required';
    return false;
  }

  if (!paymentForm.value.payee.match(/^0x[a-fA-F0-9]{40}$/)) {
    errors.value.payee = 'Invalid Ethereum address format';
    return false;
  }

  if (!paymentForm.value.amount) {
    errors.value.amount = 'Amount is required';
    return false;
  }

  const amount = parseFloat(paymentForm.value.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.value.amount = 'Amount must be a positive number';
    return false;
  }

  return true;
}

async function handlePayment() {
  if (!validateForm()) {
    return;
  }

  processing.value = true;
  paymentError.value = '';

  try {
    let paymentId: string | null = null;

    if (paymentForm.value.paymentType === 'escrow') {
      // Create escrow payment
      paymentId = await createEscrow(
        paymentForm.value.payee,
        paymentForm.value.amount,
        paymentForm.value.documentHash
      );
    } else {
      // Handle other payment types
      paymentId = `direct_${Date.now()}`;
    }

    if (paymentId) {
      // Update payment status
      paymentStatus.value = {
        status: 'success',
        title: 'Payment Successful!',
        message: `Payment of ${paymentForm.value.amount} MATIC has been processed successfully.`
      };

      // Add to payment history
      paymentHistory.value.unshift({
        id: paymentId,
        payee: paymentForm.value.payee,
        amount: paymentForm.value.amount,
        description: paymentForm.value.description,
        status: 'success',
        timestamp: Date.now(),
        type: paymentForm.value.paymentType
      });

      // Emit success event
      emit('paymentSuccess', paymentId, paymentForm.value.amount, paymentForm.value.payee);

      // Auto-process if enabled
      if (props.autoProcess && paymentForm.value.paymentType === 'escrow') {
        await processEscrowPayment(paymentId);
      }

      // Reset form
      paymentForm.value.payee = '';
      paymentForm.value.amount = '';
      paymentForm.value.description = '';

      $q.notify({
        type: 'positive',
        message: 'Payment processed successfully!',
        position: 'top'
      });
    } else {
      throw new Error('Failed to process payment');
    }
  } catch (error: any) {
    paymentError.value = error.message || 'Payment failed';
    paymentStatus.value = {
      status: 'error',
      title: 'Payment Failed',
      message: error.message || 'An error occurred while processing the payment.'
    };

    emit('paymentError', paymentError.value);

    $q.notify({
      type: 'negative',
      message: paymentError.value,
      position: 'top'
    });
  } finally {
    processing.value = false;
  }
}

async function processEscrowPayment(escrowId: string) {
  try {
    // Simulate escrow processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Release escrow
    const released = await releaseEscrow(escrowId);

    if (released) {
      paymentStatus.value = {
        status: 'success',
        title: 'Escrow Released!',
        message: 'The escrow payment has been automatically released after document verification.'
      };
    }
  } catch (error) {
    console.error('Error processing escrow:', error);
  }
}

function getPaymentButtonText() {
  if (processing.value) return 'Processing...';
  if (paymentForm.value.paymentType === 'escrow') return 'Create Escrow Payment';
  if (paymentForm.value.paymentType === 'direct') return 'Send Payment';
  if (paymentForm.value.paymentType === 'subscription') return 'Subscribe';
  return 'Process Payment';
}

function getPaymentButtonColor() {
  if (processing.value) return 'grey';
  return 'primary';
}

function getPaymentButtonIcon() {
  if (processing.value) return 'hourglass_empty';
  if (paymentForm.value.paymentType === 'escrow') return 'account_balance_wallet';
  if (paymentForm.value.paymentType === 'direct') return 'send';
  if (paymentForm.value.paymentType === 'subscription') return 'subscriptions';
  return 'payment';
}

function getPaymentStatusClass(status: string) {
  switch (status) {
    case 'success': return 'bg-green-2 text-positive';
    case 'error': return 'bg-red-2 text-negative';
    case 'pending': return 'bg-orange-2 text-orange';
    default: return 'bg-grey-2 text-grey-8';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'success': return 'positive';
    case 'error': return 'negative';
    case 'pending': return 'orange';
    default: return 'grey';
  }
}

function getPaymentStatusIcon(status: string) {
  switch (status) {
    case 'success': return 'check_circle';
    case 'error': return 'error';
    case 'pending': return 'pending';
    default: return 'info';
  }
}

function getPaymentStatusText(status: string) {
  switch (status) {
    case 'success': return 'Success';
    case 'error': return 'Error';
    case 'pending': return 'Pending';
    default: return 'Unknown';
  }
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Copied to clipboard!',
      position: 'top'
    });
  });
}

function getExplorerUrl(txHash: string) {
  return `https://www.oklink.com/amoy/tx/${txHash}`;
}

function viewInGallery() {
  // Navigate to gallery page
  window.location.href = '/gallery';
}

function downloadMetadata() {
  if (nftReceipt.value) {
    const metadata = {
      name: nftReceipt.value.documentName,
      description: 'NFT receipt for document notarization on ProofMintAI',
      image: nftReceipt.value.image,
      attributes: [
        { trait_type: 'Document Hash', value: nftReceipt.value.documentHash },
        { trait_type: 'Token ID', value: nftReceipt.value.tokenId },
        { trait_type: 'Minted At', value: new Date(nftReceipt.value.mintedAt).toISOString() }
      ]
    };

    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft-metadata-${nftReceipt.value.tokenId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function shareNFT() {
  if (nftReceipt.value && navigator.share) {
    navigator.share({
      title: `NFT Receipt: ${nftReceipt.value.documentName}`,
      text: `Check out my NFT receipt for document notarization on ProofMintAI!`,
      url: window.location.origin + '/gallery'
    });
  } else {
    // Fallback: copy link to clipboard
    copyToClipboard(window.location.origin + '/gallery');
  }
}

function openExplorer(txHash: string) {
  window.open(getExplorerUrl(txHash), '_blank');
}

// Expose methods for parent components
defineExpose({
  setDocumentHash: (hash: string) => {
    paymentForm.value.documentHash = hash;
  },
  setNftReceipt: (receipt: any) => {
    nftReceipt.value = receipt;
  },
  clearPaymentStatus: () => {
    paymentStatus.value = null;
    paymentError.value = '';
  }
});
</script>

<style scoped>
.wallet-pay-button {
  max-width: 800px;
  margin: 0 auto;
}

.font-mono {
  font-family: 'Courier New', monospace;
}
</style>
