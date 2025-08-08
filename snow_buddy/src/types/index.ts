export interface User {
  id: string;
  username: string;
  groupCode: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Friend {
  id: string;
  username: string;
  location?: Location;
  lastSeen: number;
  isOnline: boolean;
}

export interface CompassData {
  bearing: number;
  distance: number;
  heading: number;
  relativeAngle: number;
}

export interface PermissionState {
  location: 'granted' | 'denied' | 'prompt' | 'unknown';
  deviceOrientation: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export interface GroupState {
  code: string;
  username: string;
  isJoined: boolean;
}

export interface BroadcastMessage {
  type: 'location_update';
  user_id: string;
  username: string;
  location: Location;
}

export interface PresenceState {
  user_id: string;
  username: string;
  last_seen: string;
}