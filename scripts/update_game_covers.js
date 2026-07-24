const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gumpxfxbxxyljikaizsh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Game ID -> cover_url mapping for all games needing updates
const updates = {
  // Games with working Steam CDN header.jpg (older games)
  'd59b467e-73fe-4555-826e-aa2beb12e2d6': { name: '明末：渊虚之羽', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2277560/header.jpg' },
  'a7e38ea6-3e13-4e95-9e5e-80d83b12af94': { name: '解限机', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2452280/header.jpg' },
  '69e1762a-8094-4ba9-98f7-97d46ddf2a97': { name: '边境', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364020/header.jpg' },
  '30b05172-2d7a-4a36-be7d-1180d11b0fca': { name: '鸣潮', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/3513350/library_hero.jpg' },
  '451a04d0-c70d-412c-b3c5-d154abe1ae02': { name: '暗影火炬城', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1330470/header.jpg' },
  '6241739c-8849-415c-868d-af9982d8c4de': { name: '动物派对', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1260320/header.jpg' },
  '8161a813-100d-44b2-8938-5873302e25d5': { name: '仙剑奇侠传七', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1543030/header.jpg' },
  '17497ba0-d21a-4895-8812-da128f1dda8d': { name: '永劫无间', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1203220/header.jpg' },
  '35149612-1d5e-4b21-b51c-054484238268': { name: '古剑奇谭三', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/994280/header.jpg' },
  '681bb0aa-2899-4e14-9afc-c5f864eeeb7f': { name: '帕斯卡契约', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1456650/header.jpg' },
  '4367945b-6111-4e69-a637-44bc107c0fe9': { name: '戴森球计划', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1366540/header.jpg' },
  'c7671961-2e48-47b9-943e-f6ef698834f3': { name: '雾影猎人', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/3282300/header.jpg' },
  '1e8f8efd-0fe9-4218-b142-1e56335f5473': { name: '万民长歌：三国', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/3483820/header.jpg' },
  '1b3f66dc-fe82-4a56-bb3e-7b7b26467e2f': { name: '风来之国', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/977880/header.jpg' },
  '29735e4e-0f8e-46ac-b8e0-05d4e7334c5a': { name: '山海旅人', cover_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1161170/header.jpg' },

  // Games with hash-based Steam CDN URLs (newer games)
  '0eb071da-c5f3-4623-bc7d-4fef40042ebe': { name: '穿越火线：潜伏', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4687500/34be6a0dca64984114ef8094a8cb33c9e5fea53f/header.jpg?t=1781722040' },
  '7631bb44-c104-4cf1-b181-28695083f8ec': { name: '锦衣卫', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4295810/df5eb611429079feae125f34e9be3eed6ff38692/header.jpg?t=1781604804' },
  '538d9cce-aee0-4ea7-9af3-e0b3b867e775': { name: '剑来', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4906880/dcd92ff98e7bc51ac53ec5042f12fef10d700734/header.jpg?t=1784093979' },
  'a1c0783c-618a-4060-b659-9c1dff1e6b8e': { name: '水浒：道反天罡', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4572160/3563f371720db73fb59c78c5e5373dfc8ff089c6/header.jpg?t=1784704735' },
  '6602cf40-8fba-4597-b800-2d8e652ef9c2': { name: '钟馗传', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4550140/910837a41bc29116d3bc41083a176a2b6e969cb5/header.jpg?t=1781248707' },
  'eeea7acb-0207-49ef-8ad0-28178705d996': { name: '抵抗者', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3184960/2e44e474ca9dcaf2f9915c5dbb09667cf2d07def/header.jpg?t=1782368416' },
  '72a8230f-259b-4590-b8d3-70733772fa44': { name: '古剑', cover_url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4729320/d20e1841898977e5532e5d325f2762449eebbfbd/header.jpg?t=1781262760' },

  // Fix: 黑神话：钟馗 was using 悟空's cover (wrong). Clear it to use improved placeholder.
  '13d1a6ee-d373-4fa9-adb2-786d37a6fba8': { name: '黑神话：钟馗', cover_url: null },
};

async function run() {
  let success = 0;
  let fail = 0;

  for (const [id, info] of Object.entries(updates)) {
    const updateData = info.cover_url === null ? { cover_url: null } : { cover_url: info.cover_url };
    const { error } = await supabase
      .from('game_progress')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.log('FAIL: ' + info.name + ' | ' + error.message);
      fail++;
    } else {
      console.log('OK: ' + info.name + ' | ' + (info.cover_url || '(cleared)'));
      success++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Success: ' + success + ' / ' + (success + fail));
  if (fail > 0) console.log('Failed: ' + fail);
}

run();
