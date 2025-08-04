<template>
  <q-page class="flex flex-center column q-gutter-md">
    <div class="text-h4 q-mb-lg">IPFS Storage & Encryption</div>

    <!-- IPFS Upload Component -->
    <IpfsUpload />

    <!-- IPFS Download Section -->
    <q-card class="q-pa-md q-mt-lg" style="max-width: 600px;">
      <q-card-section>
        <div class="text-h6 q-mb-md">Download from IPFS</div>

        <q-input
          v-model="downloadCid"
          label="IPFS CID"
          outlined
          placeholder="Enter the CID to download"
          class="q-mb-md"
        />

        <q-option-group
          v-model="downloadType"
          :options="[
            { label: 'Public File', value: 'public' },
            { label: 'Encrypted File', value: 'encrypted' }
          ]"
          color="primary"
          inline
          class="q-mb-md"
        />

        <q-input
          v-if="downloadType === 'encrypted'"
          v-model="downloadKey"
          label="Encryption Key (hex format)"
          outlined
          placeholder="Enter the encryption key"
          class="q-mb-md"
        />

        <q-btn
          label="Download File"
          color="secondary"
          :loading="downloading"
          :disable="!downloadCid || (downloadType === 'encrypted' && !downloadKey)"
          @click="downloadFile"
          class="q-mb-md"
        />

        <q-banner
          v-if="downloadError"
          class="bg-negative text-white q-mb-md"
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ downloadError }}
        </q-banner>

        <q-banner
          v-if="downloadSuccess"
          class="bg-positive text-white q-mb-md"
        >
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          File downloaded successfully!
        </q-banner>
      </q-card-section>
    </q-card>

    <!-- File Info Section -->
    <q-card class="q-pa-md q-mt-lg" style="max-width: 600px;">
      <q-card-section>
        <div class="text-h6 q-mb-md">Get File Information</div>

        <q-input
          v-model="infoCid"
          label="IPFS CID"
          outlined
          placeholder="Enter the CID to get info"
          class="q-mb-md"
        />

        <q-btn
          label="Get File Info"
          color="info"
          :loading="gettingInfo"
          :disable="!infoCid"
          @click="getFileInfo"
          class="q-mb-md"
        />

        <div v-if="fileInfo" class="q-mt-md">
          <q-list bordered>
            <q-item>
              <q-item-section>
                <q-item-label caption>CID</q-item-label>
                <q-item-label>{{ fileInfo.cid }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Content Type</q-item-label>
                <q-item-label>{{ fileInfo.contentType || 'Unknown' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Size</q-item-label>
                <q-item-label>{{ fileInfo.contentLength ? formatBytes(fileInfo.contentLength) : 'Unknown' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>URL</q-item-label>
                <q-item-label>
                  <a :href="fileInfo.url" target="_blank" class="text-primary">
                    {{ fileInfo.url }}
                  </a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-banner
          v-if="infoError"
          class="bg-negative text-white q-mt-md"
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ infoError }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import IpfsUpload from 'components/IpfsUpload.vue'

const $q = useQuasar()

// Download section
const downloadCid = ref('')
const downloadType = ref<'public' | 'encrypted'>('public')
const downloadKey = ref('')
const downloading = ref(false)
const downloadError = ref('')
const downloadSuccess = ref(false)

// File info section
const infoCid = ref('')
const gettingInfo = ref(false)
const fileInfo = ref<any>(null)
const infoError = ref('')

// Methods
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function downloadFile() {
  if (!downloadCid.value) return

  downloading.value = true
  downloadError.value = ''
  downloadSuccess.value = false

  try {
    let response

    if (downloadType.value === 'public') {
      response = await axios.get(`/api/ipfs/download/${downloadCid.value}`, {
        responseType: 'blob'
      })
    } else {
      response = await axios.post(`/api/ipfs/download/encrypted/${downloadCid.value}`, {
        encryptionKey: downloadKey.value
      }, {
        responseType: 'blob'
      })
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `ipfs_${downloadCid.value}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    downloadSuccess.value = true
    $q.notify({
      type: 'positive',
      message: 'File downloaded successfully!'
    })

  } catch (error: any) {
    console.error('Download error:', error)
    downloadError.value = error.response?.data?.error || error.message || 'Download failed'

    $q.notify({
      type: 'negative',
      message: downloadError.value
    })
  } finally {
    downloading.value = false
  }
}

async function getFileInfo() {
  if (!infoCid.value) return

  gettingInfo.value = true
  infoError.value = ''
  fileInfo.value = null

  try {
    const response = await axios.get(`/api/ipfs/info/${infoCid.value}`)
    fileInfo.value = response.data

    $q.notify({
      type: 'positive',
      message: 'File info retrieved successfully!'
    })

  } catch (error: any) {
    console.error('File info error:', error)
    infoError.value = error.response?.data?.error || error.message || 'Failed to get file info'

    $q.notify({
      type: 'negative',
      message: infoError.value
    })
  } finally {
    gettingInfo.value = false
  }
}
</script>

<style scoped>
a {
  text-decoration: underline;
}
</style>
