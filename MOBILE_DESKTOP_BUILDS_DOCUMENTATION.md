# Mobile & Desktop Builds Documentation

## Overview

ProofMintAI now supports building native applications for multiple platforms:

- **Desktop Applications**: Windows, macOS, and Linux using Electron
- **Mobile Applications**: Android and iOS using Capacitor

This documentation covers the complete build system, configuration, and deployment process.

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Desktop Builds (Electron)](#desktop-builds-electron)
4. [Mobile Builds (Capacitor)](#mobile-builds-capacitor)
5. [Build Scripts](#build-scripts)
6. [Configuration](#configuration)
7. [Development Workflow](#development-workflow)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Platform-Specific Notes](#platform-specific-notes)

## Features

### Desktop (Electron)
- ✅ Cross-platform desktop applications
- ✅ Auto-updater integration
- ✅ Native system integration
- ✅ Persistent storage
- ✅ File system access
- ✅ System notifications
- ✅ Menu and tray integration
- ✅ Hardware acceleration
- ✅ Offline capability

### Mobile (Capacitor)
- ✅ Native Android and iOS apps
- ✅ Device API access (camera, GPS, etc.)
- ✅ Push notifications
- ✅ Native UI components
- ✅ Offline storage
- ✅ Background processing
- ✅ App store deployment ready
- ✅ Deep linking support

## Prerequisites

### For Desktop Builds
```bash
# Node.js 18+ and npm
node --version
npm --version

# Install dependencies
npm install
```

### For Mobile Builds
```bash
# Android Development
- Android Studio
- Android SDK (API 33+)
- Java Development Kit (JDK 11+)
- Gradle

# iOS Development (macOS only)
- Xcode 14+
- iOS SDK 16+
- CocoaPods
```

## Desktop Builds (Electron)

### Architecture

```
src-electron/
├── electron-main.ts      # Main process
├── electron-preload.ts   # Preload script
├── update.ts            # Auto-updater
└── store.ts             # Persistent storage
```

### Key Features

#### 1. Main Process (`electron-main.ts`)
- Window management
- IPC communication
- Auto-updater integration
- System integration

#### 2. Preload Script (`electron-preload.ts`)
- Secure API exposure
- Context bridge setup
- Loading animations

#### 3. Auto-Updater (`update.ts`)
- Automatic update checks
- Download progress tracking
- Installation management

#### 4. Persistent Storage (`store.ts`)
- Configuration management
- User preferences
- Secure data storage

### Build Commands

```bash
# Development
npm run electron:dev

# Production build
npm run electron:build

# Platform-specific builds
npm run desktop:build:win    # Windows
npm run desktop:build:mac    # macOS
npm run desktop:build:linux  # Linux

# Packaging
npm run electron:pack
npm run electron:dist
```

### Configuration

The Electron configuration is in `quasar.config.ts`:

```typescript
electron: {
  preloadScripts: ['electron-preload'],
  inspectPort: 5858,
  bundler: 'packager',
  packager: {
    // Packaging options
  },
  builder: {
    appId: 'proofmint-ai',
    // Build configuration
  }
}
```

## Mobile Builds (Capacitor)

### Architecture

```
src-capacitor/
└── capacitor.config.ts    # Capacitor configuration
```

### Key Features

#### 1. Native Device Access
- Camera and photo library
- GPS and location services
- File system access
- Device information
- Network status

#### 2. Native UI Components
- Splash screen
- Status bar
- Keyboard handling
- Notifications
- Action sheets

#### 3. Platform Integration
- Deep linking
- App lifecycle management
- Background processing
- Push notifications

### Build Commands

```bash
# Development
npm run capacitor:dev

# Build and sync
npm run capacitor:build
npm run capacitor:sync

# Run on device/emulator
npm run capacitor:run:android
npm run capacitor:run:ios

# Open native IDEs
npm run capacitor:open:android
npm run capacitor:open:ios

# Production builds
npm run mobile:build:android
npm run mobile:build:ios
```

### Configuration

Capacitor configuration in `src-capacitor/capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.proofmint.ai',
  appName: 'ProofMintAI',
  webDir: 'dist',
  plugins: {
    SplashScreen: { /* ... */ },
    StatusBar: { /* ... */ },
    // ... other plugins
  }
};
```

## Build Scripts

### Available Scripts

```json
{
  "scripts": {
    // Web builds
    "dev": "quasar dev",
    "build": "quasar build",
    
    // Electron (Desktop)
    "electron:dev": "quasar dev -m electron",
    "electron:build": "quasar build -m electron",
    "electron:pack": "quasar build -m electron --packaging",
    "electron:dist": "quasar build -m electron --dist",
    "desktop:build:win": "quasar build -m electron --target win",
    "desktop:build:mac": "quasar build -m electron --target mac",
    "desktop:build:linux": "quasar build -m electron --target linux",
    
    // Capacitor (Mobile)
    "capacitor:dev": "quasar dev -m capacitor",
    "capacitor:build": "quasar build -m capacitor",
    "capacitor:sync": "quasar build -m capacitor && npx cap sync",
    "capacitor:run:android": "quasar build -m capacitor && npx cap run android",
    "capacitor:run:ios": "quasar build -m capacitor && npx cap run ios",
    "capacitor:open:android": "npx cap open android",
    "capacitor:open:ios": "npx cap open ios",
    "mobile:build:android": "quasar build -m capacitor && npx cap build android",
    "mobile:build:ios": "quasar build -m capacitor && npx cap build ios",
    
    // All platforms
    "build:all": "npm run build && npm run electron:build && npm run capacitor:build"
  }
}
```

## Configuration

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
VITE_API_URL=http://localhost:3001
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/

# .env.production
VITE_API_URL=https://api.proofmint.ai
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Platform-Specific Configuration

#### Electron Configuration
```typescript
// quasar.config.ts
electron: {
  packager: {
    // Windows
    win32metadata: {
      CompanyName: 'ProofMintAI',
      FileDescription: 'AI-Powered Document Verification',
      ProductName: 'ProofMintAI'
    },
    // macOS
    appBundleId: 'com.proofmint.ai',
    appCategoryType: 'public.app-category.productivity',
    // Linux
    executableName: 'proofmint-ai'
  }
}
```

#### Capacitor Configuration
```typescript
// src-capacitor/capacitor.config.ts
ios: {
  contentInset: 'automatic',
  backgroundColor: '#282c34',
  scheme: 'proofmintai'
},
android: {
  backgroundColor: '#282c34',
  allowMixedContent: true,
  scheme: 'proofmintai'
}
```

## Development Workflow

### 1. Web Development
```bash
# Start web development server
npm run dev
```

### 2. Desktop Development
```bash
# Start Electron development
npm run electron:dev
```

### 3. Mobile Development
```bash
# Start Capacitor development
npm run capacitor:dev

# Sync changes to native projects
npm run capacitor:sync

# Run on device/emulator
npm run capacitor:run:android
npm run capacitor:run:ios
```

### 4. Testing

#### Desktop Testing
```bash
# Build for testing
npm run electron:build

# Test on different platforms
npm run desktop:build:win
npm run desktop:build:mac
npm run desktop:build:linux
```

#### Mobile Testing
```bash
# Build for testing
npm run mobile:build:android
npm run mobile:build:ios

# Test on devices
npm run capacitor:run:android
npm run capacitor:run:ios
```

## Deployment

### Desktop Deployment

#### 1. Windows
```bash
# Build Windows installer
npm run desktop:build:win

# Output: dist-electron/win-unpacked/
# Installer: dist-electron/ProofMintAI Setup.exe
```

#### 2. macOS
```bash
# Build macOS app
npm run desktop:build:mac

# Output: dist-electron/mac/
# App: dist-electron/mac/ProofMintAI.app
```

#### 3. Linux
```bash
# Build Linux app
npm run desktop:build:linux

# Output: dist-electron/linux-unpacked/
# AppImage: dist-electron/ProofMintAI.AppImage
```

### Mobile Deployment

#### 1. Android
```bash
# Build APK
npm run mobile:build:android

# Output: android/app/build/outputs/apk/
# Files: app-debug.apk, app-release.apk
```

#### 2. iOS
```bash
# Build iOS app
npm run mobile:build:ios

# Output: ios/App/build/
# App: ios/App/build/App.app
```

### App Store Deployment

#### Android (Google Play Store)
1. Build release APK/AAB
2. Sign with release keystore
3. Upload to Google Play Console
4. Submit for review

#### iOS (App Store)
1. Build release IPA
2. Archive in Xcode
3. Upload to App Store Connect
4. Submit for review

## Troubleshooting

### Common Issues

#### Electron Issues
```bash
# Clear Electron cache
rm -rf node_modules/.cache
rm -rf dist-electron

# Reinstall dependencies
npm install

# Check Electron version
npx electron --version
```

#### Capacitor Issues
```bash
# Clear Capacitor cache
npx cap clean

# Reinstall plugins
npx cap sync

# Check Capacitor version
npx cap --version
```

#### Build Issues
```bash
# Clear all caches
npm run clean
rm -rf node_modules
npm install

# Rebuild
npm run build:all
```

### Platform-Specific Issues

#### Windows
- Ensure Windows Build Tools are installed
- Check antivirus exclusions
- Verify Node.js version compatibility

#### macOS
- Ensure Xcode Command Line Tools are installed
- Check code signing certificates
- Verify macOS version compatibility

#### Linux
- Install required system dependencies
- Check display server compatibility
- Verify library dependencies

#### Android
- Ensure Android SDK is properly configured
- Check JAVA_HOME environment variable
- Verify Gradle version compatibility

#### iOS
- Ensure Xcode is properly installed
- Check iOS deployment target
- Verify code signing setup

## Platform-Specific Notes

### Desktop Platforms

#### Windows
- **Minimum**: Windows 10 (64-bit)
- **Architecture**: x64
- **Dependencies**: Visual C++ Redistributable
- **Installation**: MSI or EXE installer

#### macOS
- **Minimum**: macOS 10.15 (Catalina)
- **Architecture**: x64, ARM64 (Apple Silicon)
- **Dependencies**: None (self-contained)
- **Installation**: DMG or PKG installer

#### Linux
- **Minimum**: Ubuntu 18.04, CentOS 7
- **Architecture**: x64
- **Dependencies**: glibc 2.17+
- **Installation**: AppImage, Snap, or DEB/RPM

### Mobile Platforms

#### Android
- **Minimum**: Android 6.0 (API 23)
- **Target**: Android 13 (API 33)
- **Architecture**: ARM64, x86_64
- **Permissions**: Camera, Storage, Network

#### iOS
- **Minimum**: iOS 13.0
- **Target**: iOS 16.0
- **Architecture**: ARM64
- **Permissions**: Camera, Photo Library, Location

### Performance Considerations

#### Desktop
- **Memory**: 512MB minimum, 2GB recommended
- **Storage**: 100MB for app, 1GB for data
- **CPU**: Dual-core minimum
- **GPU**: Hardware acceleration recommended

#### Mobile
- **Memory**: 2GB minimum, 4GB recommended
- **Storage**: 50MB for app, 500MB for data
- **CPU**: Modern ARM processor
- **Battery**: Optimized for mobile usage

### Security Considerations

#### Desktop
- Code signing for all platforms
- Auto-updater with signature verification
- Secure storage for sensitive data
- Network security for API calls

#### Mobile
- App store code signing
- Certificate pinning for API calls
- Secure storage for user data
- Permission management

## Future Enhancements

### Planned Features
- [ ] Progressive Web App (PWA) support
- [ ] Offline-first architecture
- [ ] Background sync capabilities
- [ ] Advanced notification system
- [ ] Biometric authentication
- [ ] Cloud sync integration
- [ ] Multi-language support
- [ ] Accessibility improvements

### Performance Optimizations
- [ ] Lazy loading for mobile
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Startup time optimization
- [ ] Memory usage optimization

### Developer Experience
- [ ] Hot reload for mobile
- [ ] Debug tools integration
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Documentation generation

## Resources

### Official Documentation
- [Quasar Framework](https://quasar.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

### Community Resources
- [Quasar Community](https://forum.quasar-framework.org/)
- [Electron Community](https://discord.gg/electron)
- [Capacitor Community](https://github.com/ionic-team/capacitor/discussions)

### Development Tools
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) (API testing)

---

This documentation provides a comprehensive guide for building and deploying ProofMintAI across all supported platforms. For specific issues or questions, please refer to the troubleshooting section or consult the official documentation. 