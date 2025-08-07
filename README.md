# ❄️ SnowPing - Group Location Tracker PWA

A modern Progressive Web App for group location coordination, built with React and Supabase.

## 🚀 Features

- **Group-based tracking**: Join groups using unique codes
- **Real-time location sharing**: Share your location with group members
- **Multiple ping types**: 
  - 📍 "I'm here" - Mark your current location
  - 🤝 "Meet me" - Request meetup with custom message
  - 🆘 "SOS" - Emergency location ping
- **Offline support**: Pings saved locally and synced when online
- **Progressive Web App**: Install on mobile devices
- **Responsive design**: Works on all screen sizes

## 🛠️ Tech Stack

- **Frontend**: React 18, Leaflet Maps
- **Backend**: Supabase
- **Styling**: CSS3 with modern gradients and animations
- **PWA**: Service Worker, Web App Manifest

## 📱 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone or extract the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view in browser

### Building for Production

```bash
npm run build
npm run serve
```

## 🎯 Usage

1. **Join a Group**: Enter a group code (e.g., "SNOW2024")
2. **Share Location**: Use the ping buttons to share your location
3. **View Group**: See all group members' locations on the map
4. **Leave Group**: Click the × button to leave and join another group

## 🔧 Database Schema

The app expects a Supabase table named `pings` with columns:
- `id` (uuid, primary key)
- `type` (text) - ping type: 'here', 'meet', 'sos'
- `latitude` (real) - GPS latitude
- `longitude` (real) - GPS longitude
- `message` (text) - optional message for 'meet' pings
- `group_code` (text) - group identifier
- `timestamp` (timestamp) - when ping was created

## 🚀 Deployment

This app can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## 🔒 Security

- Uses Supabase Row Level Security (RLS)
- No sensitive data stored in localStorage
- Group codes provide access control

## 📄 License

MIT License - feel free to use for your projects!