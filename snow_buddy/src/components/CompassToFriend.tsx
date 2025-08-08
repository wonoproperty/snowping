import { useState, useEffect, useRef } from 'react';
import { calculateCompassData, HeadingFilter, normalizeHeading, formatDistance } from '../utils/compass';
import { locationService } from '../services/locationService';
import type { Friend, Location, CompassData } from '../types';

interface CompassToFriendProps {
  friend: Friend;
  myLocation?: Location;
  onClose: () => void;
}

export function CompassToFriend({ friend, myLocation, onClose }: CompassToFriendProps) {
  const [compassData, setCompassData] = useState<CompassData | null>(null);
  const [hasOrientationPermission, setHasOrientationPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [orientationSupported, setOrientationSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const headingFilterRef = useRef<HeadingFilter | null>(null);
  
  // Initialize filter on first use
  if (!headingFilterRef.current) {
    headingFilterRef.current = new HeadingFilter();
  }
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    checkOrientationSupport();
  }, []);

  useEffect(() => {
    if (hasOrientationPermission && orientationSupported) {
      startCompass();
    }
    
    return () => {
      stopCompass();
    };
  }, [hasOrientationPermission, orientationSupported, myLocation, friend]);

  const checkOrientationSupport = () => {
    if ('DeviceOrientationEvent' in window) {
      setOrientationSupported(true);
      
      // For iOS, check if permission is needed
      if ('requestPermission' in DeviceOrientationEvent) {
        // iOS - permission needed
        setHasOrientationPermission(false);
      } else {
        // Android/other devices - no permission needed
        setHasOrientationPermission(true);
      }
    } else {
      setOrientationSupported(false);
      setError('Device orientation not supported on this device');
    }
  };

  const requestOrientationPermission = async () => {
    setIsRequestingPermission(true);
    setError(null);
    
    try {
      const granted = await locationService.requestOrientationPermission();
      setHasOrientationPermission(granted);
      
      if (!granted) {
        setError('Orientation permission denied. Please enable in browser settings.');
      }
    } catch (err) {
      setError('Failed to request orientation permission');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const startCompass = () => {
    if (!myLocation || !friend.location) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const rawHeading = normalizeHeading(event);
      const smoothedHeading = headingFilterRef.current?.addReading(rawHeading) || rawHeading;
      
      const data = calculateCompassData(myLocation, friend.location!, smoothedHeading);
      setCompassData(data);
    };

    // Add orientation event listener
    window.addEventListener('deviceorientation', handleOrientation);
    
    // Fallback for browsers without orientation support
    if (!orientationSupported) {
      const fallbackData = calculateCompassData(myLocation, friend.location!, 0);
      setCompassData(fallbackData);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  const stopCompass = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    headingFilterRef.current?.reset();
  };

  if (!myLocation) {
    return (
      <CompassContainer onClose={onClose} friend={friend}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Required</h3>
          <p className="text-gray-600 text-sm">
            We need your location to show direction to {friend.username}
          </p>
        </div>
      </CompassContainer>
    );
  }

  if (!friend.location) {
    return (
      <CompassContainer onClose={onClose} friend={friend}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{friend.username} Location Unknown</h3>
          <p className="text-gray-600 text-sm">
            Waiting for {friend.username} to share their location
          </p>
        </div>
      </CompassContainer>
    );
  }

  if (error) {
    return (
      <CompassContainer onClose={onClose} friend={friend}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compass Error</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 text-sm underline hover:no-underline"
          >
            Refresh to try again
          </button>
        </div>
      </CompassContainer>
    );
  }

  if (!hasOrientationPermission && orientationSupported) {
    return (
      <CompassContainer onClose={onClose} friend={friend}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Compass</h3>
          <p className="text-gray-600 text-sm mb-6">
            Allow access to your device's compass to point toward {friend.username}
          </p>
          <button
            onClick={requestOrientationPermission}
            disabled={isRequestingPermission}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequestingPermission ? 'Requesting...' : 'Enable Compass'}
          </button>
        </div>
      </CompassContainer>
    );
  }

  return (
    <CompassContainer onClose={onClose} friend={friend}>
      <div className="text-center">
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Compass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full border-4 border-gray-300"></div>
          
          {/* Cardinal directions */}
          <div className="absolute inset-4">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">N</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">S</span>
              </div>
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">E</span>
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">W</span>
              </div>
            </div>
          </div>
          
          {/* Compass arrow */}
          {compassData && (
            <div 
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: `rotate(${compassData.relativeAngle}deg)`
              }}
            >
              <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full"></div>
        </div>

        {/* Distance and bearing info */}
        {compassData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">
                {formatDistance(compassData.distance)}
              </div>
              <div className="text-sm text-gray-600">
                Distance to {friend.username}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(compassData.bearing)}°
                </div>
                <div className="text-xs text-gray-600">Bearing</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(compassData.heading)}°
                </div>
                <div className="text-xs text-gray-600">Your heading</div>
              </div>
            </div>
          </div>
        )}

        {!orientationSupported && compassData && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Compass rotation not available. Arrow shows direction based on your current heading north.
            </p>
          </div>
        )}
      </div>
    </CompassContainer>
  );
}

interface CompassContainerProps {
  children: React.ReactNode;
  onClose: () => void;
  friend: Friend;
}

function CompassContainer({ children, onClose, friend }: CompassContainerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {friend.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Navigate to {friend.username}
                </h2>
                <p className="text-sm text-gray-500">Compass navigation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}