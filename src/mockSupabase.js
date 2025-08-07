// Mock Supabase client for local testing
// Use this when you don't have database access

let mockPings = []

const mockSupabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        order: (orderColumn, options) => ({
          limit: (limitCount) => {
            // Filter pings by group_code
            const filteredPings = mockPings.filter(ping => ping.group_code === value)
            
            // Sort by timestamp
            const sortedPings = filteredPings.sort((a, b) => {
              const dateA = new Date(a.timestamp)
              const dateB = new Date(b.timestamp)
              return options?.ascending ? dateA - dateB : dateB - dateA
            })
            
            // Apply limit
            const limitedPings = sortedPings.slice(0, limitCount)
            
            console.log(`[MOCK] Loading ${limitedPings.length} pings for group: ${value}`)
            
            return Promise.resolve({
              data: limitedPings,
              error: null
            })
          }
        })
      })
    }),
    
    insert: (records) => {
      // Add mock data
      const newPings = records.map(record => ({
        ...record,
        id: 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }))
      
      mockPings.push(...newPings)
      
      console.log(`[MOCK] Inserted ${newPings.length} pings:`, newPings)
      
      return Promise.resolve({
        data: newPings,
        error: null
      })
    }
  })
}

export { mockSupabase }