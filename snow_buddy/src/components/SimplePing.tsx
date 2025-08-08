import { useState, useEffect } from 'react';
import { MapPin, Loader2, Users, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { locationService } from '../services/locationService';
import type { Friend } from '../types';

interface SimplePingProps {
  groupCode: string;
  username: string;
  currentUserId: string;
  onSelectFriend: (friend: Friend) => void;
}

export function SimplePing({ groupCode, username, currentUserId, onSelectFriend }: SimplePingProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<number | null>(null);

  useEffect(() => {
    loadFriends();
    const interval = setInterval(loadFriends, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [groupCode]);

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('group_code', groupCode)
        .gte('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

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
        isOnline: Date.now() - new Date(item.updated_at).getTime() < 2 * 60 * 1000 // Online if pinged within 2 minutes
      }));

      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const shareMyLocation = async () => {
    setIsSharing(true);
    
    try {
      const location = await locationService.getCurrentLocation();

      // Save to Supabase
      const { error } = await supabase
        .from('locations')
        .upsert({
          user_id: currentUserId,
          username: username,
          group_code: groupCode,
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving location:', error);
        alert('Failed to share location. Please try again.');
        return;
      }

      setLastPingTime(Date.now());
      loadFriends(); // Refresh the friends list
      
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your location. Please check permissions.');
    } finally {
      setIsSharing(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SnowPing</h1>
              <p className="text-sm text-gray-600">Group: {groupCode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{username}</p>
              {lastPingTime && (
                <p className="text-xs text-gray-500">
                  Last ping: {formatTimeAgo(lastPingTime)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Location Button */}
      <div className="px-4 py-6">
        <button
          onClick={shareMyLocation}
          disabled={isSharing}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
        >
          {isSharing ? (
            <>
              <Loader2 className="animate-spin w-6 h-6" />
              <span>Sharing Location...</span>
            </>
          ) : (
            <>
              <MapPin className="w-6 h-6" />
              <span>📍 Ping My Location</span>
            </>
          )}
        </button>
        
        <p className="text-center text-sm text-gray-500 mt-3">
          Tap to share your current location with friends in this group
        </p>
      </div>

      {/* Friends List */}
      <div className="px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Friends on Slopes ({friends.filter(f => f.id !== currentUserId).length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {friends.filter(f => f.id !== currentUserId).length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-gray-400 mb-3">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No friends found</h3>
                <p className="text-gray-500 text-sm">
                  Share your group code <strong>{groupCode}</strong> with friends so they can join!
                </p>
              </div>
            ) : (
              friends.filter(f => f.id !== currentUserId).map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          friend.isOnline ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">{friend.username}</h3>
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(friend.lastSeen)}
                        </p>
                      </div>
                    </div>

                    <div className="text-blue-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>How it works:</strong> Tap "Ping My Location" to share where you are. 
            Friends can see your location and tap on your name to get directions to you!
          </p>
        </div>
      </div>
    </div>
  );
}