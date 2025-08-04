<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- ZK Proof Creation -->
      <div class="col-12 col-md-6">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Create ZK Proof</div>
            <div class="text-caption q-mb-md">
              Create an anonymous proof for document ownership without revealing the actual document hash.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleCreateProof" class="q-gutter-md">
              <q-input
                v-model="createForm.documentHash"
                label="Document Hash"
                placeholder="Enter document hash to prove"
                :rules="[val => !!val || 'Document hash is required']"
                outlined
                dense
              />

              <q-input
                v-model="createForm.privateKey"
                label="Private Key"
                placeholder="Enter your private key"
                type="password"
                :rules="[val => !!val || 'Private key is required']"
                outlined
                dense
              />

              <q-btn
                type="submit"
                color="primary"
                label="Create ZK Proof"
                :loading="loading"
                :disable="!createForm.documentHash || !createForm.privateKey"
              />
            </q-form>
          </q-card-section>

          <q-card-section v-if="createResult">
            <q-banner :class="createResult.success ? 'bg-positive' : 'bg-negative'" class="text-white">
              <template #avatar>
                <q-icon :name="createResult.success ? 'check_circle' : 'error'" />
              </template>
              <div v-if="createResult.success">
                <div class="text-weight-bold">ZK Proof Created Successfully!</div>
                <div class="text-caption">
                  Proof ID: {{ createResult.proofId }}<br>
                  Commitment: {{ createResult.commitment }}<br>
                  Transaction: {{ createResult.transactionHash }}
                </div>
              </div>
              <div v-else>
                <div class="text-weight-bold">Failed to Create ZK Proof</div>
                <div class="text-caption">{{ createResult.error }}</div>
              </div>
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- ZK Proof Verification -->
      <div class="col-12 col-md-6">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Verify ZK Proof</div>
            <div class="text-caption q-mb-md">
              Verify an existing ZK proof without revealing the original document.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleVerifyProof" class="q-gutter-md">
              <q-input
                v-model="verifyForm.proofId"
                label="Proof ID"
                placeholder="Enter proof ID to verify"
                :rules="[val => !!val || 'Proof ID is required']"
                outlined
                dense
              />

              <q-input
                v-model="verifyForm.proofData"
                label="Proof Data (Optional)"
                placeholder="Enter additional proof data"
                outlined
                dense
              />

              <q-input
                v-model="verifyForm.privateKey"
                label="Private Key"
                placeholder="Enter your private key"
                type="password"
                :rules="[val => !!val || 'Private key is required']"
                outlined
                dense
              />

              <q-btn
                type="submit"
                color="secondary"
                label="Verify ZK Proof"
                :loading="loading"
                :disable="!verifyForm.proofId || !verifyForm.privateKey"
              />
            </q-form>
          </q-card-section>

          <q-card-section v-if="verifyResult">
            <q-banner :class="verifyResult.success ? 'bg-positive' : 'bg-negative'" class="text-white">
              <template #avatar>
                <q-icon :name="verifyResult.success ? 'check_circle' : 'error'" />
              </template>
              <div v-if="verifyResult.success">
                <div class="text-weight-bold">ZK Proof Verification Result</div>
                <div class="text-caption">
                  Valid: {{ verifyResult.isValid ? 'Yes' : 'No' }}<br>
                  Owner: {{ verifyResult.owner }}<br>
                  Commitment: {{ verifyResult.commitment }}
                </div>
              </div>
              <div v-else>
                <div class="text-weight-bold">Failed to Verify ZK Proof</div>
                <div class="text-caption">{{ verifyResult.error }}</div>
              </div>
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- User's ZK Proofs -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">My ZK Proofs</div>
            <div class="text-caption q-mb-md">
              View and manage your ZK proofs.
            </div>
          </q-card-section>

          <q-card-section>
            <q-btn
              color="primary"
              label="Load My Proofs"
              @click="loadUserProofs"
              :loading="loading"
              :disable="!account"
            />
          </q-card-section>

          <q-card-section v-if="userProofs.length > 0">
            <div class="row q-gutter-md">
              <q-card
                v-for="proof in userProofs"
                :key="proof.proofId"
                class="col-12 col-md-6 col-lg-4"
                flat
                bordered
              >
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="text-h6">Proof #{{ proof.proofId }}</div>
                    <q-chip
                      :color="getProofStatusColor(proof)"
                      text-color="white"
                      :label="getProofStatusText(proof)"
                      size="sm"
                      class="q-ml-auto"
                    />
                  </div>

                  <div class="text-caption q-mb-sm">
                    <div><strong>Owner:</strong> {{ proof.owner }}</div>
                    <div><strong>Commitment:</strong> {{ proof.commitment }}</div>
                    <div><strong>Nullifier:</strong> {{ proof.nullifier }}</div>
                    <div><strong>Created:</strong> {{ formatTimestamp(proof.timestamp) }}</div>
                  </div>

                  <div class="row q-gutter-sm">
                    <q-btn
                      flat
                      color="negative"
                      label="Revoke"
                      size="sm"
                      @click="handleRevokeProof(proof.proofId)"
                      :disable="proof.isRevoked"
                    />
                    <q-btn
                      flat
                      color="info"
                      label="Details"
                      size="sm"
                      @click="showProofDetails(proof)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>

          <q-card-section v-else-if="!loading">
            <q-banner class="bg-grey-2 text-center">
              <div>No ZK proofs found for this address.</div>
              <q-btn color="primary" label="Create a ZK Proof" @click="scrollToCreate" class="q-mt-sm" />
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- Verification Requests -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">Verification Requests</div>
            <div class="text-caption q-mb-md">
              Create and manage verification requests for ZK proofs.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleCreateVerificationRequest" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="requestForm.proofId"
                    label="Proof ID"
                    placeholder="Enter proof ID to verify"
                    :rules="[val => !!val || 'Proof ID is required']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="requestForm.reason"
                    label="Reason"
                    placeholder="Reason for verification request"
                    :rules="[val => !!val || 'Reason is required']"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="requestForm.privateKey"
                    label="Private Key"
                    placeholder="Enter your private key"
                    type="password"
                    :rules="[val => !!val || 'Private key is required']"
                    outlined
                    dense
                  />
                </div>
              </div>

              <q-btn
                type="submit"
                color="accent"
                label="Create Verification Request"
                :loading="loading"
                :disable="!requestForm.proofId || !requestForm.reason || !requestForm.privateKey"
              />
            </q-form>
          </q-card-section>

          <q-card-section v-if="requestResult">
            <q-banner :class="requestResult.success ? 'bg-positive' : 'bg-negative'" class="text-white">
              <template #avatar>
                <q-icon :name="requestResult.success ? 'check_circle' : 'error'" />
              </template>
              <div v-if="requestResult.success">
                <div class="text-weight-bold">Verification Request Created!</div>
                <div class="text-caption">
                  Request ID: {{ requestResult.requestId }}<br>
                  Proof ID: {{ requestResult.proofId }}<br>
                  Transaction: {{ requestResult.transactionHash }}
                </div>
              </div>
              <div v-else>
                <div class="text-weight-bold">Failed to Create Verification Request</div>
                <div class="text-caption">{{ requestResult.error }}</div>
              </div>
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- Statistics -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">ZK Proof Statistics</div>
          </q-card-section>

          <q-card-section>
            <q-btn
              color="primary"
              label="Load Statistics"
              @click="loadStatistics"
              :loading="loading"
            />
          </q-card-section>

          <q-card-section v-if="statistics">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-primary">{{ statistics.totalProofs }}</div>
                    <div class="text-caption">Total ZK Proofs</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-secondary">{{ userProofs.length }}</div>
                    <div class="text-caption">My ZK Proofs</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat bordered>
                  <q-card-section class="text-center">
                    <div class="text-h4 text-accent">{{ validProofsCount }}</div>
                    <div class="text-caption">Valid Proofs</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Proof Details Dialog -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Proof Details</div>
        </q-card-section>

        <q-card-section v-if="selectedProof">
          <div class="q-gutter-y-sm">
            <div><strong>Proof ID:</strong> {{ selectedProof.proofId }}</div>
            <div><strong>Owner:</strong> {{ selectedProof.owner }}</div>
            <div><strong>Commitment:</strong> {{ selectedProof.commitment }}</div>
            <div><strong>Nullifier:</strong> {{ selectedProof.nullifier }}</div>
            <div><strong>Created:</strong> {{ formatTimestamp(selectedProof.timestamp) }}</div>
            <div><strong>Status:</strong> {{ getProofStatusText(selectedProof) }}</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useZKProof, type ZKProof } from '@/composables/useZKProof';
