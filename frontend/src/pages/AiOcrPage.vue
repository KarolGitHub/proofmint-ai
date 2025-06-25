<template>
        <q-page class="flex flex-center column q-gutter-md">
                <div class="text-h5">AI / OCR</div>
                <div class="q-mt-md">Upload a document to extract text and metadata using AI and OCR.</div>
                <input type="file" @change="onFileChange" accept=".pdf,image/*" />
                <div class="row q-mt-md q-gutter-md">
                        <q-select v-model="analysisType" :options="analysisOptions" label="Analysis Type" outlined dense style="min-width: 180px;" />
                        <q-select v-model="language" :options="languageOptions" label="Language" outlined dense style="min-width: 140px;" />
                        <q-select v-model="provider" :options="providerOptions" label="Provider" outlined dense style="min-width: 140px;" />
                </div>
                <q-btn color="primary" label="Analyze Document" class="q-mt-md" :disable="!selectedFile || isLoading"
                        @click="analyze" />
                <q-spinner v-if="isLoading" color="primary" size="2em" class="q-mt-md" />
                <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>
                <div v-if="result" class="q-mt-md bg-grey-2 q-pa-md rounded-borders" style="max-width:600px;">
                        <div class="text-h6">AI / OCR Result</div>
                        <div v-if="analysisType === 'metadata'">
                                <div class="q-mt-sm"><b>Dates:</b> <span v-if="result.dates">{{ result.dates.join(', ') }}</span></div>
                                <div class="q-mt-sm"><b>Signatories:</b> <span v-if="result.signatories">{{ result.signatories.join(', ') }}</span></div>
                                <div class="q-mt-sm"><b>Clauses:</b>
                                        <q-list v-if="result.clauses && result.clauses.length">
                                                <q-item v-for="(clause, idx) in result.clauses" :key="idx">
                                                        <q-item-section>
                                                                <div><b>{{ clause.title }}</b></div>
                                                                <div class="text-caption">{{ clause.text }}</div>
                                                        </q-item-section>
                                                </q-item>
                                        </q-list>
                                </div>
                        </div>
                        <div v-else-if="analysisType === 'clauses'">
                                <q-list v-if="Array.isArray(result)">
                                        <q-item v-for="(clause, idx) in result" :key="idx">
                                                <q-item-section>
                                                        <div><b>{{ clause.title }}</b></div>
                                                        <div class="text-caption">{{ clause.text }}</div>
                                                </q-item-section>
                                        </q-item>
                                </q-list>
                                <div v-else>{{ result.message || JSON.stringify(result, null, 2) }}</div>
                        </div>
                        <div v-else-if="analysisType === 'classify'">
                                <div class="q-mt-sm"><b>Type:</b> {{ result.type }}</div>
                                <div class="q-mt-sm"><b>Reason:</b> {{ result.reason }}</div>
                                <div v-if="result.message">{{ result.message }}</div>
                        </div>
                        <div v-else>
                                <pre class="q-mt-sm" style="white-space:pre-wrap;word-break:break-word;">{{ result }}</pre>
                        </div>
                </div>
        </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../boot/axios';

const selectedFile = ref<File | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const result = ref<any>(null);

const analysisOptions = [
        { label: 'Metadata Extraction', value: 'metadata' },
        { label: 'Clause Extraction', value: 'clauses' },
        { label: 'Document Classification', value: 'classify' },
];
const analysisType = ref('metadata');

const languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Polish', value: 'pl' },
        { label: 'Other', value: 'other' },
];
const language = ref('en');

const providerOptions = [
        { label: 'OpenAI', value: 'openai' },
        { label: 'Local (coming soon)', value: 'local' },
];
const provider = ref('openai');

function onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
                selectedFile.value = input.files[0];
        }
}

async function analyze() {
        error.value = null;
        result.value = null;
        if (!selectedFile.value) return;
        isLoading.value = true;
        try {
                // Step 1: OCR extract text
                const formData = new FormData();
                formData.append('file', selectedFile.value);
                const ocrResp = await api.post('/ocr/extract', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                });
                const text = typeof ocrResp.data === 'string' ? ocrResp.data : ocrResp.data.text || ocrResp.data;
                // Step 2: AI analysis
                let aiResp;
                if (analysisType.value === 'metadata') {
                        aiResp = await api.post('/ai/metadata', { text, provider: provider.value, language: language.value });
                        result.value = aiResp.data;
                } else if (analysisType.value === 'clauses') {
                        aiResp = await api.post('/ai/clauses', { text, provider: provider.value, language: language.value });
                        result.value = aiResp.data;
                } else if (analysisType.value === 'classify') {
                        aiResp = await api.post('/ai/classify', { text, provider: provider.value, language: language.value });
                        result.value = aiResp.data;
                }
        } catch (e: any) {
                error.value = e.response?.data?.error || e.message || 'Analysis failed';
        } finally {
                isLoading.value = false;
        }
}
</script>