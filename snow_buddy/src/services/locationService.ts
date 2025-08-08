import type { Location, PermissionState } from '../types';

export class LocationService {
  private watchId: number | null = null;
  private lastBroadcastTime = 0;
  private broadcastInterval = 5000; // 5 seconds
  private isVisible = true;

  constructor() {
    // Track visibility to pause location updates when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (!this.isVisible) {
        this.stopTracking();
      } else if (this.watchId === null) {
        // Restart tracking when tab becomes visible again
        this.startTracking();
      }
    });
  }

  async checkPermissions(): Promise<PermissionState> {
    const permissions: PermissionState = {
      location: 'unknown',
      deviceOrientation: 'unknown',
    };

    // Check location permission
    if ('permissions' in navigator) {
      try {
        const locationPermission = await navigator.permissions.query({ name: 'geolocation' });
        permissions.location = locationPermission.state;
      } catch (error) {
        // Fallback for browsers that don't support permissions API
        permissions.location = 'prompt';
      }
    }

    // Check device orientation permission (iOS)
    if ('DeviceOrientationEvent' in window && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const orientationPermission = (DeviceOrientationEvent as any).requestPermission;
        if (typeof orientationPermission === 'function') {
          permissions.deviceOrientation = 'prompt';
        }
      } catch (error) {
        permissions.deviceOrientation = 'unknown';
      }
    } else {
      // For non-iOS devices, orientation is typically available
      permissions.deviceOrientation = 'granted';
    }

    return permissions;
  }

  async requestLocationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        (error) => {
          console.warn('Location permission denied:', error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  async requestOrientationPermission(): Promise<boolean> {
    // For iOS devices
    if ('DeviceOrientationEvent' in window && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.warn('Orientation permission denied:', error);
        return false;
      }
    }

    // For other devices, assume permission is granted
    return true;
  }

  getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  startTracking(): void {
    if (!navigator.geolocation || this.watchId !== null) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        
        // Location updated - we'll handle broadcasting in the SimplePing component
        // This service is now just for getting location data
      },
      (error) => {
        console.error('Location tracking error:', error);
        this.stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // Use cached position up to 30 seconds
        timeout: 15000,
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  isTracking(): boolean {
    return this.watchId !== null;
  }
}

export const locationService = new LocationService();