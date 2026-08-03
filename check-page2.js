const https = require('https');

const url = 'https://news.guoyouwenduji.cc/articles/detail/?id=cbfa1640-e809-45f7-b277-cf712b0ff0ee';

https.get(url, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    // Extract CSP meta
    const cspMatch = data.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/);
    console.log('=== CSP Meta ===');
    console.log(cspMatch ? cspMatch[1] : 'NOT FOUND');
    
    // Extract canonical
    const canonMatch = data.match(/<link rel="canonical" href="([^"]*)"/);
    console.log('\n=== Canonical ===');
    console.log(canonMatch ? canonMatch[1] : 'NOT FOUND');
    
    // Check for loading state content
    const loadingMatch = data.match(/<div[^>]*class="[^"]*(?:loading|skeleton|spinner)[^"]*"[^>]*>/i);
    console.log('\n=== Loading/Skeleton ===');
    console.log(loadingMatch ? loadingMatch[0].substring(0, 200) : 'NOT FOUND');
    
    // Check actual article content
    const articleContent = data.match(/<article[^>]*>([\s\S]*?)<\/article>/);
    console.log('\n=== Article tag content length ===');
    console.log(articleContent ? articleContent[1].length + ' chars' : 'NO ARTICLE TAG');
    
    // Check for actual text content (not just HTML tags)
    const textContent = data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('\n=== Visible text content (first 500 chars) ===');
    console.log(textContent.substring(0, 500));
    
    console.log('\n=== Total text length ===');
    console.log(textContent.length + ' chars');
  });
}).on('error', (e) => console.log('Error:', e.message));
