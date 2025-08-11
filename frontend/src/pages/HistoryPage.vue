<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="text-center q-mb-xl">
      <div class="text-h4 text-primary q-mb-md">🔍 Notary Proof Explorer Dashboard</div>
      <div class="text-h6 text-grey-7">Explore and verify all notarized documents on the blockchain</div>
    </div>

    <!-- Search and Filter Section -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">🔎 Search & Filter</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="searchQuery"
              label="Search by document name or hash"
              outlined
              clearable
              placeholder="Enter document name or hash..."
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status Filter"
              outlined
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="dateFilter"
              :options="dateOptions"
              label="Date Filter"
              outlined
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="calendar_today" />
              </template>
            </q-select>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="addressFilter"
              label="Filter by wallet address"
              outlined
              clearable
              placeholder="0x..."
            >
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-btn
                  color="primary"
                  label="Search"
                  @click="performSearch"
                  icon="search"
                  class="full-width"
                />
              </div>
              <div class="col">
                <q-btn
                  color="secondary"
                  label="Clear Filters"
                  @click="clearFilters"
                  icon="clear"
                  class="full-width"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-primary text-white">
          <q-card-section class="text-center">
            <div class="text-h4 q-mb-sm">{{ totalDocuments }}</div>
            <div class="text-subtitle2">Total Documents</div>
            <q-icon name="description" size="3rem" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section class="text-center">
            <div class="text-h4 q-mb-sm">{{ verifiedDocuments }}</div>
            <div class="text-subtitle2">Verified</div>
            <q-icon name="verified" size="3rem" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-warning text-white">
          <q-card-section class="text-center">
            <div class="text-h4 q-mb-sm">{{ pendingDocuments }}</div>
            <div class="text-subtitle2">Pending</div>
            <q-icon name="pending" size="3rem" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section class="text-center">
            <div class="text-h4 q-mb-sm">{{ totalUsers }}</div>
            <div class="text-subtitle2">Unique Users</div>
            <q-icon name="people" size="3rem" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Documents Table -->
    <q-card>
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6">📋 Notarized Documents</div>
          <q-space />
          <q-btn
            color="primary"
            label="Refresh"
            @click="loadDocuments"
            :loading="loading"
            icon="refresh"
          />
        </div>

        <q-table
          :rows="filteredDocuments"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="hash"
          :filter="searchQuery"
          @request="onRequest"
        >
          <!-- Custom cell for status -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                text-color="white"
                :label="getStatusText(props.value)"
                size="sm"
              />
            </q-td>
          </template>

          <!-- Custom cell for actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="visibility"
                  color="primary"
                  @click="viewDocument(props.row)"
                  title="View Details"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="verified"
                  color="positive"
                  @click="verifyDocument(props.row)"
                  title="Verify on Chain"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="content_copy"
                  color="secondary"
                  @click="copyHash(props.row.hash)"
                  title="Copy Hash"
                />
                <q-btn
                  flat
                  round
                  size="sm"
                  icon="open_in_new"
                  color="info"
                  @click="openExplorer(props.row.txHash)"
                  title="View on Explorer"
                />
              </div>
            </q-td>
          </template>

          <!-- Custom cell for hash -->
          <template v-slot:body-cell-hash="props">
            <q-td :props="props">
              <div class="text-caption font-mono">
                {{ props.value.substring(0, 10) }}...{{ props.value.substring(props.value.length - 8) }}
              </div>
            </q-td>
          </template>

          <!-- Custom cell for timestamp -->
          <template v-slot:body-cell-timestamp="props">
            <q-td :props="props">
              <div class="text-caption">
                {{ formatTimestamp(props.value) }}
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Document Details Dialog -->
    <q-dialog v-model="showDocumentDialog" persistent maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Document Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedDocument" class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card class="bg-grey-1">
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">📄 Document Information</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Name</q-item-label>
                        <q-item-label>{{ selectedDocument.name || 'Unknown' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Hash</q-item-label>
                        <q-item-label class="font-mono">{{ selectedDocument.hash }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Notarized By</q-item-label>
                        <q-item-label>{{ selectedDocument.owner }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Timestamp</q-item-label>
                        <q-item-label>{{ formatTimestamp(selectedDocument.timestamp) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Status</q-item-label>
                        <q-item-label>
                          <q-chip
                            :color="getStatusColor(selectedDocument.status)"
                            text-color="white"
                            :label="getStatusText(selectedDocument.status)"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card class="bg-blue-1">
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">🔗 Blockchain Information</div>
                  <q-list dense>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Transaction Hash</q-item-label>
                        <q-item-label class="font-mono">
                          <a :href="getExplorerUrl(selectedDocument.txHash)" target="_blank" class="text-primary">
                            {{ selectedDocument.txHash.substring(0, 10) }}...{{ selectedDocument.txHash.substring(selectedDocument.txHash.length - 8) }}
                          </a>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Block Number</q-item-label>
                        <q-item-label>{{ selectedDocument.blockNumber || 'N/A' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Gas Used</q-item-label>
                        <q-item-label>{{ selectedDocument.gasUsed || 'N/A' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- NFT Information -->
          <div v-if="selectedDocument.nftInfo" class="q-mt-md">
            <q-card class="bg-purple-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">🎨 NFT Receipt</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-img
                      :src="selectedDocument.nftInfo.image || ''"
                      alt="NFT Image"
                      style="width: 200px; height: 200px; object-fit: contain;"
                      class="rounded-borders"
                    >
                      <template #error>
                        <div class="flex flex-center bg-grey-3 text-grey-7" style="width: 100%; height: 100%;">
                          <q-icon name="image" size="48px" />
                        </div>
                      </template>
                    </q-img>
                  </div>
                  <div class="col-12 col-md-8">
                    <q-list dense>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>Token ID</q-item-label>
                          <q-item-label>{{ selectedDocument.nftInfo.tokenId }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>Name</q-item-label>
                          <q-item-label>{{ selectedDocument.nftInfo.name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section>
                          <q-item-label caption>Description</q-item-label>
                          <q-item-label>{{ selectedDocument.nftInfo.description }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Verification Actions -->
          <div class="q-mt-md">
            <q-card class="bg-green-1">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">✅ Verification Actions</div>
                <div class="row q-gutter-md">
                  <q-btn
                    color="primary"
                    label="Verify on Blockchain"
                    @click="verifyDocument(selectedDocument)"
                    :loading="verifying"
                    icon="verified"
                  />
                  <q-btn
                    color="secondary"
                    label="Download Proof"
                    @click="downloadProof(selectedDocument)"
                    icon="download"
                  />
                  <q-btn
                    color="info"
                    label="Share Proof"
                    @click="shareProof(selectedDocument)"
                    icon="share"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Verification Result Dialog -->
    <q-dialog v-model="showVerificationDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon
            :name="verificationResult.verified ? 'check_circle' : 'cancel'"
            :color="verificationResult.verified ? 'positive' : 'negative'"
            size="2rem"
            class="q-mr-md"
          />
          <div>
            <div class="text-h6">
              {{ verificationResult.verified ? 'Document Verified!' : 'Verification Failed' }}
            </div>
            <div class="text-body2">
              {{ verificationResult.message }}
            </div>
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
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Search and filter state
const searchQuery = ref('');
const statusFilter = ref('');
const dateFilter = ref('');
const addressFilter = ref('');

// Table state
const loading = ref(false);
const verifying = ref(false);
const documents = ref<any[]>([]);
const selectedDocument = ref<any>(null);
const showDocumentDialog = ref(false);
const showVerificationDialog = ref(false);
const verificationResult = ref({ verified: false, message: '' });

// Pagination
const pagination = ref({
  sortBy: 'timestamp',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// Filter options
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
];

const dateOptions = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
];

// Table columns
const columns = [
  {
    name: 'name',
    label: 'Document Name',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'hash',
    label: 'Hash',
    field: 'hash',
    align: 'left',
    sortable: false
  },
  {
    name: 'owner',
    label: 'Owner',
    field: 'owner',
    align: 'left',
    sortable: true
  },
  {
    name: 'timestamp',
    label: 'Notarized',
    field: 'timestamp',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false
  }
];

// Computed properties
const filteredDocuments = computed(() => {
  let filtered = documents.value;

  if (statusFilter.value) {
    filtered = filtered.filter(doc => doc.status === statusFilter.value);
  }

  if (addressFilter.value) {
    filtered = filtered.filter(doc =>
      doc.owner.toLowerCase().includes(addressFilter.value.toLowerCase())
    );
  }

  if (dateFilter.value) {
    const now = new Date();
    const docDate = new Date();

    switch (dateFilter.value) {
      case 'today':
        filtered = filtered.filter(doc => {
          docDate.setTime(doc.timestamp * 1000);
          return docDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(doc => doc.timestamp * 1000 > weekAgo.getTime());
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(doc => doc.timestamp * 1000 > monthAgo.getTime());
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(doc => doc.timestamp * 1000 > yearAgo.getTime());
        break;
    }
  }

  return filtered;
});

const totalDocuments = computed(() => documents.value.length);
const verifiedDocuments = computed(() => documents.value.filter(doc => doc.status === 'verified').length);
const pendingDocuments = computed(() => documents.value.filter(doc => doc.status === 'pending').length);
const totalUsers = computed(() => new Set(documents.value.map(doc => doc.owner)).size);

// Methods
function performSearch() {
  // Implement search logic
  $q.notify({
    type: 'info',
    message: 'Search functionality coming soon!',
    position: 'top'
  });
}

function clearFilters() {
  searchQuery.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
  addressFilter.value = '';
}

function loadDocuments() {
  loading.value = true;
  // Simulate loading documents
  setTimeout(() => {
    documents.value = [
      {
        name: 'Sample Document 1.pdf',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        owner: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        status: 'verified',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        blockNumber: 12345,
        gasUsed: '150000',
        nftInfo: {
          tokenId: '1',
          name: 'Sample Document 1',
          description: 'NFT receipt for document notarization',
          image: ''
        }
      },
      {
        name: 'Contract Agreement.docx',
        hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        owner: '0x8ba1f109551bA432bdf5c3c4Bdb5c4C699f9aEbc',
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        status: 'verified',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        blockNumber: 12344,
        gasUsed: '145000',
        nftInfo: null
      }
    ];
    loading.value = false;
  }, 1000);
}

function onRequest(props: any) {
  pagination.value = props.pagination;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'verified': return 'positive';
    case 'pending': return 'warning';
    case 'failed': return 'negative';
    default: return 'grey';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'verified': return 'Verified';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

function viewDocument(document: any) {
  selectedDocument.value = document;
  showDocumentDialog.value = true;
}

function verifyDocument(document: any) {
  verifying.value = true;
  // Simulate verification
  setTimeout(() => {
    verificationResult.value = {
      verified: true,
      message: `Document ${document.name} has been verified on the blockchain at ${formatTimestamp(document.timestamp)}`
    };
    showVerificationDialog.value = true;
    verifying.value = false;
  }, 2000);
}

function copyHash(hash: string) {
  navigator.clipboard.writeText(hash).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Hash copied to clipboard!',
      position: 'top'
    });
  });
}

function openExplorer(txHash: string) {
  window.open(getExplorerUrl(txHash), '_blank');
}

function getExplorerUrl(txHash: string) {
  return `https://www.oklink.com/amoy/tx/${txHash}`;
}

function downloadProof(document: any) {
  $q.notify({
    type: 'info',
    message: 'Download functionality coming soon!',
    position: 'top'
  });
}

function shareProof(document: any) {
  $q.notify({
    type: 'info',
    message: 'Share functionality coming soon!',
    position: 'top'
  });
}

// Lifecycle
onMounted(() => {
  loadDocuments();
});
</script>
