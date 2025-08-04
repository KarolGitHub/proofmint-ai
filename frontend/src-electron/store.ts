import Store from 'electron-store';

export const store = new Store({
  name: 'proofmint-ai-config',
  defaults: {
    // App settings
    theme: 'auto',
    language: 'en',
    autoUpdate: true,

    // Wallet settings
    lastConnectedWallet: null,
    walletPreferences: {},

    // Document settings
    defaultStorageType: 'public', // 'public' or 'encrypted'
    encryptionKey: null,

    // UI settings
    sidebarCollapsed: false,
    notifications: true,

    // API settings
    backendUrl: 'http://localhost:3001',
    ipfsGateway: 'https://ipfs.io/ipfs/',

    // Development settings
    devMode: false,
    debugLogs: false,
  },
  encryptionKey: 'your-encryption-key-here', // Change this in production
  clearInvalidConfig: true,
  accessPropertiesByDotNotation: true,
});

// Helper functions for type-safe access
export const getStoreValue = <T>(key: string, defaultValue?: T): T => {
  return store.get(key, defaultValue) as T;
};

export const setStoreValue = <T>(key: string, value: T): void => {
  store.set(key, value);
};

export const deleteStoreValue = (key: string): void => {
  store.delete(key);
};

export const hasStoreValue = (key: string): boolean => {
  return store.has(key);
};

export const getAllStoreValues = (): Record<string, any> => {
  return store.store;
};

export const clearStore = (): void => {
  store.clear();
};

// Specific getters and setters for common use cases
export const getAppSettings = () => ({
  theme: getStoreValue<string>('theme', 'auto'),
  language: getStoreValue<string>('language', 'en'),
  autoUpdate: getStoreValue<boolean>('autoUpdate', true),
  sidebarCollapsed: getStoreValue<boolean>('sidebarCollapsed', false),
  notifications: getStoreValue<boolean>('notifications', true),
  devMode: getStoreValue<boolean>('devMode', false),
  debugLogs: getStoreValue<boolean>('debugLogs', false),
});

export const setAppSettings = (settings: Partial<ReturnType<typeof getAppSettings>>) => {
  Object.entries(settings).forEach(([key, value]) => {
    setStoreValue(key, value);
  });
};

export const getWalletSettings = () => ({
  lastConnectedWallet: getStoreValue<string | null>('lastConnectedWallet', null),
  walletPreferences: getStoreValue<Record<string, any>>('walletPreferences', {}),
});

export const setWalletSettings = (settings: Partial<ReturnType<typeof getWalletSettings>>) => {
  Object.entries(settings).forEach(([key, value]) => {
    setStoreValue(key, value);
  });
};

export const getDocumentSettings = () => ({
  defaultStorageType: getStoreValue<'public' | 'encrypted'>('defaultStorageType', 'public'),
  encryptionKey: getStoreValue<string | null>('encryptionKey', null),
});

export const setDocumentSettings = (settings: Partial<ReturnType<typeof getDocumentSettings>>) => {
  Object.entries(settings).forEach(([key, value]) => {
    setStoreValue(key, value);
  });
};

export const getAPISettings = () => ({
  backendUrl: getStoreValue<string>('backendUrl', 'http://localhost:3001'),
  ipfsGateway: getStoreValue<string>('ipfsGateway', 'https://ipfs.io/ipfs/'),
});

export const setAPISettings = (settings: Partial<ReturnType<typeof getAPISettings>>) => {
  Object.entries(settings).forEach(([key, value]) => {
    setStoreValue(key, value);
  });
};
