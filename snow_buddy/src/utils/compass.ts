import type { Location, CompassData } from '../types';

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the great-circle initial bearing between two points
 * Returns bearing in degrees (0-360, where 0 is North)
 */
export function calculateBearing(from: Location, to: Location): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = toDegrees(Math.atan2(y, x));
  
  // Normalize to 0-360 degrees
  return (bearing + 360) % 360;
}

/**
 * Calculate the haversine distance between two points in meters
 */
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Normalize heading from device orientation
 * iOS: Use webkitCompassHeading (already 0-360 clockwise from north)
 * Others: Use alpha and convert to compass heading
 */
export function normalizeHeading(event: DeviceOrientationEvent): number {
  // iOS devices provide webkitCompassHeading
  if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
    return (event as any).webkitCompassHeading;
  }
  
  // Other devices use alpha (0-360 counter-clockwise from north)
  if (event.alpha !== null) {
    // Convert to clockwise from north
    return (360 - event.alpha) % 360;
  }
  
  return 0;
}

/**
 * Calculate the relative angle to rotate the compass arrow
 * This is the angle between the bearing to the target and the device heading
 */
export function calculateRelativeAngle(bearing: number, heading: number): number {
  return (bearing - heading + 360) % 360;
}

/**
 * Apply a simple moving average to reduce jitter in heading values
 */
export class HeadingFilter {
  private readings: number[] = [];
  private maxReadings: number;

  constructor(maxReadings?: number) {
    this.maxReadings = maxReadings ?? 5;
  }

  addReading(heading: number): number {
    this.readings.push(heading);
    
    // Keep only the last N readings
    if (this.readings.length > this.maxReadings) {
      this.readings.shift();
    }

    // Handle circular averaging for compass headings
    return this.getCircularAverage();
  }

  private getCircularAverage(): number {
    if (this.readings.length === 0) return 0;

    // Convert to unit vectors and average
    let x = 0;
    let y = 0;
    
    for (const heading of this.readings) {
      x += Math.cos(toRadians(heading));
      y += Math.sin(toRadians(heading));
    }
    
    x /= this.readings.length;
    y /= this.readings.length;
    
    let averageRadians = Math.atan2(y, x);
    let averageDegrees = toDegrees(averageRadians);
    
    // Normalize to 0-360
    return (averageDegrees + 360) % 360;
  }

  reset(): void {
    this.readings = [];
  }
}

/**
 * Calculate complete compass data for navigation
 */
export function calculateCompassData(
  myLocation: Location,
  targetLocation: Location,
  heading: number
): CompassData {
  const bearing = calculateBearing(myLocation, targetLocation);
  const distance = calculateDistance(myLocation, targetLocation);
  const relativeAngle = calculateRelativeAngle(bearing, heading);

  return {
    bearing,
    distance,
    heading,
    relativeAngle,
  };
}