const https = require('https');

const testUrls = [
  'https://aka.doubaocdn.com/s/KZSW1wpURC',  // 穿越火线：潜伏 header
  'https://aka.doubaocdn.com/s/RimC1wpUNY',  // 鸣潮 header
  'https://aka.doubaocdn.com/s/wwQD1wpUNZ',  // 锦衣卫 header
  'https://aka.doubaocdn.com/s/g0G21wpURC',  // 穿越火线 screenshot
];

async function check(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve(url + ' | ' + res.statusCode + ' | content-type: ' + res.headers['content-type'] + ' | size: ' + res.headers['content-length']);
    });
    req.on('error', (e) => resolve(url + ' | ERROR: ' + e.message));
    req.setTimeout(5000, () => { req.destroy(); resolve(url + ' | TIMEOUT'); });
  });
}

(async () => {
  for (const url of testUrls) {
    console.log(await check(url));
  }
})();
