# SnowPing - Real-time Location Tracker

A Progressive Web App (PWA) for tracking friends in real-time on the slopes with compass navigation. Built with React, TypeScript, Supabase, and Leaflet.

## Features

- 🗺️ **Real-time Location Sharing** - See friends' locations update every ~5 seconds
- 🧭 **Compass Navigation** - Point-to-friend compass with bearing and distance
- 👥 **Group-based Tracking** - Join groups with simple codes, no accounts needed
- 📱 **Mobile PWA** - Install on your phone, works offline-capable
- 🔋 **Battery Optimized** - Pauses tracking when tab is hidden
- 🔒 **Privacy First** - No persistent location storage, real-time only
- 🏔️ **Mountain Ready** - Designed for ski slopes and outdoor use

## Setup

### 1. Environment Variables

Create a `.env` file with your Supabase credentials:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Configuration

This app uses Supabase Realtime Channels for location broadcasting and presence tracking. No database tables are required - everything happens in real-time channels.

### 3. Install and Run

```bash
npm install
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy - the PWA will be available with HTTPS (required for geolocation)

The app includes a `vercel.json` configuration for proper PWA deployment.

## Usage

1. **Grant Permissions** - Allow location access and device orientation (iOS)
2. **Join/Create Group** - Enter a group code or generate a new one
3. **Share Code** - Give the group code to friends so they can join
4. **Track Friends** - Switch between roster and map views
5. **Navigate** - Tap a friend to open compass navigation

## Technical Details

### Core Components

- `<PermissionGate />` - Handles location and orientation permissions
- `<GroupJoin />` - Group code entry and creation
- `<OnlineRoster />` - Friend list with online status
- `<MapView />` - Interactive map with Leaflet
- `<CompassToFriend />` - Compass navigation with iOS/Android support

### Key Features

- **Great-circle bearing calculation** for accurate compass direction
- **Haversine distance calculation** with m/km display
- **iOS compass support** with `webkitCompassHeading`
- **Android orientation** with alpha angle conversion
- **Presence tracking** with 15-second online timeout
- **Battery optimization** with 5-second broadcast throttling

### Browser Compatibility

- **Location Services**: Requires HTTPS, modern browsers
- **Device Orientation**: iOS 13+ requires permission, Android works automatically
- **PWA Installation**: Chrome, Safari, Edge, Firefox

## File Structure

```
src/
├── components/
│   ├── CompassToFriend.tsx    # Compass navigation
│   ├── GroupJoin.tsx          # Group joining interface
│   ├── MapView.tsx            # Leaflet map component
│   ├── OnlineRoster.tsx       # Friends list
│   └── PermissionGate.tsx     # Permission handling
├── services/
│   ├── locationService.ts     # Geolocation and permissions
│   └── supabase.ts           # Realtime channels
├── utils/
│   └── compass.ts            # Bearing and distance calculations
├── types/
│   └── index.ts              # TypeScript definitions
└── App.tsx                   # Main application
```
