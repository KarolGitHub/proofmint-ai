<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Settings</div>

    <!-- Settings Navigation Tabs -->
    <q-tabs v-model="activeTab" class="text-grey-8" active-color="primary" indicator-color="primary" align="justify"
      narrow-indicator>
      <q-tab name="general" label="General" icon="settings" />
      <q-tab name="api" label="API Keys" icon="key" />
      <q-tab name="wallet" label="Wallet" icon="account_balance_wallet" />
      <q-tab name="blockchain" label="Blockchain" icon="currency_bitcoin" />
      <q-tab name="ai" label="AI Services" icon="psychology" />
      <q-tab name="storage" label="Storage" icon="cloud" />
    </q-tabs>

    <q-separator class="q-my-md" />

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">General Preferences</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="settings.language" :options="languageOptions" label="Language" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-select v-model="settings.theme" :options="themeOptions" label="Theme" outlined dense />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-toggle v-model="settings.notifications" label="Enable Notifications" color="primary" />
          </div>
          <div class="col-12 col-md-6">
            <q-toggle v-model="settings.autoSave" label="Auto-save Documents" color="primary" />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="settings.defaultCurrency" label="Default Currency" outlined dense placeholder="USD" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="settings.timezone" label="Timezone" outlined dense placeholder="UTC" />
          </div>
        </div>
      </q-card>
    </div>

    <!-- API Keys Settings -->
    <div v-if="activeTab === 'api'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">API Configuration</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="apiKeys.openai" label="OpenAI API Key" outlined dense type="password" placeholder="sk-..."
              :rules="[val => !!val || 'OpenAI API key is required']">
              <template v-slot:append>
                <q-icon :name="showOpenAIKey ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showOpenAIKey = !showOpenAIKey" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="apiKeys.web3storage" label="Web3.Storage API Key" outlined dense type="password"
              placeholder="eyJ...">
              <template v-slot:append>
                <q-icon :name="showWeb3Key ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                  @click="showWeb3Key = !showWeb3Key" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="apiKeys.alchemy" label="Alchemy API Key" outlined dense type="password"
              placeholder="Your Alchemy API key" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="apiKeys.infura" label="Infura Project ID" outlined dense
              placeholder="Your Infura project ID" />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="Test API Connections" @click="testAPIConnections" :loading="testingAPIs" />
        </div>
      </q-card>
    </div>

    <!-- Wallet Settings -->
    <div v-if="activeTab === 'wallet'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">Wallet Configuration</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="wallet.address" label="Wallet Address" outlined dense readonly placeholder="0x...">
              <template v-slot:append>
                <q-btn flat round dense icon="content_copy" @click="copyToClipboard(wallet.address)" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="wallet.network" label="Network" outlined dense readonly placeholder="Polygon Mumbai" />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="wallet.balance" label="Balance" outlined dense readonly placeholder="0 MATIC" />
          </div>
          <div class="col-12 col-md-6">
            <q-btn color="secondary" label="Connect Wallet" @click="connectWallet" :loading="connectingWallet" />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="View on Explorer" @click="viewOnExplorer" icon="open_in_new" />
        </div>
      </q-card>
    </div>

    <!-- Blockchain Settings -->
    <div v-if="activeTab === 'blockchain'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">Blockchain Configuration</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="blockchain.network" :options="networkOptions" label="Network" outlined dense
              @update:model-value="onNetworkChange" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="blockchain.rpcUrl" label="RPC URL" outlined dense placeholder="https://..." />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="blockchain.chainId" label="Chain ID" outlined dense readonly placeholder="80001" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="blockchain.blockExplorer" label="Block Explorer" outlined dense
              placeholder="https://mumbai.polygonscan.com" />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="Test Connection" @click="testBlockchainConnection"
            :loading="testingBlockchain" />
        </div>
      </q-card>
    </div>

    <!-- AI Services Settings -->
    <div v-if="activeTab === 'ai'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">AI Service Preferences</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="ai.defaultProvider" :options="aiProviderOptions" label="Default AI Provider" outlined
              dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="ai.maxTokens" label="Max Tokens" outlined dense type="number" placeholder="2048" />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="ai.temperature" label="Temperature" outlined dense type="number" step="0.1" min="0"
              max="2" placeholder="0.7" />
          </div>
          <div class="col-12 col-md-6">
            <q-toggle v-model="ai.streaming" label="Enable Streaming" color="primary" />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="Test AI Service" @click="testAIService" :loading="testingAI" />
        </div>
      </q-card>
    </div>

    <!-- Storage Settings -->
    <div v-if="activeTab === 'storage'" class="q-gutter-y-md">
      <q-card class="q-pa-md">
        <div class="text-h6 q-mb-md">Storage Configuration</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <q-select v-model="storage.defaultProvider" :options="storageProviderOptions"
              label="Default Storage Provider" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-toggle v-model="storage.encryption" label="Enable Encryption" color="primary" />
          </div>
        </div>

        <div class="row q-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-input v-model="storage.maxFileSize" label="Max File Size (MB)" outlined dense type="number"
              placeholder="50" />
          </div>
          <div class="col-12 col-md-6">
            <q-toggle v-model="storage.compression" label="Enable Compression" color="primary" />
          </div>
        </div>

        <div class="q-mt-md">
          <q-btn color="primary" label="Test Storage" @click="testStorage" :loading="testingStorage" />
        </div>
      </q-card>
    </div>

    <!-- Save Button -->
    <div class="q-mt-lg">
      <q-btn color="primary" label="Save All Settings" size="lg" @click="saveSettings" :loading="saving" />
    </div>

    <!-- Success/Error Messages -->
    <q-dialog v-model="showMessage" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ messageTitle }}</div>
        </q-card-section>
        <q-card-section>
          {{ messageText }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const activeTab = ref('general')
const saving = ref(false)
const testingAPIs = ref(false)
const connectingWallet = ref(false)
const testingBlockchain = ref(false)
const testingAI = ref(false)
const testingStorage = ref(false)
const showMessage = ref(false)
const messageTitle = ref('')
const messageText = ref('')

// Show/hide API keys
const showOpenAIKey = ref(false)
const showWeb3Key = ref(false)

// Settings objects
const settings = reactive({
  language: 'en',
  theme: 'auto',
  notifications: true,
  autoSave: true,
  defaultCurrency: 'USD',
  timezone: 'UTC'
})

const apiKeys = reactive({
  openai: '',
  web3storage: '',
  alchemy: '',
  infura: ''
})

const wallet = reactive({
  address: '',
  network: 'Polygon Mumbai',
  balance: '0 MATIC'
})

const blockchain = reactive({
  network: 'mumbai',
  rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/qFub-E6RV8pTUi4rgQfGd',
  chainId: '80001',
  blockExplorer: 'https://mumbai.polygonscan.com'
})

const ai = reactive({
  defaultProvider: 'openai',
  maxTokens: 2048,
  temperature: 0.7,
  streaming: false
})

const storage = reactive({
  defaultProvider: 'ipfs',
  encryption: true,
  maxFileSize: 50,
  compression: true
})

// Options
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' }
]

const themeOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
]

const networkOptions = [
  { label: 'Polygon Mumbai', value: 'mumbai' },
  { label: 'Polygon Mainnet', value: 'polygon' },
  { label: 'Ethereum Goerli', value: 'goerli' },
  { label: 'Ethereum Mainnet', value: 'ethereum' }
]

const aiProviderOptions = [
  { label: 'OpenAI GPT-4', value: 'openai' },
  { label: 'Anthropic Claude', value: 'claude' },
  { label: 'Google Gemini', value: 'gemini' }
]

const storageProviderOptions = [
  { label: 'IPFS', value: 'ipfs' },
  { label: 'Arweave', value: 'arweave' },
  { label: 'Filecoin', value: 'filecoin' }
]

// Methods
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  $q.notify({
    type: 'positive',
    message: 'Copied to clipboard!'
  })
}

const connectWallet = async () => {
  connectingWallet.value = true
  try {
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    wallet.address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    wallet.balance = '125.45 MATIC'
    showSuccessMessage('Wallet Connected', 'Successfully connected to MetaMask')
  } catch (error) {
    showErrorMessage('Connection Failed', 'Failed to connect wallet')
  } finally {
    connectingWallet.value = false
  }
}

const viewOnExplorer = () => {
  if (wallet.address) {
    window.open(`https://mumbai.polygonscan.com/address/${wallet.address}`, '_blank')
  }
}

