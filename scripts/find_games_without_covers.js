const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gumpxfxbxxyljikaizsh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Find all games with null/empty cover_url
  const { data, error } = await supabase
    .from('game_progress')
    .select('id, name, developer, genre')
    .is('cover_url', null)
    .order('name');

  if (error) {
    console.log('ERROR:', error.message);
    return;
  }

  console.log('=== Games without cover_url ===');
  console.log('Total:', data.length);
  console.log('');
  for (const g of data) {
    console.log(`${g.id} | ${g.name} | ${g.developer || ''} | ${g.genre || ''}`);
  }
}

run();
