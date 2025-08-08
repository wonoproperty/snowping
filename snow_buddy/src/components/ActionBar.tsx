import { MapPin, Users, AlertTriangle, Loader2 } from 'lucide-react';

interface ActionBarProps {
  onPingLocation: () => void;
  onToggleRoster: () => void;
  onSOS: () => void;
  isPinging?: boolean;
  rosterOpen?: boolean;
  memberCount?: number;
}

export function ActionBar({ 
  onPingLocation, 
  onToggleRoster, 
  onSOS, 
  isPinging, 
  rosterOpen,
  memberCount = 0 
}: ActionBarProps) {
  return (
    <>
      {/* Mobile bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden pointer-events-none z-40">
        <div className="pb-safe-bottom px-4 py-4">
          <div className="flex items-center justify-center space-x-4 pointer-events-auto">
            {/* SOS Button */}
            <button
              onClick={onSOS}
              className="fab btn-danger shadow-xl"
              title="Emergency SOS"
            >
              <AlertTriangle className="w-6 h-6" />
            </button>

            {/* Ping Location Button (Primary) */}
            <button
              onClick={onPingLocation}
              disabled={isPinging}
              className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600 rounded-full shadow-xl shadow-emerald-500/30 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:cursor-not-allowed"
              title="Share my location"
            >
              {isPinging ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <MapPin className="w-7 h-7 text-white" />
              )}
            </button>

            {/* Roster Toggle Button */}
            <button
              onClick={onToggleRoster}
              className={`fab relative ${rosterOpen ? 'bg-indigo-500' : 'btn-meet'} shadow-xl`}
              title="Show group members"
            >
              <Users className="w-6 h-6" />
              {memberCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{memberCount}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop side action bar */}
      <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none z-40">
        <div className="pr-4">
          <div className="flex flex-col space-y-4 pointer-events-auto">
            {/* Ping Location Button */}
            <button
              onClick={onPingLocation}
              disabled={isPinging}
              className="w-14 h-14 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-600 rounded-full shadow-lg shadow-black/30 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:cursor-not-allowed"
              title="Share my location"
            >
              {isPinging ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <MapPin className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Roster Toggle Button */}
            <button
              onClick={onToggleRoster}
              className={`fab relative ${rosterOpen ? 'bg-indigo-500' : 'btn-meet'}`}
              title="Show group members"
            >
              <Users className="w-5 h-5" />
              {memberCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{memberCount}</span>
                </div>
              )}
            </button>

            {/* SOS Button */}
            <button
              onClick={onSOS}
              className="fab btn-danger"
              title="Emergency SOS"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}