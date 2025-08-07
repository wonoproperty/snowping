import React, { useState, useEffect, useCallback } from 'react'
import GroupCodeInput from './components/GroupCodeInput'
import PingControls from './components/PingControls'
import MapComponent from './components/MapComponent'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [groupCode, setGroupCode] = useState(null)
  const [username, setUsername] = useState(null)
  const [pings, setPings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(() => {
    // Create a unique ID for this user session
    let id = localStorage.getItem('snowping_user_id')
    if (!id) {
      id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('snowping_user_id', id)
    }
    return id
  })

  // Load saved group code and username on app start
  useEffect(() => {
    const savedGroupCode = localStorage.getItem('snowping_group_code')
    const savedUsername = localStorage.getItem('snowping_username')
    if (savedGroupCode && savedUsername) {
      setGroupCode(savedGroupCode)
      setUsername(savedUsername)
    }
  }, [])

  // Load pings when group code changes
  useEffect(() => {
    if (groupCode) {
      loadPings()
      syncOfflinePings()
    }
  }, [groupCode])

  const loadPings = useCallback(async () => {
    if (!groupCode) return
    
    setIsLoading(true)
    try {
      console.log(`🔍 Loading pings for group: ${groupCode}`)
      
      const { data, error } = await supabase
        .from('pings')
        .select('*')
        .eq('group_code', groupCode)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) {
        console.error('❌ Error loading pings:', error)
        console.error('Error details:', { error, groupCode })
        return
      }

      console.log(`✅ Loaded ${data?.length || 0} pings:`, data)
      setPings(data || [])
    } catch (error) {
      console.error('❌ Exception loading pings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [groupCode])

  const handleGroupSet = (newGroupCode, newUsername) => {
    setGroupCode(newGroupCode)
    setUsername(newUsername)
    localStorage.setItem('snowping_group_code', newGroupCode)
    localStorage.setItem('snowping_username', newUsername)
  }

  const handleLeaveGroup = () => {
    setGroupCode(null)
    setUsername(null)
    setPings([])
    localStorage.removeItem('snowping_group_code')
    localStorage.removeItem('snowping_username')
  }

  const handlePing = async (ping) => {
    try {
      console.log('📍 Sending ping:', ping)
      
      const { data, error } = await supabase.from('pings').insert([ping])

      if (error) {
        console.error('❌ Insert error:', error)
        console.error('Error details:', { error, ping })
        saveOfflinePing(ping)
        alert('No connection. Ping saved locally and will sync when online.')
        return
      }

      console.log('✅ Ping sent successfully:', data)
      // Refresh pings after successful insert
      loadPings()
      alert('Ping sent successfully!')
    } catch (error) {
      console.error('❌ Ping exception:', error)
      saveOfflinePing(ping)
      alert('No connection. Ping saved locally and will sync when online.')
    }
  }

  const saveOfflinePing = (ping) => {
    const offlinePings = JSON.parse(localStorage.getItem('offlinePings') || '[]')
    offlinePings.push(ping)
    localStorage.setItem('offlinePings', JSON.stringify(offlinePings))
  }

  const syncOfflinePings = async () => {
    const offlinePings = JSON.parse(localStorage.getItem('offlinePings') || '[]')
    if (offlinePings.length === 0) return

    try {
      const { error } = await supabase.from('pings').insert(offlinePings)
      if (!error) {
        console.log('Offline pings synced successfully')
        localStorage.removeItem('offlinePings')
        loadPings() // Refresh to show synced pings
      } else {
        console.error('Offline sync error:', error)
      }
    } catch (error) {
      console.log('Still offline or sync failed:', error)
    }
  }

  const handleDeletePing = async (pingId) => {
    try {
      console.log('🗑️ Deleting ping:', pingId)
      
      const { error } = await supabase
        .from('pings')
        .delete()
        .eq('id', pingId)
        .eq('user_id', userId) // Only allow users to delete their own pings

      if (error) {
        console.error('❌ Delete error:', error)
        alert('Failed to delete ping. Please try again.')
        return
      }

      console.log('✅ Ping deleted successfully')
      // Refresh pings after successful delete
      loadPings()
    } catch (error) {
      console.error('❌ Delete exception:', error)
      alert('Failed to delete ping. Please try again.')
    }
  }

  if (!groupCode || !username) {
    return (
      <div className="App">
        <GroupCodeInput onGroupSet={handleGroupSet} />
      </div>
    )
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">
          <span className="snow-icon">❄️</span>
          SnowPing
        </h1>
      </header>
      
      <main className="app-main">
        <PingControls 
          groupCode={groupCode}
          username={username}
          userId={userId}
          onPing={handlePing}
          onLeaveGroup={handleLeaveGroup}
        />
        
        <div className="map-section">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <span>Loading pings...</span>
            </div>
          )}
          <MapComponent 
            pings={pings} 
            currentUserId={userId}
            onDeletePing={handleDeletePing}
          />
        </div>
      </main>
    </div>
  )
}

export default App