import { useQuasar } from 'quasar';

const { account, connectWallet } = useWallet();
const {
  loading,
  error,
  createZKProof,
  verifyZKProof,
  revokeZKProof,
  createVerificationRequest,
  getUserProofs,
  getTotalProofs,
  formatTimestamp,
  getProofStatusColor,
  getProofStatusText
} = useZKProof();

const $q = useQuasar();

// Form data
const createForm = ref({
  documentHash: '',
  privateKey: ''
});

const verifyForm = ref({
  proofId: '',
  proofData: '',
  privateKey: ''
});

const requestForm = ref({
  proofId: '',
  reason: '',
  privateKey: ''
});

// Results
const createResult = ref<any>(null);
const verifyResult = ref<any>(null);
const requestResult = ref<any>(null);
const userProofs = ref<ZKProof[]>([]);
const statistics = ref<any>(null);

// Dialog
const showDetailsDialog = ref(false);
const selectedProof = ref<ZKProof | null>(null);

// Computed
const validProofsCount = computed(() => {
  return userProofs.value.filter(proof => proof.isValid && !proof.isRevoked).length;
});

// Methods
async function handleCreateProof() {
  if (!createForm.value.documentHash || !createForm.value.privateKey) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields', position: 'top' });
    return;
  }

  createResult.value = await createZKProof(
    createForm.value.documentHash,
    createForm.value.privateKey
  );

  if (createResult.value.success) {
    $q.notify({ type: 'positive', message: 'ZK Proof created successfully!', position: 'top' });
    createForm.value = { documentHash: '', privateKey: '' };
    await loadUserProofs();
  } else {
    $q.notify({ type: 'negative', message: createResult.value.error, position: 'top' });
  }
}

