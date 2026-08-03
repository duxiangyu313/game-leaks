const https = require('https');

const url = 'https://news.guoyouwenduji.cc/articles/detail/?id=cbfa1640-e809-45f7-b277-cf712b0ff0ee';

https.get(url, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    // Look for the actual article content in RSC payload
    const rscMatch = data.match(/<script id="__next_f"[^>]*>([\s\S]*?)<\/script>/);
    console.log('=== __next_f script found ===');
    console.log(rscMatch ? 'YES, length: ' + rscMatch[1].length : 'NO');
    
    // Look for "文章详情" or article title in the raw HTML
    const titleMatch = data.match(/CBFA1640|e809|国游爆料深度解析|深度解析文章/);
    console.log('\n=== Article title found in HTML? ===');
    console.log(titleMatch ? 'Match found' : 'NOT FOUND');
    
    // Look for actual Chinese text content that would be the article body
    // Check for the article content from the database
    const contentIndicators = [
      'BW 2026',
      '名场面',
      'BW2026',
      'P4R',
      '漫威总裁',
      '中国游戏',
      '国产3A',
      '游戏评测',
    ];
    
    console.log('\n=== Content indicators found in HTML ===');
    for (const indicator of contentIndicators) {
      const found = data.includes(indicator);
      console.log('  ' + indicator + ': ' + (found ? 'YES' : 'NO'));
    }
    
    // Check what the actual rendered text looks like (remove all scripts, styles, HTML tags)
    let cleanText = data
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, '\n')
      .replace(/&[a-z]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('\n=== Cleaned visible text (first 1000 chars) ===');
    console.log(cleanText.substring(0, 1000));
    console.log('\n=== Total cleaned text length ===');
    console.log(cleanText.length);
  });
}).on('error', (e) => console.log('Error:', e.message));
