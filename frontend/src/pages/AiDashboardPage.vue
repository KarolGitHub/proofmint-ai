<template>
  <q-page class="ai-dashboard q-pa-md">
    <!-- Header Section -->
    <div class="dashboard-header q-mb-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="text-h4 text-weight-bold q-mb-sm">
            🤖 AI Insights Dashboard
          </h1>
          <p class="text-subtitle1 text-grey-7">
            Advanced AI-powered document analysis and insights
          </p>
        </div>
        <div class="row items-center q-gutter-md">
          <q-btn color="primary" icon="refresh" label="Refresh Data" @click="refreshDashboard" :loading="refreshing" />
          <q-btn color="secondary" icon="settings" label="AI Settings" @click="showSettings = true" />
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <div class="text-h3 text-primary q-mb-sm">
              {{ stats.totalDocuments }}
            </div>
            <div class="text-subtitle2 text-grey-7">Total Documents</div>
            <q-linear-progress :value="stats.processingRate" color="primary" class="q-mt-sm" />
            <div class="text-caption q-mt-xs">
              {{ (stats.processingRate * 100).toFixed(1) }}% processed
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <div class="text-h3 text-secondary q-mb-sm">
              {{ stats.aiAccuracy }}
            </div>
            <div class="text-subtitle2 text-grey-7">AI Accuracy</div>
            <q-linear-progress :value="stats.aiAccuracy / 100" color="secondary" class="q-mt-sm" />
            <div class="text-caption q-mt-xs">
              {{ stats.confidenceLevel }} confidence
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <div class="text-h3 text-positive q-mb-sm">
              {{ stats.avgProcessingTime }}
            </div>
            <div class="text-subtitle2 text-grey-7">Avg Processing</div>
            <div class="text-caption q-mt-xs">seconds per document</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card">
          <q-card-section class="text-center">
            <div class="text-h3 text-warning q-mb-sm">
              {{ stats.activeModels }}
            </div>
            <div class="text-subtitle2 text-grey-7">Active AI Models</div>
            <div class="text-caption q-mt-xs">
              {{ stats.modelHealth }} health
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="row q-gutter-lg">
      <!-- AI Processing Overview -->
      <div class="col-12 col-lg-8">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <h3 class="text-h6 text-weight-bold">AI Processing Overview</h3>
              <q-btn-toggle v-model="timeRange" :options="timeRangeOptions" color="primary" dense />
            </div>

            <!-- Processing Chart Placeholder -->
            <div class="chart-container text-center q-pa-xl">
              <q-icon name="analytics" size="4rem" color="primary" />
              <div class="text-h6 q-mt-md">Processing Analytics</div>
              <div class="text-caption text-grey-6">
                Chart visualization coming soon
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- AI Model Status -->
      <div class="col-12 col-lg-4">
        <q-card class="dashboard-card">
          <q-card-section>
            <h3 class="text-h6 text-weight-bold q-mb-md">AI Model Status</h3>

            <div class="q-gutter-y-md">
              <div v-for="model in aiModels" :key="model.name" class="model-status-item">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-sm">
                    <q-icon :name="model.status === 'active' ? 'check_circle' : 'error'"
                      :color="model.status === 'active' ? 'positive' : 'negative'" size="sm" />
                    <span class="text-weight-medium">{{ model.name }}</span>
                  </div>
                  <q-badge :color="model.status === 'active' ? 'positive' : 'negative'" :label="model.status" />
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ model.description }}
                </div>
                <q-linear-progress :value="model.performance"
                  :color="model.status === 'active' ? 'positive' : 'negative'" class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Document Analysis Insights -->
    <div class="row q-gutter-lg q-mt-lg">
      <div class="col-12 col-lg-6">
        <q-card class="dashboard-card">
          <q-card-section>
            <h3 class="text-h6 text-weight-bold q-mb-md">Document Types Analysis</h3>

            <div class="q-gutter-y-md">
              <div v-for="docType in documentTypes" :key="docType.type" class="doc-type-item">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-sm">
                    <q-icon :name="docType.icon" color="primary" size="sm" />
                    <span>{{ docType.type }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-weight-medium">{{ docType.count }}</div>
                    <div class="text-caption text-grey-6">
                      {{ docType.percentage }}% of total
                    </div>
                  </div>
                </div>
                <q-linear-progress :value="docType.percentage / 100" color="primary" class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card class="dashboard-card">
          <q-card-section>
            <h3 class="text-h6 text-weight-bold q-mb-md">AI Confidence Distribution</h3>

            <div class="q-gutter-y-md">
              <div v-for="confidence in confidenceLevels" :key="confidence.level" class="confidence-item">
                <div class="row items-center justify-between">
                  <span class="text-weight-medium">{{ confidence.level }}</span>
                  <div class="text-right">
                    <div class="text-weight-medium">{{ confidence.count }}</div>
                    <div class="text-caption text-grey-6">
                      {{ confidence.percentage }}%
                    </div>
                  </div>
                </div>
                <q-linear-progress :value="confidence.percentage / 100" :color="getConfidenceColor(confidence.level)"
                  class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent AI Activities -->
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <h3 class="text-h6 text-weight-bold">Recent AI Activities</h3>
              <q-btn color="primary" label="View All" flat dense />
            </div>

            <q-list separator>
              <q-item v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <q-item-section avatar>
                  <q-avatar :color="getActivityColor(activity.type)" text-color="white">
                    <q-icon :name="getActivityIcon(activity.type)" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ activity.title }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ activity.description }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-right">
                    <div class="text-caption text-grey-6">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                    <q-badge :color="getActivityColor(activity.type)" :label="activity.type" class="q-mt-xs" />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- AI Settings Dialog -->
    <q-dialog v-model="showSettings">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">AI Configuration</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-y-md">
            <div>
              <label class="text-weight-medium">AI Model Selection</label>
              <q-select v-model="aiSettings.model" :options="aiModelOptions" outlined dense class="q-mt-sm" />
            </div>

            <div>
              <label class="text-weight-medium">Processing Priority</label>
              <q-select v-model="aiSettings.priority" :options="priorityOptions" outlined dense class="q-mt-sm" />
            </div>

            <div>
              <label class="text-weight-medium">Confidence Threshold</label>
              <q-slider v-model="aiSettings.confidenceThreshold" :min="0" :max="100" :step="5" label color="primary"
                class="q-mt-sm" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn unelevated label="Save Settings" color="primary" @click="saveSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive data
