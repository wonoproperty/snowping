import React, { useState } from 'react'
import './PingControls.css'

const PingControls = ({ groupCode, username, userId, onPing, onLeaveGroup }) => {
  const [meetMessage, setMeetMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePing = async (type) => {
    if (isLoading) return
    
    setIsLoading(true)
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const ping = {
          type,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          message: type === 'meet' ? meetMessage : '',
          group_code: groupCode,
          username: username,
          user_id: userId,
          timestamp: new Date().toISOString()
        }

        try {
          await onPing(ping)
          if (type === 'meet') setMeetMessage('')
        } catch (error) {
          console.error('Ping failed:', error)
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please enable location services.')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <div className="ping-controls">
      <div className="group-header">
        <div className="group-info">
          <h3 className="group-name">Group: {groupCode}</h3>
          <p className="username-display">Signed in as: {username}</p>
        </div>
        <button 
          onClick={onLeaveGroup} 
          className="leave-group-btn"
          title="Leave Group"
        >
          ✕
        </button>
      </div>

      <div className="ping-buttons">
        <button 
          onClick={() => handlePing('here')}
          disabled={isLoading}
          className="ping-btn ping-here"
        >
          <span className="ping-icon">📍</span>
          I'm Here
        </button>

        <button 
          onClick={() => handlePing('sos')}
          disabled={isLoading}
          className="ping-btn ping-sos"
        >
          <span className="ping-icon">🆘</span>
          SOS
        </button>
      </div>

      <div className="meet-section">
        <input
          type="text"
          value={meetMessage}
          onChange={(e) => setMeetMessage(e.target.value)}
          placeholder="Where should we meet? (optional)"
          className="meet-input"
          maxLength={100}
          disabled={isLoading}
        />
        <button 
          onClick={() => handlePing('meet')}
          disabled={isLoading}
          className="ping-btn ping-meet"
        >
          <span className="ping-icon">🤝</span>
          Meet Me
        </button>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Getting location...</span>
        </div>
      )}
    </div>
  )
}

export default PingControls