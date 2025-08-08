import { useState } from 'react';
import { PermissionGate } from './components/PermissionGate';
import { GroupJoin } from './components/GroupJoin';
import { SimplePing } from './components/SimplePing';
import { CompassToFriend } from './components/CompassToFriend';
import type { Friend, GroupState } from './types';

// Simplified SnowPing App - No realtime dependencies

function AppSimple() {
  // Core state
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [groupState, setGroupState] = useState<GroupState | null>(null);
  const [currentUserId] = useState(() => crypto.randomUUID());
  
  // UI state
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCompass, setShowCompass] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleJoinGroup = async (groupCode: string, username: string) => {
    setIsConnecting(true);
    
    try {
      // Simple join - no realtime setup needed
      setGroupState({ code: groupCode, username, isJoined: true });
    } catch (err) {
      console.error('Failed to join group:', err);
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

  const handleLeaveGroup = () => {
    setGroupState(null);
    setSelectedFriend(null);
    setShowCompass(false);
  };

  // Show permission gate first
  if (!permissionsGranted) {
    return (
      <PermissionGate onPermissionsGranted={() => setPermissionsGranted(true)}>
        <div />
      </PermissionGate>
    );
  }

  // Show group join if not in a group
  if (!groupState?.isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <GroupJoin onJoinGroup={handleJoinGroup} isConnecting={isConnecting} />
      </div>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gray-50">
      <SimplePing
        groupCode={groupState.code}
        username={groupState.username}
        currentUserId={currentUserId}
        onSelectFriend={handleSelectFriend}
      />

      {/* Compass modal */}
      {showCompass && selectedFriend && (
        <CompassToFriend
          friend={selectedFriend}
          onClose={handleCloseCompass}
        />
      )}

      {/* Leave group button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleLeaveGroup}
          className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
          title="Leave group"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AppSimple;