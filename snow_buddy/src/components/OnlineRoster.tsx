import { formatDistanceToNow } from 'date-fns';
import type { Friend } from '../types';
import { formatDistance } from '../utils/compass';

interface OnlineRosterProps {
  friends: Friend[];
  currentUserId: string;
  onSelectFriend: (friend: Friend) => void;
  selectedFriendId?: string;
  myLocation?: { latitude: number; longitude: number };
}

export function OnlineRoster({ 
  friends, 
  currentUserId, 
  onSelectFriend, 
  selectedFriendId,
  myLocation 
}: OnlineRosterProps) {
  const otherFriends = friends.filter(friend => friend.id !== currentUserId);
  
  if (otherFriends.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No friends online</h3>
        <p className="text-gray-500 text-sm">
          Share your group code with friends so they can join you on the slopes
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Friends ({otherFriends.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {otherFriends.map((friend) => (
          <FriendItem
            key={friend.id}
            friend={friend}
            isSelected={selectedFriendId === friend.id}
            myLocation={myLocation}
            onClick={() => onSelectFriend(friend)}
          />
        ))}
      </div>
    </div>
  );
}

interface FriendItemProps {
  friend: Friend;
  isSelected: boolean;
  myLocation?: { latitude: number; longitude: number };
  onClick: () => void;
}

function FriendItem({ friend, isSelected, myLocation, onClick }: FriendItemProps) {
  const now = Date.now();
  const isOnline = now - friend.lastSeen < 15000; // 15 seconds
  const hasLocation = friend.location && myLocation;
  
  let distance: string | null = null;
  if (hasLocation) {
    const distanceMeters = calculateDistance(
      myLocation.latitude,
      myLocation.longitude,
      friend.location!.latitude,
      friend.location!.longitude
    );
    distance = formatDistance(distanceMeters);
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {friend.username.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Online status indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 truncate">
                {friend.username}
              </h3>
              {hasLocation && (
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {isOnline ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Online
                </span>
              ) : (
                `Last seen ${formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {distance && (
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {distance}
            </span>
          )}
          
          {hasLocation && (
            <div className="text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {isSelected && hasLocation && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Tap to open compass navigation
          </p>
        </div>
      )}
    </button>
  );
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}