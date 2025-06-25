<template>
        <q-page class="flex flex-center column q-gutter-md">
                <div class="text-h5">AI / OCR</div>
                <div class="q-mt-md">Upload a document to extract text and metadata using AI and OCR.</div>
                <div class="row q-gutter-md q-mt-md">
                        <q-toggle v-model="batchMode" label="Batch Analysis" />
                </div>
                <input
                        :multiple="batchMode"
                        type="file"
                        @change="onFileChange"
                        accept=".pdf,image/*"
                />
                <div class="row q-mt-md q-gutter-md">
                        <q-select v-model="analysisType" :options="analysisOptions" label="Analysis Type" outlined dense style="min-width: 180px;" />
                        <q-select v-model="language" :options="languageOptions" label="Language" outlined dense style="min-width: 140px;" />
                        <q-select v-model="provider" :options="providerOptions" label="Provider" outlined dense style="min-width: 140px;" />
                </div>
                <q-btn
                        v-if="!batchMode"
                        color="primary"
                        label="Analyze Document"
                        class="q-mt-md"
                        :disable="!selectedFile || isLoading"
                        @click="analyze"
                />
                <q-btn
                        v-else
                        color="primary"
                        label="Batch Analyze Documents"
                        class="q-mt-md"
                        :disable="!selectedFiles.length || isLoading"
                        @click="analyzeBatch"
                />
                <q-spinner v-if="isLoading" color="primary" size="2em" class="q-mt-md" />
                <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>
                <div v-if="!batchMode && result" class="q-mt-md bg-grey-2 q-pa-md rounded-borders" style="max-width:600px;">
                        <div class="text-h6">AI / OCR Result</div>
                        <div v-if="analysisType === 'metadata'">
                                <div class="q-mt-sm"><b>Dates:</b> <span v-if="Array.isArray(result?.dates)">{{ getDates(result?.dates).join(', ') }}</span></div>
                                <div class="q-mt-sm"><b>Signatories:</b> <span v-if="Array.isArray(result?.signatories)">{{ getSignatories(result?.signatories).join(', ') }}</span></div>
                                <div class="q-mt-sm"><b>Clauses:</b>
                                        <q-list v-if="Array.isArray(result?.clauses) && result.clauses.length">
                                                <q-item v-for="(clause, idx) in getClauses(result?.clauses)" :key="idx">
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
                <div v-if="batchMode && batchResults.length" class="q-mt-md bg-grey-2 q-pa-md rounded-borders" style="max-width:900px;">
                        <div class="text-h6">Batch AI / OCR Results</div>
                        <q-table
                                :rows="batchTableRows"
                                :columns="batchTableColumns"
                                row-key="name"
                                flat
                                dense
                                :pagination="{ rowsPerPage: 5 }"
                        >
                                <template v-slot:body-cell-result="props">
                                        <div v-if="analysisType === 'metadata'">
                                                <div><b>Dates:</b> <span v-if="Array.isArray(props.row.result.dates)">{{ getDates(props.row.result.dates).join(', ') }}</span></div>
                                                <div><b>Signatories:</b> <span v-if="Array.isArray(props.row.result.signatories)">{{ getSignatories(props.row.result.signatories).join(', ') }}</span></div>
                                                <div><b>Clauses:</b>
                                                        <ul v-if="Array.isArray(props.row.result.clauses) && props.row.result.clauses.length">
                                                                <li v-for="(clause, idx) in getClauses(props.row.result.clauses)" :key="idx">
                                                                        <b>{{ clause.title }}</b>: {{ clause.text }}
                                                                </li>
                                                        </ul>
                                                </div>
                                        </div>
                                        <div v-else-if="analysisType === 'clauses'">
                                                <ul v-if="Array.isArray(props.row.result)">
                                                        <li v-for="(clause, idx) in props.row.result" :key="idx">
                                                                <b>{{ clause.title }}</b>: {{ clause.text }}
                                                        </li>
                                                </ul>
                                                <div v-else>{{ props.row.result.message || JSON.stringify(props.row.result, null, 2) }}</div>
                                        </div>
                                        <div v-else-if="analysisType === 'classify'">
                                                <div><b>Type:</b> {{ props.row.result.type }}</div>
                                                <div><b>Reason:</b> {{ props.row.result.reason }}</div>
                                                <div v-if="props.row.result.message">{{ props.row.result.message }}</div>
                                        </div>
                                        <div v-else>
                                                <pre>{{ props.row.result }}</pre>
                                        </div>
                                </template>
                        </q-table>
                </div>
        </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from '../boot/axios';
import type { QTableColumn } from 'quasar';

const batchMode = ref(false);
const selectedFile = ref<File | null>(null);
const selectedFiles = ref<File[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const result = ref<Record<string, unknown> | null>(null);
const batchResults = ref<Record<string, unknown>[]>([]);

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
        if (batchMode.value) {
                selectedFiles.value = input.files ? Array.from(input.files) : [];
        } else {
                selectedFile.value = input.files && input.files[0] ? input.files[0] : null;
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
                let aiResp: { data: Record<string, unknown> };
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
        } catch (e: unknown) {
                error.value = e instanceof Error ? e.message : 'Analysis failed';
        } finally {
                isLoading.value = false;
        }
}

async function analyzeBatch() {
        error.value = null;
        batchResults.value = [];
        if (!selectedFiles.value.length) return;
        isLoading.value = true;
        try {
                // Step 1: OCR extract text for all files
                const texts: string[] = [];
                for (const file of selectedFiles.value) {
                        const formData = new FormData();
                        formData.append('file', file);
                        const ocrResp = await api.post('/ocr/extract', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        const text = typeof ocrResp.data === 'string' ? ocrResp.data : ocrResp.data.text || ocrResp.data;
                        texts.push(text);
                }
                // Step 2: AI batch analysis
                let aiResp: { data: Record<string, unknown>[] };
                if (analysisType.value === 'metadata') {
                        aiResp = await api.post('/ai/metadata/batch', { texts, provider: provider.value, language: language.value });
                        batchResults.value = aiResp.data;
                } else if (analysisType.value === 'clauses') {
                        aiResp = await api.post('/ai/clauses/batch', { texts, provider: provider.value, language: language.value });
                        batchResults.value = aiResp.data;
                } else if (analysisType.value === 'classify') {
                        aiResp = await api.post('/ai/classify/batch', { texts, provider: provider.value, language: language.value });
                        batchResults.value = aiResp.data;
                }
        } catch (e: unknown) {
                error.value = e instanceof Error ? e.message : 'Batch analysis failed';
        } finally {
                isLoading.value = false;
        }
}

interface BatchTableRow {
        name: string;
        result: Record<string, unknown>;
}

const batchTableColumns: QTableColumn[] = [
        { name: 'name', label: 'File Name', field: 'name', align: 'left' as const },
        { name: 'result', label: 'Result', field: 'result', align: 'left' as const },
];

const batchTableRows = computed<BatchTableRow[]>(() => {
        return selectedFiles.value.map((file, idx) => ({
                name: file.name,
                result: batchResults.value[idx] || {},
        }));
});

function getDates(val: unknown): string[] {
        return Array.isArray(val) ? (val as string[]) : [];
}
function getSignatories(val: unknown): string[] {
        return Array.isArray(val) ? (val as string[]) : [];
}
function getClauses(val: unknown): { title: string; text: string }[] {
        return Array.isArray(val) ? (val as { title: string; text: string }[]) : [];
}
</script>