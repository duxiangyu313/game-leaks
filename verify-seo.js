const fs = require('fs');
const html = fs.readFileSync('d:/cc项目/.fourth.cc/next-game-site/live/articles/detail/index.html', 'utf8');

console.log('HTML size:', html.length, 'bytes');
console.log('');

// Check 1: Preload script exists
console.log('=== Check 1: Preload script ===');
console.log('seo-preload script:', html.includes('seo-preload') ? 'YES ✅' : 'NO ❌');

// Check 2: Fallback H1 exists
console.log('\n=== Check 2: Fallback H1 ===');
const h1Match = html.match(/<h1 id="seo-fallback-title"[^>]*>([\s\S]*?)<\/h1>/);
console.log('H1 fallback:', h1Match ? h1Match[1].trim() : 'NOT FOUND ❌');

// Check 3: Fallback description exists
console.log('\n=== Check 3: Fallback description ===');
const descMatch = html.match(/<p id="seo-fallback-desc"[^>]*>([\s\S]*?)<\/p>/);
console.log('Desc fallback:', descMatch ? descMatch[1].trim() : 'NOT FOUND ❌');

// Check 4: Canonical in HTML
console.log('\n=== Check 4: Canonical ===');
const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
console.log('Canonical:', canonMatch ? canonMatch[1] : 'NOT FOUND ❌');

// Check 5: Title
console.log('\n=== Check 5: Title ===');
const titleMatch = html.match(/<title>([^<]*)<\/title>/);
console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND ❌');

// Check 6: Other SEO indicators
console.log('\n=== Check 6: Other SEO indicators ===');
console.log('Has seo-data.json ref:', html.includes('seo-data.json') ? 'YES ✅' : 'NO ❌');
console.log('Has og:title:', html.includes('og:title') ? 'YES ✅' : 'NO ❌');
console.log('Has og:description:', html.includes('og:description') ? 'YES ✅' : 'NO ❌');
console.log('Has JSON-LD:', html.includes('application/ld+json') ? 'YES ✅' : 'NO ❌');
console.log('Has keywords:', html.includes('keywords') ? 'YES ✅' : 'NO ❌');

// Check 7: Clean text content
const cleanText = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

console.log('\n=== Check 7: Visible text content ===');
console.log('Text length:', cleanText.length, 'chars');
console.log('First 300 chars:', cleanText.substring(0, 300));
