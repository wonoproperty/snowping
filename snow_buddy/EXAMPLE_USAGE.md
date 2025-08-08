# Example Usage - SnowPing Components

This file shows how to integrate the new UI components with your existing app logic.

## Main App Structure

```tsx
import { useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { JoinCard } from './components/JoinCard';
import { MapChrome } from './components/MapChrome';
import { ActionBar } from './components/ActionBar';
import { RosterDrawer } from './components/RosterDrawer';
import { CompassPanel } from './components/CompassPanel';
import { Toast } from './components/Toast';

function App() {
  // Your existing state
  const [groupCode, setGroupCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [isPinging, setIsPinging] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [compassOpen, setCompassOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Your existing handlers (keep your logic, just wire to new UI)
  const handleJoinGroup = (code, username) => {
    // Your existing join logic here
    setGroupCode(code);
    setIsConnected(true);
  };

  const handlePingLocation = () => {
    // Your existing ping logic here
    setIsPinging(true);
    // ... existing ping code ...
    setIsPinging(false);
  };

  const handleSOS = () => {
    // Your existing SOS logic here
    setToast({
      type: 'danger',
      title: 'SOS Sent!',
      message: 'Emergency alert sent to all group members'
    });
  };

  const handleSelectMember = (member) => {
    // Your existing member selection logic
    setCompassOpen(true);
  };

  // Show join screen if not connected
  if (!isConnected) {
    return (
      <JoinCard 
        onJoinGroup={handleJoinGroup}
        isConnecting={false}
      />
    );
  }

  // Main app with map
  return (
    <>
      {/* Header */}
      <HeaderBar 
        groupCode={groupCode}
        isConnected={isConnected}
      />

      {/* Map container */}
      <MapChrome>
        {/* Your existing map component */}
        <YourMapComponent />
      </MapChrome>

      {/* Action buttons */}
      <ActionBar
        onPingLocation={handlePingLocation}
        onToggleRoster={() => setRosterOpen(!rosterOpen)}
        onSOS={handleSOS}
        isPinging={isPinging}
        rosterOpen={rosterOpen}
        memberCount={members.length}
      />

      {/* Roster drawer */}
      <RosterDrawer
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        members={members}
        currentUserId="your-user-id"
        onSelectMember={handleSelectMember}
        onFocusMember={(member) => {
          // Focus map on member location
        }}
      />

      {/* Compass panel */}
      <CompassPanel
        isOpen={compassOpen}
        onClose={() => setCompassOpen(false)}
        targetName="Friend Name"
        bearing={45}
        distance={250}
        accuracy={5}
        lastUpdate={Date.now()}
      />

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
```

## Component Props Reference

### HeaderBar
```tsx
interface HeaderBarProps {
  groupCode?: string;        // Current group code to display
  isConnected?: boolean;     // Show connection status
}
```

### JoinCard
```tsx
interface JoinCardProps {
  onJoinGroup: (groupCode: string, username: string) => void;
  isConnecting?: boolean;    // Show loading state
}
```

### ActionBar
```tsx
interface ActionBarProps {
  onPingLocation: () => void;
  onToggleRoster: () => void;
  onSOS: () => void;
  isPinging?: boolean;       // Show ping loading state
  rosterOpen?: boolean;      // Highlight roster button
  memberCount?: number;      // Show member count badge
}
```

### RosterDrawer
```tsx
interface Member {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: number;          // Timestamp
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface RosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUserId?: string;
  onSelectMember: (member: Member) => void;
  onFocusMember?: (member: Member) => void;  // Focus on map
}
```

### CompassPanel
```tsx
interface CompassPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;       // Name of target person
  bearing?: number;          // 0-360 degrees
  distance?: number;         // Distance in meters
  accuracy?: number;         // GPS accuracy in meters
  lastUpdate?: number;       // Timestamp of last update
}
```

### Toast
```tsx
interface ToastProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: boolean;        // Default: true
  duration?: number;         // Default: 4000ms
}
```

## Migration Tips

1. **Keep your existing logic** - Only replace the UI components
2. **Wire existing state** - Connect your current state variables to the new component props
3. **Preserve handlers** - Keep your existing event handlers, just call them from the new UI
4. **Test incrementally** - Replace one component at a time
5. **Use existing data structures** - The components are designed to work with typical member/location objects

## Responsive Behavior

- **Mobile**: Bottom action bar, slide-up roster drawer
- **Desktop**: Side action bar, side roster panel
- **All sizes**: Floating header, centered modals

The components automatically adapt based on screen size using Tailwind's responsive prefixes.