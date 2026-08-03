const https = require('https');

const url = 'https://news.guoyouwenduji.cc/articles/detail/?id=cbfa1640-e809-45f7-b277-cf712b0ff0ee';

https.get(url, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const checks = {
      status: res.statusCode,
      hasRobotsNoIndex: /meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(data),
      hasRobotsIndex: /meta[^>]*name=["']robots["'][^>]*content=["'][^"']*index/i.test(data),
      title: (data.match(/<title>([^<]*)<\/title>/) || [])[1] || 'NOT FOUND',
      hasDescription: /meta[^>]*name=["']description["'][^>]*content=/.test(data),
      hasCanonical: /meta[^>]*rel=["']canonical["'][^>]*href=/.test(data),
      hasJSONLD: /ld\+json/.test(data),
      hasH1: /<h1[^>]*>/.test(data),
      bodyLength: data.length,
      // Check for loading states
      hasSkeleton: /skeleton|loading-spin|animate-pulse/i.test(data),
      hasUseEffect: /useEffect|useLayoutEffect/.test(data),
      // Check CSP
      cspHeader: res.headers['content-security-policy'] || 'NONE',
      xRobots: res.headers['x-robots-tag'] || 'NONE',
    };
    console.log(JSON.stringify(checks, null, 2));
    
    // Show first 2000 chars of body
    console.log('\n=== First 2000 chars of body ===');
    console.log(data.substring(0, 2000));
  });
}).on('error', (e) => console.log('Error:', e.message));
