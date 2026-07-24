const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gumpxfxbxxyljikaizsh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Non-Steam game cover URLs (verified working)
const updates = {
  'd4c82986-1cb7-483a-9d80-b1350b4f03ff': { name: '原神', cover_url: 'https://upload-static.hoyoverse.com/hk4e/upload/fb/common.jpg' },
  '287553c0-de74-494e-bdad-d2f28590b7f4': { name: '崩坏：星穹铁道', cover_url: 'https://aka.doubaocdn.com/s/8V4t1wpUmE' },
  '0291b916-866c-4a35-a238-6b4ae1bd274a': { name: '无限暖暖', cover_url: 'https://aka.doubaocdn.com/s/GYdw1wpUmo' },
  '84a95650-97d5-4062-88c6-762398a72c90': { name: '百面千相', cover_url: 'https://assets.papegames.com/nikkiweb/bmqx/bmqxhome/_next/static/media/share-cn.1d19cc15.jpeg' },
  'cff81e02-3fd1-4d82-aaff-be4200f9bf73': { name: '诡秘之主', cover_url: 'https://p4-plat.wskwai.com/udata/pkg/fe/nuxt/lom/gw/202605/banner/pc2/1.jpg' },
  'd334f627-13db-4a93-870f-2886e09fc3a1': { name: '代号：无限大', cover_url: 'https://ananta.res.netease.com/images/20250922/1758531048945_8a2b426439.png' },
  '2ca0cf6c-bcc2-4aeb-a4b6-ee982cd2315f': { name: '雪中悍刀行', cover_url: 'https://img2-tc.tapimg.com/moment/etag/FuPu5uIKpq8qu6A6WwokyZOPe9gx_20260214170704.webp/_tap_ugc_m.jpg' },
  'e5733ba5-dc79-49a3-830e-0b734e0b8a3d': { name: '望月', cover_url: 'https://aka.doubaocdn.com/s/UptF1wpUmE' },
  '13d1a6ee-d373-4fa9-adb2-786d37a6fba8': { name: '黑神话：钟馗', cover_url: 'https://www.gamesci.cn/zhongkui/img/pv_cover.20d325ef.png' },
  // 源初之结: 米哈游新项目，无公开封面素材，保留 null 占位
};

async function run() {
  let success = 0;
  let fail = 0;

  for (const [id, info] of Object.entries(updates)) {
    const { error } = await supabase
      .from('game_progress')
      .update({ cover_url: info.cover_url })
      .eq('id', id);

    if (error) {
      console.log('FAIL: ' + info.name + ' | ' + error.message);
      fail++;
    } else {
      console.log('OK: ' + info.name);
      success++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Success: ' + success + ' / ' + (success + fail));
  if (fail > 0) console.log('Failed: ' + fail);
}

run();