const refreshing = ref(false)
const showSettings = ref(false)
const timeRange = ref('7d')

// Dashboard stats
const stats = ref({
  totalDocuments: 1247,
  processingRate: 0.87,
  aiAccuracy: 94.2,
  confidenceLevel: 'High',
  avgProcessingTime: 2.3,
  activeModels: 5,
  modelHealth: 'Excellent'
})

// AI Models status
const aiModels = ref([
  {
    name: 'Document Classifier',
    status: 'active',
    description: 'Automatically categorizes document types',
    performance: 0.96
  },
  {
    name: 'Text Extractor',
    status: 'active',
    description: 'Extracts text from various document formats',
    performance: 0.89
  },
  {
    name: 'Content Analyzer',
    status: 'active',
    description: 'Analyzes document content and context',
    performance: 0.92
  },
  {
    name: 'Language Detector',
    status: 'active',
    description: 'Detects document language automatically',
    performance: 0.98
  },
  {
    name: 'Sentiment Analyzer',
    status: 'active',
    description: 'Analyzes document sentiment and tone',
    performance: 0.85
  }
])

// Document types analysis
const documentTypes = ref([
  { type: 'Legal Documents', icon: 'gavel', count: 456, percentage: 37 },
  { type: 'Financial Reports', icon: 'account_balance', count: 234, percentage: 19 },
  { type: 'Contracts', icon: 'description', count: 189, percentage: 15 },
  { type: 'Invoices', icon: 'receipt', count: 156, percentage: 13 },
  { type: 'Other', icon: 'folder', count: 212, percentage: 17 }
])

