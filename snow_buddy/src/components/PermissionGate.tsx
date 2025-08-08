import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Snowflake, CheckCircle, XCircle, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 text-center shadow-2xl shadow-black/40">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-3xl shadow-lg shadow-sky-500/25">
            <Snowflake className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">SnowPing</h1>
        <p className="text-slate-300 mb-8 leading-relaxed">
          Track your friends on the slopes in real-time. We need access to your location and device orientation to show you where they are and point you in the right direction.
        </p>

        <div className="space-y-4">
          {/* Location Permission */}
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-sky-400/20 rounded-xl flex items-center justify-center mr-3">
                  <MapPin className="w-5 h-5 text-sky-400" />
                </div>
                <span className="font-semibold text-white">Location Access</span>
              </div>
              <PermissionStatus status={permissions.location} />
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Share your location with friends in your group so they can find you
            </p>
            {permissions.location !== 'granted' && (
              <button
                onClick={requestLocationPermission}
                disabled={isRequestingLocation || permissions.location === 'denied'}
                className="w-full btn-primary py-3 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:bg-slate-600"
              >
                {isRequestingLocation ? 'Requesting...' : 
                 permissions.location === 'denied' ? 'Permission Denied' : 'Enable Location'}
              </button>
            )}
          </div>

          {/* Compass/Orientation Permission */}
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-400/20 rounded-xl flex items-center justify-center mr-3">
                  <Compass className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-semibold text-white">Compass Access</span>
              </div>
              <PermissionStatus status={permissions.deviceOrientation} />
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Use your device's compass to point you toward your friends
            </p>
            {permissions.deviceOrientation !== 'granted' && (
              <button
                onClick={requestOrientationPermission}
                disabled={isRequestingOrientation || permissions.deviceOrientation === 'denied'}
                className="w-full btn-meet py-3 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:hover:bg-slate-600"
              >
                {isRequestingOrientation ? 'Requesting...' : 
                 permissions.deviceOrientation === 'denied' ? 'Permission Denied' : 'Enable Compass'}
              </button>
            )}
          </div>
        </div>

        {(permissions.location === 'denied' || permissions.deviceOrientation === 'denied') && (
          <div className="mt-6 glass-dark rounded-2xl p-4 border border-yellow-400/30">
            <p className="text-sm text-yellow-300">
              If you denied permissions, you can enable them in your browser settings or by refreshing the page and trying again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Refresh Page →
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-400">
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
      return (
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium">Granted</span>
        </div>
      );
    case 'denied':
      return (
        <div className="flex items-center space-x-1">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-rose-400 text-sm font-medium">Denied</span>
        </div>
      );
    case 'prompt':
      return (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">Pending</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Unknown</span>
        </div>
      );
  }
}