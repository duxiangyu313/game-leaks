const https = require('https');
const http = require('http');

const urls = {
  '原神': 'https://upload-static.hoyoverse.com/hk4e/upload/fb/common.jpg',
  '崩坏：星穹铁道': 'https://aka.doubaocdn.com/s/8V4t1wpUmE',
  '无限暖暖': 'https://aka.doubaocdn.com/s/GYdw1wpUmo',
  '百面千相': 'https://assets.papegames.com/nikkiweb/bmqx/bmqxhome/_next/static/media/share-cn.1d19cc15.jpeg',
  '诡秘之主': 'https://p4-plat.wskwai.com/udata/pkg/fe/nuxt/lom/gw/202605/banner/pc2/1.jpg',
  '代号：无限大': 'https://ananta.res.netease.com/images/20250922/1758531048945_8a2b426439.png',
  '雪中悍刀行': 'https://img2-tc.tapimg.com/moment/etag/FuPu5uIKpq8qu6A6WwokyZOPe9gx_20260214170704.webp/_tap_ugc_m.jpg',
  '望月': 'https://aka.doubaocdn.com/s/UptF1wpUmE',
  '黑神话：钟馗': 'https://www.gamesci.cn/zhongkui/img/pv_cover.20d325ef.png',
};

async function checkUrl(name, url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode === 200) {
        resolve(name + ' | OK (200) | type=' + res.headers['content-type'] + ' | size=' + res.headers['content-length']);
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const location = res.headers.location;
        if (location) {
          resolve(name + ' | REDIRECT(' + res.statusCode + ') -> ' + location.substring(0, 80) + '...');
        } else {
          resolve(name + ' | REDIRECT(' + res.statusCode + ') no location');
        }
      } else {
        resolve(name + ' | FAIL(' + res.statusCode + ')');
      }
    });
    req.on('error', (e) => resolve(name + ' | ERROR: ' + e.message));
    req.setTimeout(5000, () => { req.destroy(); resolve(name + ' | TIMEOUT'); });
  });
}

(async () => {
  for (const [name, url] of Object.entries(urls)) {
    console.log(await checkUrl(name, url));
  }
})();
