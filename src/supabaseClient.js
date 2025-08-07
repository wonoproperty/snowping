import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = 'https://vuxlvyhmzxxufswwxvnm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eGx2eWhtenh4dWZzd3d4dm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODEyNzcsImV4cCI6MjA3MDE1NzI3N30.KHxwnPVaVZw6by4nGfH3g-yie6VFRWhUwSFAQIxUZwo'

// Toggle between real and mock Supabase
const USE_MOCK = false // Set to true for local testing without database

export const supabase = USE_MOCK ? mockSupabase : createClient(supabaseUrl, supabaseKey)

if (USE_MOCK) {
  console.log('🧪 Using mock Supabase for local testing')
} else {
  console.log('🔗 Using real Supabase database')
}