// Confidence levels
const confidenceLevels = ref([
  { level: 'Very High (90-100%)', count: 567, percentage: 45 },
  { level: 'High (80-89%)', count: 423, percentage: 34 },
  { level: 'Medium (70-79%)', count: 189, percentage: 15 },
  { level: 'Low (60-69%)', count: 68, percentage: 5 }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    type: 'classification',
    title: 'Document classified as Legal Contract',
    description: 'AI successfully categorized document with 94% confidence',
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    type: 'extraction',
    title: 'Text extracted from PDF',
    description: 'OCR processing completed for 15-page document',
    timestamp: new Date(Date.now() - 12 * 60 * 1000)
  },
  {
    id: 3,
    type: 'analysis',
    title: 'Content analysis completed',
    description: 'AI identified key clauses and risk factors',
    timestamp: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    id: 4,
    type: 'validation',
    title: 'Document validation successful',
    description: 'All required fields verified and validated',
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  }
])

// AI Settings
const aiSettings = ref({
  model: 'gpt-4',
  priority: 'balanced',
  confidenceThreshold: 75
})

// Options
const timeRangeOptions = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' }
]

const aiModelOptions = [
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3',
  'llama-2'
]

const priorityOptions = [
  'speed',
  'balanced',
  'accuracy'
]

// Methods
const refreshDashboard = async () => {
  refreshing.value = true
  try {
    // Fetch all dashboard data
    const [statsResponse, modelsResponse, analyticsResponse, activitiesResponse] = await Promise.all([
      fetch('/ai/dashboard/stats'),
      fetch('/ai/dashboard/models'),
      fetch('/ai/dashboard/analytics'),
      fetch('/ai/dashboard/activities')
    ])

    if (!statsResponse.ok || !modelsResponse.ok || !analyticsResponse.ok || !activitiesResponse.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const [statsData, modelsData, analyticsData, activitiesData] = await Promise.all([
      statsResponse.json(),
      modelsResponse.json(),
      analyticsResponse.json(),
      activitiesResponse.json()
    ])

    // Update all data
    stats.value = statsData
    aiModels.value = modelsData
    documentTypes.value = analyticsData.documentTypes
    confidenceLevels.value = analyticsData.confidenceLevels
    recentActivities.value = activitiesData

    $q.notify({
      type: 'positive',
      message: 'Dashboard refreshed successfully!'
    })
  } catch (error) {
    console.error('Error refreshing dashboard:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh dashboard'
    })
  } finally {
    refreshing.value = false
  }
}

const saveSettings = async () => {
  try {
    const response = await fetch('/ai/dashboard/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aiSettings.value)
    })

    if (!response.ok) {
      throw new Error('Failed to save settings')
    }

    const result = await response.json()

    $q.notify({
      type: 'positive',
      message: result.message || 'AI settings saved successfully!'
    })
    showSettings.value = false
  } catch (error) {
    console.error('Error saving settings:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save AI settings'
    })
  }
}

// Load initial settings
const loadSettings = async () => {
  try {
    const response = await fetch('/ai/dashboard/settings')
    if (response.ok) {
      const settingsData = await response.json()
      aiSettings.value = settingsData
    }
  } catch (error) {
    console.error('Error loading AI settings:', error)
  }
}

const getConfidenceColor = (level) => {
  if (level.includes('Very High')) return 'positive'
  if (level.includes('High')) return 'secondary'
  if (level.includes('Medium')) return 'warning'
  return 'negative'
}

const getActivityColor = (type) => {
  const colors = {
    classification: 'primary',
    extraction: 'secondary',
    analysis: 'positive',
    validation: 'warning'
  }
  return colors[type] || 'grey'
}

const getActivityIcon = (type) => {
  const icons = {
    classification: 'category',
    extraction: 'text_fields',
    analysis: 'analytics',
    validation: 'verified'
  }
  return icons[type] || 'info'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Lifecycle
onMounted(() => {
  // Initialize dashboard data
  refreshDashboard()
  loadSettings() // Load settings on mount
})
</script>

<style scoped>
.ai-dashboard {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.model-status-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.model-status-item:last-child {
  border-bottom: none;
}

.doc-type-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.doc-type-item:last-child {
  border-bottom: none;
}

.confidence-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.confidence-item:last-child {
  border-bottom: none;
}

.activity-item {
  padding: 16px 0;
}

.activity-item:hover {
  background: #f8f9fa;
  border-radius: 8px;
}
</style>
