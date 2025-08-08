import { useState, useEffect } from 'react';
import { PermissionGate } from './components/PermissionGate';
import { GroupJoin } from './components/GroupJoin';
import { OnlineRoster } from './components/OnlineRoster';
import { MapView } from './components/MapView';
import { CompassToFriend } from './components/CompassToFriend';
import { realtimeService } from './services/supabase';
import { locationService } from './services/locationService';
import type { Friend, Location, GroupState, PresenceState, BroadcastMessage } from './types';

function App() {
  // Core state
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [groupState, setGroupState] = useState<GroupState | null>(null);
  const [currentUserId] = useState(() => crypto.randomUUID());
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  
  // UI state
  const [currentView, setCurrentView] = useState<'roster' | 'map'>('roster');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCompass, setShowCompass] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize location tracking when permissions are granted
  useEffect(() => {
    if (permissionsGranted && groupState) {
      startLocationTracking();
    }
    
    return () => {
      locationService.stopTracking();
    };
  }, [permissionsGranted, groupState]);

  const startLocationTracking = async () => {
    try {
      // Get initial location
      const location = await locationService.getCurrentLocation();
      setMyLocation(location);
      
      // Start continuous tracking
      locationService.startTracking();
    } catch (err) {
      console.error('Failed to get location:', err);
      setError('Failed to get your location. Please check permissions.');
    }
  };

  const handleJoinGroup = async (groupCode: string, username: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Join Supabase realtime channel
      const channel = await realtimeService.joinGroup(groupCode, username, currentUserId);
      
      if (!channel) {
        throw new Error('Failed to create channel');
      }

      // Set up presence tracking
      realtimeService.onPresenceChange((presences) => {
        const friendsList: Friend[] = [];
        
        Object.entries(presences).forEach(([userId, userPresences]) => {
          const latestPresence = userPresences[userPresences.length - 1] as PresenceState;
          const lastSeen = new Date(latestPresence.last_seen).getTime();
          
          friendsList.push({
            id: userId,
            username: latestPresence.username,
            lastSeen,
            isOnline: Date.now() - lastSeen < 15000,
          });
        });
        
        setFriends(friendsList);
      });

      // Set up location updates
      realtimeService.onLocationUpdate((message: BroadcastMessage) => {
        setFriends(prev => prev.map(friend => 
          friend.id === message.user_id 
            ? { ...friend, location: message.location, lastSeen: Date.now() }
            : friend
        ));
      });

      // Subscribe to the channel
      await realtimeService.subscribe();
      
      setGroupState({ code: groupCode, username, isJoined: true });
    } catch (err) {
      console.error('Failed to join group:', err);
      setError('Failed to join group. Please check your internet connection and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    if (friend.location) {
      setShowCompass(true);
    }
  };

  const handleCloseCompass = () => {
    setShowCompass(false);
    setSelectedFriend(null);
  };

  const handleLeaveGroup = async () => {
    try {
      await realtimeService.leaveGroup();
      locationService.stopTracking();
      setGroupState(null);
      setFriends([]);
      setMyLocation(null);
      setSelectedFriend(null);
      setShowCompass(false);
      setCurrentView('roster');
    } catch (err) {
      console.error('Failed to leave group:', err);
    }
  };

  // Show permission gate first
  if (!permissionsGranted) {
    return (
      <PermissionGate onPermissionsGranted={() => setPermissionsGranted(true)}>
        <div />  {/* Placeholder children */}
      </PermissionGate>
    );
  }

  // Show group join if not in a group
  if (!groupState?.isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <GroupJoin onJoinGroup={handleJoinGroup} isConnecting={isConnecting} />
        {error && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">SnowPing</h1>
                <p className="text-sm text-gray-500">Group: {groupState.code}</p>
              </div>
            </div>
            <button
              onClick={handleLeaveGroup}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Leave group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('roster')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'roster'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Friends</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('map')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'map'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Map</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {currentView === 'roster' ? (
          <div className="p-4 space-y-4">
            <OnlineRoster
              friends={friends}
              currentUserId={currentUserId}
              onSelectFriend={handleSelectFriend}
              selectedFriendId={selectedFriend?.id}
              myLocation={myLocation || undefined}
            />
          </div>
        ) : (
          <div className="h-[calc(100vh-140px)]">
            <MapView
              friends={friends}
              currentUserId={currentUserId}
              myLocation={myLocation || undefined}
              onFriendClick={handleSelectFriend}
              selectedFriendId={selectedFriend?.id}
            />
          </div>
        )}
      </main>

      {/* Compass modal */}
      {showCompass && selectedFriend && (
        <CompassToFriend
          friend={selectedFriend}
          myLocation={myLocation || undefined}
          onClose={handleCloseCompass}
        />
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
