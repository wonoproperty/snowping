import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Friend, Location } from '../types';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  friends: Friend[];
  currentUserId: string;
  myLocation?: Location;
  onFriendClick: (friend: Friend) => void;
  selectedFriendId?: string;
}

export function MapView({ 
  friends, 
  currentUserId, 
  myLocation, 
  onFriendClick,
  selectedFriendId 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default center (Mount Hotham coordinates)
    const defaultCenter: [number, number] = [-37.0333, 147.3333];
    
    const map = L.map(mapRef.current, {
      center: myLocation ? [myLocation.latitude, myLocation.longitude] : defaultCenter,
      zoom: myLocation ? 15 : 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add custom attribution control
    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addAttribution('© OpenStreetMap').addTo(map);

    mapInstanceRef.current = map;
    setIsMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when friends change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    const map = mapInstanceRef.current;
    const markers = markersRef.current;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers.clear();

    // Add my location marker
    if (myLocation) {
      const myIcon = createCustomIcon('you', true);
      const myMarker = L.marker([myLocation.latitude, myLocation.longitude], {
        icon: myIcon,
        title: 'Your location'
      }).addTo(map);
      
      markers.set(currentUserId, myMarker);
    }

    // Add friend markers
    friends.forEach(friend => {
      if (friend.id === currentUserId || !friend.location) return;

      const isSelected = selectedFriendId === friend.id;
      const isOnline = Date.now() - friend.lastSeen < 15000;
      
      const friendIcon = createCustomIcon(friend.username.charAt(0).toUpperCase(), false, isOnline, isSelected);
      const friendMarker = L.marker([friend.location.latitude, friend.location.longitude], {
        icon: friendIcon,
        title: friend.username
      })
      .on('click', () => onFriendClick(friend))
      .addTo(map);

      markers.set(friend.id, friendMarker);
    });

    // Auto-fit map to show all markers if we have location data
    const positions = Array.from(markers.values()).map(marker => marker.getLatLng());
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (myLocation && positions.length === 1) {
      map.setView([myLocation.latitude, myLocation.longitude], 15);
    }

  }, [friends, myLocation, currentUserId, selectedFriendId, isMapLoaded, onFriendClick]);

  // Only show loading if map is not initialized yet
  if (!isMapLoaded) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading map...</h3>
          <p className="text-slate-400 text-sm">
            Preparing your SnowPing experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        {myLocation && (
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([myLocation.latitude, myLocation.longitude], 16);
              }
            }}
            className="bg-white shadow-md p-2 rounded-lg hover:bg-gray-50 transition-colors"
            title="Center on my location"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              const positions = Array.from(markersRef.current.values()).map(marker => marker.getLatLng());
              if (positions.length > 0) {
                const bounds = L.latLngBounds(positions);
                mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
              }
            }
          }}
          className="bg-white shadow-md p-2 rounded-lg hover:bg-gray-50 transition-colors"
          title="Fit all friends"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>You</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create custom marker icon
function createCustomIcon(
  letter: string, 
  isMe: boolean = false, 
  isOnline: boolean = true, 
  isSelected: boolean = false
): L.DivIcon {
  const color = isMe ? 'bg-blue-500' : (isOnline ? 'bg-green-500' : 'bg-gray-400');
  const ring = isSelected ? 'ring-4 ring-yellow-300' : '';
  
  const html = `
    <div class="relative">
      <div class="${color} ${ring} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
        ${letter}
      </div>
      <div class="${color} absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}