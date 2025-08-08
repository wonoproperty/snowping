import React, { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import type { PermissionState } from '../types';

interface PermissionGateProps {
  children: React.ReactNode;
  onPermissionsGranted: () => void;
}

export function PermissionGate({ children, onPermissionsGranted }: PermissionGateProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'unknown',
    deviceOrientation: 'unknown',
  });
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [isRequestingOrientation, setIsRequestingOrientation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    const currentPermissions = await locationService.checkPermissions();
    setPermissions(currentPermissions);
    
    // If both permissions are granted, notify parent
    if (currentPermissions.location === 'granted' && 
        currentPermissions.deviceOrientation === 'granted') {
      onPermissionsGranted();
      setShowExplanation(false);
    }
  };

  const requestLocationPermission = async () => {
    setIsRequestingLocation(true);
    try {
      const granted = await locationService.requestLocationPermission();
      const newPermissions = { ...permissions };
      newPermissions.location = granted ? 'granted' : 'denied';
      setPermissions(newPermissions);
      
      if (granted && newPermissions.deviceOrientation === 'granted') {
        onPermissionsGranted();
        setShowExplanation(false);
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const requestOrientationPermission = async () => {
    setIsRequestingOrientation(true);
    try {
      const granted = await locationService.requestOrientationPermission();
      const newPermissions = { ...permissions };
      newPermissions.deviceOrientation = granted ? 'granted' : 'denied';
      setPermissions(newPermissions);
      
      if (granted && newPermissions.location === 'granted') {
        onPermissionsGranted();
        setShowExplanation(false);
      }
    } finally {
      setIsRequestingOrientation(false);
    }
  };

  if (!showExplanation && permissions.location === 'granted' && permissions.deviceOrientation === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">SnowPing</h1>
        <p className="text-gray-600 mb-8">
          Track your friends on the slopes in real-time. We need access to your location and device orientation to show you where they are and point you in the right direction.
        </p>

        <div className="space-y-4">
          {/* Location Permission */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="font-medium">Location Access</span>
              </div>
              <PermissionStatus status={permissions.location} />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Share your location with friends in your group so they can find you
            </p>
            {permissions.location !== 'granted' && (
              <button
                onClick={requestLocationPermission}
                disabled={isRequestingLocation || permissions.location === 'denied'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isRequestingLocation ? 'Requesting...' : 
                 permissions.location === 'denied' ? 'Permission Denied' : 'Enable Location'}
              </button>
            )}
          </div>

          {/* Compass/Orientation Permission */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10v16l-5-3-5 3V4z" />
                </svg>
                <span className="font-medium">Compass Access</span>
              </div>
              <PermissionStatus status={permissions.deviceOrientation} />
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Use your device's compass to point you toward your friends
            </p>
            {permissions.deviceOrientation !== 'granted' && (
              <button
                onClick={requestOrientationPermission}
                disabled={isRequestingOrientation || permissions.deviceOrientation === 'denied'}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isRequestingOrientation ? 'Requesting...' : 
                 permissions.deviceOrientation === 'denied' ? 'Permission Denied' : 'Enable Compass'}
              </button>
            )}
          </div>
        </div>

        {(permissions.location === 'denied' || permissions.deviceOrientation === 'denied') && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              If you denied permissions, you can enable them in your browser settings or by refreshing the page and trying again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-yellow-700 underline hover:no-underline"
            >
              Refresh Page
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🔒 Your location is only shared with friends in your group and is not stored permanently.
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionStatus({ status }: { status: string }) {
  switch (status) {
    case 'granted':
      return <span className="text-green-600 text-sm font-medium">✓ Granted</span>;
    case 'denied':
      return <span className="text-red-600 text-sm font-medium">✗ Denied</span>;
    case 'prompt':
      return <span className="text-yellow-600 text-sm font-medium">⏳ Pending</span>;
    default:
      return <span className="text-gray-600 text-sm font-medium">? Unknown</span>;
  }
}