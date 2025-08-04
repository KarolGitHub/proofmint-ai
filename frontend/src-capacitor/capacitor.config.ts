import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proofmint.ai',
  appName: 'ProofMintAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#282c34',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#282c34',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Device: {
      // Device plugin configuration
    },
    Network: {
      // Network plugin configuration
    },
    Storage: {
      // Storage plugin configuration
    },
    Geolocation: {
      // Geolocation plugin configuration
    },
    Camera: {
      // Camera plugin configuration
    },
    File: {
      // File plugin configuration
    },
    Haptics: {
      // Haptics plugin configuration
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    App: {
      // App plugin configuration
    },
    Browser: {
      // Browser plugin configuration
    },
    Share: {
      // Share plugin configuration
    },
    Toast: {
      // Toast plugin configuration
    },
    ActionSheet: {
      // ActionSheet plugin configuration
    },
    Dialog: {
      // Dialog plugin configuration
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#282c34',
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'proofmintai',
  },
  android: {
    backgroundColor: '#282c34',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    initialFocus: false,
    backgroundColor: '#282c34',
    mixedContentMode: 'compatibility',
    allowFileAccess: true,
    allowContentAccess: true,
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: true,
    scheme: 'proofmintai',
  },
};

export default config;
