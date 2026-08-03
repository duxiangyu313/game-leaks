const fs = require('fs');

function checkPage(name, path) {
  const html = fs.readFileSync(path, 'utf8');
  console.log('=== ' + name + ' ===');
  console.log('  seo-preload:', html.includes('seo-preload') ? 'YES ✅' : 'NO ❌');
  console.log('  H1 fallback:', html.includes('seo-fallback-title') ? 'YES ✅' : 'NO ❌');
  console.log('  Desc fallback:', html.includes('seo-fallback-desc') ? 'YES ✅' : 'NO ❌');
  console.log('  og:title:', html.includes('og:title') ? 'YES ✅' : 'NO ❌');
  console.log('  og:description:', html.includes('og:description') ? 'YES ✅' : 'NO ❌');
  console.log('  canonical:', html.includes('canonical') ? 'YES ✅' : 'NO ❌');
  console.log('  JSON-LD:', html.includes('application/ld+json') ? 'YES ✅' : 'NO ❌');
  console.log('');
}

checkPage('articles/detail', 'live/articles/detail/index.html');
checkPage('games/detail', 'live/games/detail/index.html');
checkPage('leaks/detail', 'live/leaks/detail/index.html');
