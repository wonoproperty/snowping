import { useState, useEffect } from 'react';
import { PermissionGate } from './components/PermissionGate';
import { JoinCard } from './components/JoinCard';
import { HeaderBar } from './components/HeaderBar';
import { MapChrome } from './components/MapChrome';
import { ActionBar } from './components/ActionBar';
import { RosterDrawer } from './components/RosterDrawer';
import { CompassPanel } from './components/CompassPanel';
import { SimplePing } from './components/SimplePing';
import { MapView } from './components/MapView';
import { supabase } from './services/supabase';
import { locationService } from './services/locationService';
import type { Friend, GroupState } from './types';

// Simplified SnowPing App - No realtime dependencies - Force rebuild v2

function AppSimple() {
  // Core state
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [groupState, setGroupState] = useState<GroupState | null>(null);
  const [currentUserId] = useState(() => crypto.randomUUID());
  
  // UI state
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showCompass, setShowCompass] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number; timestamp: number } | undefined>();

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

  // Load friends data
  useEffect(() => {
    if (!groupState?.isJoined) return;

    const loadFriends = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('group_code', groupState.code)
          .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

        if (error) {
          console.error('Error loading friends:', error);
          return;
        }

        const friendsList: Friend[] = data.map(item => ({
          id: item.user_id,
          username: item.username,
          location: {
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: new Date(item.updated_at).getTime()
          },
          lastSeen: new Date(item.updated_at).getTime(),
          isOnline: Date.now() - new Date(item.updated_at).getTime() < 2 * 60 * 1000
        }));

        setFriends(friendsList);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    };

    loadFriends();
    const interval = setInterval(loadFriends, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [groupState?.code, groupState?.isJoined]);

  const handlePingLocation = async () => {
    if (!groupState?.isJoined) return;

    setIsPinging(true);
    try {
      const location = await locationService.getCurrentLocation();
      setMyLocation(location);

      // Save to Supabase
      const { error } = await supabase
        .from('locations')
        .upsert({
          user_id: currentUserId,
          username: groupState.username,
          group_code: groupState.code,
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving location:', error);
        alert('Failed to share location. Please try again.');
        return;
      }

      // Refresh friends list to show updated location
      setTimeout(() => {
        // This will be handled by the useEffect above
      }, 1000);

    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your location. Please check permissions.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleSOS = () => {
    alert('SOS sent to all group members!');
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
      <JoinCard onJoinGroup={handleJoinGroup} isConnecting={isConnecting} />
    );
  }

  // Main app interface with new modern UI
  return (
    <>
      {/* Header */}
      <HeaderBar 
        groupCode={groupState.code}
        isConnected={true}
      />

      {/* Map container with dark background */}
      <MapChrome>
        <MapView
          friends={friends}
          currentUserId={currentUserId}
          myLocation={myLocation}
          onFriendClick={handleSelectFriend}
          selectedFriendId={selectedFriend?.id}
        />
      </MapChrome>

      {/* Action buttons */}
      <ActionBar
        onPingLocation={handlePingLocation}
        onToggleRoster={() => setRosterOpen(!rosterOpen)}
        onSOS={handleSOS}
        isPinging={isPinging}
        rosterOpen={rosterOpen}
        memberCount={friends.length}
      />

      {/* Roster drawer */}
      <RosterDrawer
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        members={friends}
        currentUserId={currentUserId}
        onSelectMember={handleSelectFriend}
        onFocusMember={(member) => {
          // Focus map on member location
        }}
      />

      {/* Compass panel */}
      <CompassPanel
        isOpen={showCompass}
        onClose={handleCloseCompass}
        targetName={selectedFriend?.username || 'Friend'}
        bearing={45}
        distance={250}
        accuracy={5}
        lastUpdate={selectedFriend?.lastSeen}
      />
    </>
  );
}

export default AppSimple;