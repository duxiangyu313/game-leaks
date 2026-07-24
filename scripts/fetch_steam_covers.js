const https = require('https');

const apps = {
  '鸣潮': 3513350,
  '穿越火线：潜伏': 4687500,
  '锦衣卫': 4295810,
  '剑来': 4906880,
  '水浒：道反天罡': 4572160,
  '钟馗传': 4550140,
  '抵抗者': 3184960,
  '古剑(新)': 4729320
};

async function fetchPage(name, appId) {
  return new Promise((resolve) => {
    const url = 'https://store.steampowered.com/app/' + appId + '/';
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': 'wants_mature_content=1; birthtime=347155201; lastageagegate=1; mature_content=1'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Try multiple patterns to find header image
        const patterns = [
          /game_header_image_full"[^>]*src="([^"]+)"/,
          /og:image"\s*content="([^"]+)"/,
          /header\.jpg"\s*src="([^"]+)"/,
          /class="game_header_image"[^>]*src="([^"]+)"/,
          /cdn\.cloudflare\.steamstatic\.com\/steam\/apps\/\d+\/[^"'\s]+/,
          /shared\.cloudflare\.steamstatic\.com\/store_item_assets\/steam\/apps\/\d+\/[^"'\s]+/,
          /shared\.steamstatic\.com\/store_item_assets\/steam\/apps\/\d+\/[^"'\s]+/
        ];

        let found = null;
        for (const p of patterns) {
          const m = data.match(p);
          if (m) {
            found = m[1] || m[0];
            break;
          }
        }

        if (found) {
          resolve(name + ' | ' + appId + ' | ' + found);
        } else {
          // Show a snippet to debug
          const idx = data.indexOf('header');
          const snippet = idx >= 0 ? data.substring(Math.max(0, idx - 50), idx + 100) : 'no "header" found';
          resolve(name + ' | ' + appId + ' | NO_MATCH (page:' + data.length + ' bytes, snippet: ' + snippet + ')');
        }
      });
    });
    req.on('error', (e) => resolve(name + ' | ERROR: ' + e.message));
  });
}

(async () => {
  for (const [name, id] of Object.entries(apps)) {
    console.log(await fetchPage(name, id));
  }
})();
