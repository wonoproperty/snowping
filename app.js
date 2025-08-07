let map = L.map('map').setView([-37.1, 147.1], 13); // Default near Mt Hotham
let currentGroupCode = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function setGroupCode() {
  const groupCodeInput = document.getElementById('groupCodeInput');
  const groupCode = groupCodeInput.value.trim();
  
  if (!groupCode) {
    alert('Please enter a group code');
    return;
  }
  
  currentGroupCode = groupCode;
  localStorage.setItem('snowping_group_code', groupCode);
  
  document.getElementById('currentGroup').textContent = `Group: ${groupCode}`;
  document.getElementById('groupCodeSection').style.display = 'none';
  document.getElementById('buttons').style.display = 'block';
  
  // Clear existing markers and reload pings for this group
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  
  loadPings();
}

function sendPing(type) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const message = type === 'meet' ? document.getElementById('meetMessage').value : '';

    const ping = {
      type,
      latitude: lat,
      longitude: lon,
      message,
      group_code: currentGroupCode,
      timestamp: new Date().toISOString()
    };

    console.log("Trying to send ping:", ping);

    try {
      const { error } = await window.supabase.from('pings').insert([ping]);

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      alert('Ping sent!');
    } catch (e) {
      saveOfflinePing(ping);
      alert('No connection. Ping saved locally.');
    }
  }, (error) => {
    console.error("Geolocation error:", error);
    alert("Unable to get your location.");
  });
}

function saveOfflinePing(ping) {
  const pings = JSON.parse(localStorage.getItem('offlinePings') || '[]');
  pings.push(ping);
  localStorage.setItem('offlinePings', JSON.stringify(pings));
}

async function syncOfflinePings() {
  const pings = JSON.parse(localStorage.getItem('offlinePings') || '[]');
  if (pings.length === 0) return;

  try {
    const { error } = await window.supabase.from('pings').insert(pings);
    if (!error) {
      console.log("Offline pings synced.");
      localStorage.removeItem('offlinePings');
    } else {
      console.error("Offline sync error:", error);
    }
  } catch (e) {
    console.log('Still offline or sync failed.', e);
  }
}

async function loadPings() {
  if (!currentGroupCode) return;
  
  const { data, error } = await window.supabase.from('pings')
    .select('*')
    .eq('group_code', currentGroupCode)
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error loading pings:", error);
    return;
  }

  if (data) {
    data.forEach(ping => {
      L.marker([ping.latitude, ping.longitude])
        .addTo(map)
        .bindPopup(`<b>${ping.type.toUpperCase()}</b><br>${ping.message}<br>${new Date(ping.timestamp).toLocaleTimeString()}`);
    });
  }
}

window.addEventListener('load', () => {
  // Check if user previously set a group code
  const savedGroupCode = localStorage.getItem('snowping_group_code');
  if (savedGroupCode) {
    currentGroupCode = savedGroupCode;
    document.getElementById('currentGroup').textContent = `Group: ${savedGroupCode}`;
    document.getElementById('groupCodeSection').style.display = 'none';
    document.getElementById('buttons').style.display = 'block';
    loadPings();
  }
  
  syncOfflinePings();
});
