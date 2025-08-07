import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'
import { formatDateTimeWithRelative } from '../utils/timeUtils'

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapComponent = ({ pings = [], currentUserId, onDeletePing }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([-37.1, 147.1], 13)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current)
    }

    // Set up global delete function for popup buttons
    window.deletePing = (pingId) => {
      if (window.confirm('Are you sure you want to delete this ping?')) {
        onDeletePing(pingId)
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      // Clean up global function
      delete window.deletePing
    }
  }, [onDeletePing])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    pings.forEach(ping => {
      const icon = getPingIcon(ping.type)
      const marker = L.marker([ping.latitude, ping.longitude], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(createPopupContent(ping))

      markersRef.current.push(marker)
    })

    // Auto-fit map to show all pings
    if (pings.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [pings])

  const getPingIcon = (type) => {
    const iconConfig = {
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }

    switch (type) {
      case 'here':
        return L.divIcon({
          ...iconConfig,
          html: '<div class="ping-marker ping-here">📍</div>',
          className: 'custom-ping-icon'
        })
      case 'meet':
        return L.divIcon({
          ...iconConfig,
          html: '<div class="ping-marker ping-meet">🤝</div>',
          className: 'custom-ping-icon'
        })
      case 'sos':
        return L.divIcon({
          ...iconConfig,
          html: '<div class="ping-marker ping-sos">🆘</div>',
          className: 'custom-ping-icon'
        })
      default:
        return new L.Icon.Default()
    }
  }

  const createPopupContent = (ping) => {
    const timeWithRelative = formatDateTimeWithRelative(ping.timestamp)
    const typeEmoji = {
      here: '📍',
      meet: '🤝',
      sos: '🆘'
    }
    
    const isOwnPing = ping.user_id === currentUserId
    const canDelete = isOwnPing && (ping.type === 'here' || ping.type === 'meet')
    
    return `
      <div class="ping-popup" data-ping-id="${ping.id}">
        <div class="ping-popup-header">
          <span class="ping-popup-icon">${typeEmoji[ping.type] || '📍'}</span>
          <span class="ping-popup-type">${ping.type.toUpperCase()}</span>
          ${canDelete ? `<button class="ping-delete-btn" onclick="window.deletePing('${ping.id}')" title="Delete this ping">🗑️</button>` : ''}
        </div>
        <div class="ping-popup-user">👤 ${ping.username || 'Anonymous'}</div>
        ${ping.message ? `<div class="ping-popup-message">${ping.message}</div>` : ''}
        <div class="ping-popup-time">${timeWithRelative}</div>
      </div>
    `
  }

  return <div ref={mapRef} className="map-container" />
}

export default MapComponent