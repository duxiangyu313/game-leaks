const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read key from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
if (!keyMatch) { console.error('SUPABASE_SERVICE_ROLE_KEY not found'); process.exit(1); }
const KEY = keyMatch[1].trim();

async function tryConnect(user, pass, port) {
  const pool = new Pool({
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: port,
    user: user,
    password: pass,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    const c = await pool.connect();
    console.log('OK:', user, 'port', port);
    const res = await c.query('SELECT 1 as test');
    console.log('Query works:', res.rows[0]);
    c.release();
    await pool.end();
    return true;
  } catch(e) {
    console.log('FAIL:', user, 'port', port, '-', e.message.split('\n')[0]);
    await pool.end().catch(()=>{});
    return false;
  }
}

async function main() {
  for (const user of ['postgres', 'postgres.gumpxfxbxxyljikaizsh']) {
    for (const port of [6543, 5432]) {
      if (await tryConnect(user, KEY, port)) {
        console.log('SUCCESS with', user, port);
        return;
      }
    }
  }
  console.log('All connection attempts failed');
}

main().catch(e => console.error(e));
