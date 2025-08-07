import React, { useState, useEffect } from 'react'
import './GroupCodeInput.css'

const GroupCodeInput = ({ onGroupSet }) => {
  const [groupCode, setGroupCode] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('snowping_username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupCode.trim()) {
      alert('Please enter a group code')
      return
    }
    if (!username.trim()) {
      alert('Please enter your username')
      return
    }
    
    setIsLoading(true)
    // Save username for future use
    localStorage.setItem('snowping_username', username.trim())
    onGroupSet(groupCode.trim(), username.trim())
    setIsLoading(false)
  }

  return (
    <div className="group-code-container">
      <div className="group-code-card">
        <h2 className="group-code-title">
          <span className="snow-icon">❄️</span>
          Join Your Group
        </h2>
        <p className="group-code-subtitle">
          Enter your name and group code to start sharing locations
        </p>
        
        <form onSubmit={handleSubmit} className="group-code-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name (e.g., Alex)"
            className="group-code-input username-input"
            maxLength={20}
            disabled={isLoading}
          />
          <input
            type="text"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            placeholder="Enter group code (e.g., SNOW2024)"
            className="group-code-input"
            maxLength={20}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="group-code-button"
            disabled={isLoading || !groupCode.trim() || !username.trim()}
          >
            {isLoading ? 'Joining...' : 'Join Group'}
          </button>
        </form>
        
        <div className="group-code-info">
          <p>💡 Ask your group leader for the code</p>
        </div>
      </div>
    </div>
  )
}

export default GroupCodeInput