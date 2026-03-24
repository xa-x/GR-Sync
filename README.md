# GR Sync

Sync photos and videos from your Ricoh GR camera to your phone.

## Features

- 📶 **WiFi Scanning** - Automatically detect nearby Ricoh GR cameras
- 📷 **Easy Connection** - One-tap connect to your camera
- 🖼️ **Browse Library** - Preview thumbnails before importing
- ⬇️ **Batch Import** - Select multiple items and import at once
- 🎬 **Videos Too** - Supports both photos and videos
- 🌙 **Clean Dark UI** - Minimal, native-feeling interface

## Tech Stack

- **Expo** (React Native) + Expo Router
- **TypeScript**
- **Uniwind** (Tailwind CSS for React Native)
- **expo-image** for fast image loading
- **expo-video** for video playback
- **react-native-wifi-reborn** for WiFi camera detection
- **expo-media-library** for saving to device

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS device (for testing) or Android device
- Ricoh GR camera with WiFi enabled

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run on iOS
bun run ios

# Run on Android
bun run android
```

### Development Build

This app requires a development build (not Expo Go) due to native WiFi modules.

```bash
# Install expo-dev-client
bun add expo-dev-client

# Create development build
eas build --profile development --platform ios
```

## Project Structure

```
gr-sync/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Native tab bar
│   │   ├── index.tsx      # Connect screen
│   │   ├── browse.tsx     # Camera library
│   │   └── import.tsx     # Import progress
│   ├── _layout.tsx        # Root layout
│   └── settings.tsx       # Settings
├── components/            # Reusable components
├── context/
│   └── CameraContext.tsx  # Global state
├── lib/
│   ├── camera/
│   │   └── ricohGR.ts     # Ricoh GR service
│   ├── wifi/
│   │   └── service.ts     # WiFi scanning/connection
│   └── transfer/
│       └── importService.ts # Media import
└── types/
    └── index.ts           # TypeScript types
```

## How It Works

1. **Scan** - App scans for WiFi networks with "RICOH GR" in the name
2. **Connect** - Select your camera to connect via WiFi
3. **Browse** - View thumbnails from camera's library
4. **Import** - Select items and save to your phone

## Ricoh GR Setup

1. Enable WiFi on your Ricoh GR camera
2. Go to camera's WiFi settings
3. Select "Send to Smartphone" mode
4. Camera creates a WiFi hotspot (e.g., "GR III")
5. Open GR Sync and connect

## Permissions

- **Location** - Required for WiFi scanning (Android)
- **Photos** - Required to save imported media
- **Local Network** - Required for camera communication (iOS)

## Development Status

- [x] WiFi scanning for cameras
- [x] Camera connection flow
- [x] Browse library UI
- [x] Import with progress
- [x] Native tab navigation
- [ ] Real Ricoh GR API integration
- [ ] Bluetooth fallback
- [ ] Settings persistence
- [ ] Background transfers

## License

MIT
