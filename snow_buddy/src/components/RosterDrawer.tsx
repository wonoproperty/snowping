import { X, MapPin, Clock, Compass } from 'lucide-react';

interface Member {
  id: string;
  username: string;
  isOnline: boolean;
  lastSeen: number;
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
  onFocusMember?: (member: Member) => void;
}

export function RosterDrawer({ 
  isOpen, 
  onClose, 
  members, 
  currentUserId,
  onSelectMember,
  onFocusMember 
}: RosterDrawerProps) {
  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1m ago';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1h ago';
    return `${hours}h ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const otherMembers = members.filter(member => member.id !== currentUserId);
  const currentMember = members.find(member => member.id === currentUserId);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`
        fixed z-50 bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md border-white/10
        md:w-80 md:h-full md:top-0 md:left-0 md:border-r md:rounded-none
        max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-3xl max-md:border-t max-md:max-h-[85vh]
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Group Members
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {otherMembers.length + (currentMember ? 1 : 0)} members total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            title="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96 md:max-h-none">
          {/* Current user */}
          {currentMember && (
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center space-x-4 p-4 glass-dark rounded-2xl">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {getInitials(currentMember.username)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white truncate">
                      {currentMember.username}
                    </h3>
                    <span className="text-xs bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded-full font-medium">
                      You
                    </span>
                  </div>
                  <p className="text-sm text-emerald-400 font-medium">Online</p>
                </div>
              </div>
            </div>
          )}

          {/* Other members */}
          <div className="p-4 space-y-3">
            {otherMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No other members
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Share your group code to invite friends to join and track each other.
                </p>
              </div>
            ) : (
              otherMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 glass-dark rounded-2xl hover:bg-white/15 transition-all duration-200 cursor-pointer group"
                  onClick={() => onSelectMember(member)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {getInitials(member.username)}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                        member.isOnline ? 'status-online' : 'status-offline'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate group-hover:text-sky-400 transition-colors">
                        {member.username}
                      </h3>
                      <div className="flex items-center space-x-1 text-sm text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimeAgo(member.lastSeen)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {member.location && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFocusMember?.(member);
                        }}
                        className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                        title="Focus on map"
                      >
                        <MapPin className="w-4 h-4 text-sky-400" />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                      title="Open compass"
                    >
                      <Compass className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}