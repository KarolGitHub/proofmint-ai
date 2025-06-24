<template>
        <q-page class="flex flex-center column q-gutter-md">
                <div class="text-h5">AI / OCR</div>
                <div class="q-mt-md">Upload a document to extract text and metadata using AI and OCR.</div>
                <input type="file" @change="onFileChange" accept=".pdf,image/*" />
                <q-btn color="primary" label="Analyze Document" class="q-mt-md" :disable="!selectedFile || isLoading"
                        @click="analyze" />
                <q-spinner v-if="isLoading" color="primary" size="2em" class="q-mt-md" />
                <div v-if="error" class="text-negative q-mt-md">{{ error }}</div>
                <div v-if="result" class="q-mt-md bg-grey-2 q-pa-md rounded-borders" style="max-width:600px;">
                        <div class="text-h6">AI / OCR Result</div>
                        <pre class="q-mt-sm" style="white-space:pre-wrap;word-break:break-word;">{{ result }}</pre>
                </div>
        </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const selectedFile = ref<File | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const result = ref<string | null>(null);

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
                const formData = new FormData();
                formData.append('file', selectedFile.value);
                // Adjust the backend URL as needed
                const { data } = await axios.post('/api/ocr/extract', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                });
                result.value = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        } catch (e: any) {
                error.value = e.response?.data?.message || e.message || 'Analysis failed';
        } finally {
                isLoading.value = false;
        }
}
</script>