const onNetworkChange = (network: string) => {
  // Update RPC URL and chain ID based on network
  const networkConfigs = {
    mumbai: {
      rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/qFub-E6RV8pTUi4rgQfGd',
      chainId: '80001',
      blockExplorer: 'https://mumbai.polygonscan.com'
    },
    polygon: {
      rpcUrl: 'https://polygon-rpc.com',
      chainId: '137',
      blockExplorer: 'https://polygonscan.com'
    },
    goerli: {
      rpcUrl: 'https://goerli.infura.io/v3/your-project-id',
      chainId: '5',
      blockExplorer: 'https://goerli.etherscan.io'
    },
    ethereum: {
      rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
      chainId: '1',
      blockExplorer: 'https://etherscan.io'
    }
  }

  const config = networkConfigs[network as keyof typeof networkConfigs]
  if (config) {
    blockchain.rpcUrl = config.rpcUrl
    blockchain.chainId = config.chainId
    blockchain.blockExplorer = config.blockExplorer
  }
}

const testAPIConnections = async () => {
  testingAPIs.value = true
  try {
    // Simulate API testing
    await new Promise(resolve => setTimeout(resolve, 3000))
    showSuccessMessage('API Test Complete', 'All API connections are working correctly')
  } catch (error) {
    showErrorMessage('API Test Failed', 'Some API connections failed. Please check your keys.')
  } finally {
    testingAPIs.value = false
  }
}

const testBlockchainConnection = async () => {
  testingBlockchain.value = true
  try {
    // Simulate blockchain test
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccessMessage('Connection Test Complete', 'Successfully connected to blockchain network')
  } catch (error) {
    showErrorMessage('Connection Failed', 'Failed to connect to blockchain network')
  } finally {
    testingBlockchain.value = false
  }
}

const testAIService = async () => {
  testingAI.value = true
  try {
    // Simulate AI service test
    await new Promise(resolve => setTimeout(resolve, 2500))
    showSuccessMessage('AI Service Test Complete', 'AI service is working correctly')
  } catch (error) {
    showErrorMessage('AI Service Failed', 'AI service test failed. Please check your configuration.')
  } finally {
    testingAI.value = false
  }
}

const testStorage = async () => {
  testingStorage.value = true
  try {
    // Simulate storage test
    await new Promise(resolve => setTimeout(resolve, 2000))
    showSuccessMessage('Storage Test Complete', 'Storage service is working correctly')
  } catch (error) {
    showErrorMessage('Storage Test Failed', 'Storage service test failed. Please check your configuration.')
  } finally {
    testingStorage.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Save to localStorage
    localStorage.setItem('proofmint-settings', JSON.stringify({
      settings,
      apiKeys: {
        openai: apiKeys.openai,
        web3storage: apiKeys.web3storage,
        alchemy: apiKeys.alchemy,
        infura: apiKeys.infura
      },
      blockchain,
      ai,
      storage
    }))

    showSuccessMessage('Settings Saved', 'All settings have been saved successfully')
  } catch (error) {
    showErrorMessage('Save Failed', 'Failed to save settings. Please try again.')
  } finally {
    saving.value = false
  }
}

const showSuccessMessage = (title: string, text: string) => {
  messageTitle.value = title
  messageText.value = text
  showMessage.value = true
}

const showErrorMessage = (title: string, text: string) => {
  messageTitle.value = title
  messageText.value = text
  showMessage.value = true
}

// Load saved settings on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('proofmint-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings, parsed.settings || {})
      Object.assign(apiKeys, parsed.apiKeys || {})
      Object.assign(blockchain, parsed.blockchain || {})
      Object.assign(ai, parsed.ai || {})
      Object.assign(storage, parsed.storage || {})
    } catch (error) {
      console.error('Failed to load saved settings:', error)
    }
  }
})
</script>

<style scoped>
.q-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.q-input,
.q-select {
  margin-bottom: 16px;
}

.q-toggle {
  margin-bottom: 16px;
}
</style>
