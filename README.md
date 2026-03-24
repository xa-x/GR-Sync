# GR Sync

Sync photos and videos from your Ricoh GR camera to your phone.

## Features

- 📷 Connect via WiFi or Bluetooth
- 🖼️ Browse camera library with thumbnails
- ⬇️ Select and import multiple items
- 🎬 Supports both images and videos
- 🌙 Clean, minimal dark UI

## Tech Stack

- **Expo** (React Native) + Expo Router
- **TypeScript**
- **NativeWind** (Tailwind CSS for React Native)
- **expo-image** for fast image loading
- **expo-video** for video playback
- **expo-media-library** for saving to device

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
gr-sync/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Connect screen
│   ├── library.tsx        # Browse camera library
│   ├── import.tsx         # Import progress
│   └── settings.tsx       # Settings
├── components/            # Reusable UI components
├── hooks/
│   └── useCamera.ts       # Camera connection hook
├── lib/
│   ├── camera/
│   │   └── ricohGR.ts     # Ricoh GR connection logic
│   └── transfer/
│       └── importService.ts # Media import logic
└── types/
    └── index.ts           # TypeScript types
```

## Ricoh GR Connection

The app connects to Ricoh GR cameras using:

1. **WiFi (preferred)** - Camera creates a hotspot at `192.168.0.1`
2. **Bluetooth** - Fallback for devices without WiFi

### How to Connect

1. Enable WiFi on your Ricoh GR camera
2. Connect your phone to the camera's WiFi network
3. Open GR Sync and tap "Connect"
4. Browse and import your photos

## Development Status

- [x] Project scaffold
- [x] UI screens (Connect, Library, Import, Settings)
- [x] Camera connection logic (WiFi)
- [x] Import service
- [ ] Real Ricoh GR API integration (needs testing with real camera)
- [ ] Bluetooth connection
- [ ] Settings persistence

## Notes

The app currently uses mock data for UI development. To integrate with a real Ricoh GR camera, you'll need to:

1. Reverse-engineer or find documentation for the Ricoh GR HTTP API
2. Update `lib/camera/ricohGR.ts` with actual endpoints
3. Test connection and file transfer with a real camera
