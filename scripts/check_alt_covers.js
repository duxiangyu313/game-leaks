const https = require('https');

// Try alternative Steam CDN paths for games where header.jpg failed
const failedApps = {
  '鸣潮': 3513350,
  '穿越火线：潜伏': 4687500,
  '锦衣卫': 4295810,
  '剑来': 4906880,
  '水浒：道反天罡': 4572160,
  '钟馗传': 4550140,
  '抵抗者': 3184960,
  '古剑(新)': 4729320
};

const altPaths = [
  'capsule_236x620.jpg',
  'capsule_616x353.jpg',
  'library_600x900.jpg',
  'library_hero.jpg',
  'page_bg_raw.jpg',
  'logo.png'
];

const cdnHosts = [
  'https://cdn.cloudflare.steamstatic.com/steam/apps/',
  'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/',
  'https://shared.steamstatic.com/store_item_assets/steam/apps/'
];

async function check(name, appId) {
  const results = [];
  for (const host of cdnHosts) {
    for (const path of altPaths) {
      const url = host + appId + '/' + path;
      await new Promise((resolve) => {
        const req = https.get(url, (res) => {
          if (res.statusCode === 200) {
            results.push('  OK: ' + url);
          }
          resolve();
        });
        req.on('error', () => resolve());
        req.setTimeout(3000, () => { req.destroy(); resolve(); });
      });
    }
  }
  if (results.length > 0) {
    console.log(name + ' (' + appId + '):');
    results.forEach(r => console.log(r));
  } else {
    console.log(name + ' (' + appId + '): ALL FAILED');
  }
}

(async () => {
  for (const [name, id] of Object.entries(failedApps)) {
    await check(name, id);
  }
})();