async function handleVerifyProof() {
  if (!verifyForm.value.proofId || !verifyForm.value.privateKey) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields', position: 'top' });
    return;
  }

  verifyResult.value = await verifyZKProof(
    verifyForm.value.proofId,
    verifyForm.value.proofData,
    verifyForm.value.privateKey
  );

  if (verifyResult.value.success) {
    $q.notify({ type: 'positive', message: 'ZK Proof verified successfully!', position: 'top' });
    verifyForm.value = { proofId: '', proofData: '', privateKey: '' };
  } else {
    $q.notify({ type: 'negative', message: verifyResult.value.error, position: 'top' });
  }
}

async function handleRevokeProof(proofId: string) {
  if (!createForm.value.privateKey) {
    $q.notify({ type: 'negative', message: 'Please enter your private key first', position: 'top' });
    return;
  }

  const result = await revokeZKProof(proofId, createForm.value.privateKey);

  if (result.success) {
    $q.notify({ type: 'positive', message: 'ZK Proof revoked successfully!', position: 'top' });
    await loadUserProofs();
  } else {
    $q.notify({ type: 'negative', message: result.error, position: 'top' });
  }
}

async function handleCreateVerificationRequest() {
  if (!requestForm.value.proofId || !requestForm.value.reason || !requestForm.value.privateKey) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields', position: 'top' });
    return;
  }

  requestResult.value = await createVerificationRequest(
    requestForm.value.proofId,
    requestForm.value.reason,
    requestForm.value.privateKey
  );

  if (requestResult.value.success) {
    $q.notify({ type: 'positive', message: 'Verification request created successfully!', position: 'top' });
    requestForm.value = { proofId: '', reason: '', privateKey: '' };
  } else {
    $q.notify({ type: 'negative', message: requestResult.value.error, position: 'top' });
  }
}

async function loadUserProofs() {
  if (!account.value) {
    $q.notify({ type: 'warning', message: 'Please connect your wallet first', position: 'top' });
    return;
  }

  const result = await getUserProofs(account.value);
  if (result.success) {
    userProofs.value = result.proofs || [];
  } else {
    $q.notify({ type: 'negative', message: result.error, position: 'top' });
  }
}

async function loadStatistics() {
  const result = await getTotalProofs();
  if (result.success) {
    statistics.value = {
      totalProofs: result.count
    };
  } else {
    $q.notify({ type: 'negative', message: result.error, position: 'top' });
  }
}

function showProofDetails(proof: ZKProof) {
  selectedProof.value = proof;
  showDetailsDialog.value = true;
}

function scrollToCreate() {
  // Scroll to create section
  const createSection = document.querySelector('.text-h6');
  if (createSection) {
    createSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Load data on mount
onMounted(async () => {
  if (account.value) {
    await loadUserProofs();
    await loadStatistics();
  }
});
</script>

<style scoped>
.q-card {
  transition: all 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
