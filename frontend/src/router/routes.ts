import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'history', component: () => import('pages/HistoryPage.vue') },
      { path: 'ai-ocr', component: () => import('pages/AiOcrPage.vue') },
      { path: 'ipfs', component: () => import('pages/IpfsPage.vue') },
      { path: 'reputation', component: () => import('pages/ReputationPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },

  {
    path: '/gallery',
    component: () => import('pages/ReceiptGallery.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
