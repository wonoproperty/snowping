const supabaseUrl = 'https://vuxlvyhmzxxufswwxvnm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eGx2eWhtenh4dWZzd3d4dm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODEyNzcsImV4cCI6MjA3MDE1NzI3N30.KHxwnPVaVZw6by4nGfH3g-yie6VFRWhUwSFAQIxUZwo';

window.addEventListener('load', () => {
  window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
});
