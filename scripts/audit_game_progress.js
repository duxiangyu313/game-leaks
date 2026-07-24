const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gumpxfxbxxyljikaizsh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Get column info for game_progress
  const { data, error } = await supabase
    .from('game_progress')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(1);

  if (error) {
    console.log('ERROR:', error.message);
    return;
  }

  if (data && data.length > 0) {
    const sample = data[0];
    console.log('=== game_progress 表字段 ===');
    console.log('字段总数:', Object.keys(sample).length);
    console.log('');
    for (const [key, value] of Object.entries(sample)) {
      const type = value === null ? 'null' : typeof value;
      const display = Array.isArray(value) ? `Array(${value.length})` : 
                      typeof value === 'string' && value.length > 80 ? value.substring(0, 80) + '...' :
                      value;
      console.log(`${key}: ${type} = ${JSON.stringify(display)}`);
    }
  }

  // Count by stage
  const { data: stageData } = await supabase
    .from('game_progress')
    .select('development_stage');
  
  if (stageData) {
    const counts = {};
    for (const g of stageData) {
      counts[g.development_stage] = (counts[g.development_stage] || 0) + 1;
    }
    console.log('\n=== 阶段分布 ===');
    for (const [stage, count] of Object.entries(counts)) {
      console.log(`${stage}: ${count}`);
    }
  }

  // Check for null fields
  const { data: allData } = await supabase
    .from('game_progress')
    .select('*');
  
  if (allData) {
    console.log('\n=== 字段完整度 ===');
    const fields = {};
    for (const g of allData) {
      for (const key of Object.keys(g)) {
        if (!fields[key]) fields[key] = { total: allData.length, filled: 0 };
        if (g[key] !== null && g[key] !== undefined && g[key] !== '' && 
            (!Array.isArray(g[key]) || g[key].length > 0)) {
          fields[key].filled++;
        }
      }
    }
    for (const [field, info] of Object.entries(fields).sort((a, b) => b[1].filled - a[1].filled)) {
      const pct = Math.round((info.filled / info.total) * 100);
      const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
      console.log(`${bar} ${pct}%  ${field} (${info.filled}/${info.total})`);
    }
  }
}

run();
