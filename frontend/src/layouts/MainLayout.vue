<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          ProofMintAI
        </q-toolbar-title>

        <q-space />
        <q-btn flat round :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode"
          :aria-label="$q.dark.isActive ? 'Switch to light mode' : 'Switch to dark mode'" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        <q-item clickable to="/" exact>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item clickable to="/history">
          <q-item-section avatar><q-icon name="history" /></q-item-section>
          <q-item-section>Document History</q-item-section>
        </q-item>
        <q-item clickable to="/ai-ocr">
          <q-item-section avatar><q-icon name="psychology" /></q-item-section>
          <q-item-section>AI / OCR</q-item-section>
        </q-item>
        <q-item clickable to="/ai-dashboard">
          <q-item-section avatar><q-icon name="analytics" /></q-item-section>
          <q-item-section>AI Dashboard</q-item-section>
        </q-item>
        <q-item clickable to="/ipfs">
          <q-item-section avatar><q-icon name="cloud_upload" /></q-item-section>
          <q-item-section>IPFS Storage</q-item-section>
        </q-item>
        <q-item clickable to="/reputation">
          <q-item-section avatar><q-icon name="emoji_events" /></q-item-section>
          <q-item-section>Reputation & KYC</q-item-section>
        </q-item>
        <q-item clickable to="/zkproof">
          <q-item-section avatar><q-icon name="security" /></q-item-section>
          <q-item-section>ZK Proofs</q-item-section>
        </q-item>
        <q-item clickable to="/settings">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';

const leftDrawerOpen = ref(false);
const { proxy } = getCurrentInstance()!;

const DARK_KEY = 'proofmintai_dark_mode';

onMounted(() => {
  // On first load, set dark mode based on system preference if not set
  const saved = localStorage.getItem(DARK_KEY);
  if (saved === null) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    proxy.$q.dark.set(prefersDark);
    localStorage.setItem(DARK_KEY, prefersDark ? '1' : '0');
  } else {
    proxy.$q.dark.set(saved === '1');
  }
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function toggleDarkMode() {
  proxy.$q.dark.toggle();
  localStorage.setItem(DARK_KEY, proxy.$q.dark.isActive ? '1' : '0');
}
</script>
