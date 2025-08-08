import { X, Navigation, MapPin, Clock } from 'lucide-react';

interface CompassPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;
  bearing?: number;
  distance?: number;
  accuracy?: number;
  lastUpdate?: number;
}

export function CompassPanel({ 
  isOpen, 
  onClose, 
  targetName = 'Friend',
  bearing = 0,
  distance = 0,
  accuracy,
  lastUpdate 
}: CompassPanelProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1m ago';
    return `${minutes}m ago`;
  };

  const getCardinalDirection = (bearing: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((bearing % 360) / 45) % 8;
    return directions[index];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Navigate to
              </h2>
              <p className="text-lg text-sky-400 font-medium">
                {targetName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              title="Close compass"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Compass */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Compass circle */}
              <div className="absolute inset-0 rounded-full border-4 border-white/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                {/* Cardinal directions */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white">N</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">E</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white">S</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">W</div>
              </div>
              
              {/* Arrow */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${bearing}deg)` }}
              >
                <div className="relative">
                  <Navigation className="w-8 h-8 text-emerald-400 drop-shadow-lg" fill="currentColor" />
                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-emerald-400/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Direction and bearing */}
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-white mb-1">
                {getCardinalDirection(bearing)}
              </div>
              <div className="text-sm text-slate-400 font-mono">
                {Math.round(bearing)}°
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {/* Distance */}
            <div className="glass-dark rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-400/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 font-medium">Distance</div>
                    <div className="text-xl font-bold text-white">
                      {formatDistance(distance)}
                    </div>
                  </div>
                </div>
                {accuracy && (
                  <div className="text-right">
                    <div className="text-xs text-slate-500">±{Math.round(accuracy)}m</div>
                    <div className="text-xs text-slate-500">accuracy</div>
                  </div>
                )}
              </div>
            </div>

            {/* Last update */}
            {lastUpdate && (
              <div className="glass-dark rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-400/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 font-medium">Last update</div>
                    <div className="text-lg font-semibold text-white">
                      {formatTimeAgo(lastUpdate)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Hold your device flat and rotate until the arrow points up ⬆️
            </p>
          </div>
        </div>
      </div>
    </>
  );
}