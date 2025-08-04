<template>
  <div class="ipfs-upload q-pa-md">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">IPFS File Upload</div>

        <!-- File Upload -->
        <q-file
          v-model="selectedFile"
          label="Choose file to upload"
          outlined
          accept="*/*"
          :rules="[val => !!val || 'Please select a file']"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <!-- Encryption Options -->
        <q-card class="q-mb-md bg-grey-1">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Storage Options</div>

            <q-option-group
              v-model="storageType"
              :options="[
                { label: 'Public Storage (Unencrypted)', value: 'public' },
                { label: 'Encrypted Storage', value: 'encrypted' }
              ]"
              color="primary"
              inline
            />
          </q-card-section>
        </q-card>

        <!-- Encryption Key Section -->
        <div v-if="storageType === 'encrypted'" class="q-mb-md">
          <q-card class="bg-blue-1">
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Encryption Settings</div>

              <q-option-group
                v-model="keyOption"
                :options="[
                  { label: 'Generate new key', value: 'generate' },
                  { label: 'Use custom key', value: 'custom' }
                ]"
                color="primary"
                inline
              />

              <div v-if="keyOption === 'custom'" class="q-mt-md">
                <q-input
                  v-model="customKey"
                  label="Encryption Key (hex format)"
                  outlined
                  :rules="[val => isValidHex(val) || 'Invalid hex format']"
                  hint="Enter a 64-character hex string (256-bit key)"
                />
              </div>

              <div v-if="generatedKey" class="q-mt-md">
                <q-banner class="bg-positive text-white">
                  <template v-slot:avatar>
                    <q-icon name="key" />
                  </template>
                  Generated Key: {{ generatedKey }}
                  <q-btn
                    flat
                    dense
                    icon="content_copy"
                    @click="copyToClipboard(generatedKey)"
                    class="q-ml-sm"
                  />
                </q-banner>
                <div class="text-caption q-mt-sm">
                  Save this key securely - you'll need it to decrypt the file later!
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Upload Button -->
        <q-btn
          :label="uploadButtonText"
          color="primary"
          :loading="uploading"
          :disable="!selectedFile || uploading"
          @click="uploadFile"
          class="q-mb-md"
        />

        <!-- Progress -->
        <q-linear-progress
          v-if="uploading"
          :value="uploadProgress / 100"
          color="primary"
          size="20px"
          rounded
          class="q-mb-md"
        >
          <div class="absolute-full flex flex-center text-white">
            Uploading: {{ uploadProgress }}%
          </div>
        </q-linear-progress>

        <!-- Results -->
        <div v-if="uploadResult" class="q-mt-md">
          <q-card class="bg-positive text-white">
            <q-card-section>
              <div class="text-h6">Upload Successful!</div>
              <div class="q-mt-sm">
                <strong>CID:</strong> {{ uploadResult.cid }}
              </div>
              <div class="q-mt-sm">
                <strong>URL:</strong>
                <a :href="uploadResult.url" target="_blank" class="text-white">
                  {{ uploadResult.url }}
                </a>
              </div>
              <div v-if="uploadResult.encryptionKey" class="q-mt-sm">
                <strong>Encryption Key:</strong> {{ uploadResult.encryptionKey }}
              </div>
              <div class="q-mt-sm">
                <q-btn
                  flat
                  dense
                  icon="content_copy"
                  @click="copyToClipboard(uploadResult.cid)"
                  label="Copy CID"
                />
                <q-btn
                  v-if="uploadResult.encryptionKey"
                  flat
                  dense
                  icon="content_copy"
                  @click="copyToClipboard(uploadResult.encryptionKey)"
                  label="Copy Key"
                  class="q-ml-sm"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Error -->
        <q-banner
          v-if="uploadError"
          class="bg-negative text-white q-mt-md"
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ uploadError }}
        </q-banner>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

// Reactive data
const selectedFile = ref<File | null>(null)
const storageType = ref<'public' | 'encrypted'>('public')
const keyOption = ref<'generate' | 'custom'>('generate')
const customKey = ref('')
const generatedKey = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadResult = ref<any>(null)
const uploadError = ref('')

// Computed
const uploadButtonText = computed(() => {
  if (uploading.value) return 'Uploading...'
  return storageType.value === 'encrypted' ? 'Upload Encrypted' : 'Upload to IPFS'
})

// Methods
function isValidHex(str: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(str)
}

async function generateKey() {
  try {
    const response = await axios.post('/api/ipfs/generate-key')
    generatedKey.value = response.data.encryptionKey
    return response.data.encryptionKey
  } catch (error) {
    console.error('Failed to generate key:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to generate encryption key'
    })
    throw error
  }
}

async function uploadFile() {
  if (!selectedFile.value) return

  uploading.value = true
  uploadProgress.value = 0
  uploadError.value = ''
  uploadResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    let endpoint = '/api/ipfs/upload'
    let config = {}

    if (storageType.value === 'encrypted') {
      endpoint = '/api/ipfs/upload/encrypted'

      if (keyOption.value === 'generate') {
        const key = await generateKey()
        formData.append('encryptionKey', key)
      } else if (customKey.value) {
        formData.append('encryptionKey', customKey.value)
      }
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.random() * 10
      }
    }, 100)

    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    uploadResult.value = response.data

    $q.notify({
      type: 'positive',
      message: 'File uploaded successfully!'
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    uploadError.value = error.response?.data?.error || error.message || 'Upload failed'

    $q.notify({
      type: 'negative',
      message: uploadError.value
    })
  } finally {
    uploading.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Copied to clipboard!'
    })
  }).catch(() => {
    $q.notify({
      type: 'negative',
      message: 'Failed to copy to clipboard'
    })
  })
}

// Watch for key option changes
watch(keyOption, (newValue) => {
  if (newValue === 'generate') {
    customKey.value = ''
  }
})

// Watch for storage type changes
watch(storageType, (newValue) => {
  if (newValue === 'public') {
    keyOption.value = 'generate'
    customKey.value = ''
    generatedKey.value = ''
  }
})
</script>

<style scoped>
.ipfs-upload {
  max-width: 600px;
  margin: 0 auto;
}

a {
  text-decoration: underline;
}
</style>
