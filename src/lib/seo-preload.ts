/**
 * SEO 预加载脚本
 * 在 React hydration 前运行，确保搜索引擎爬虫能在静态 HTML 中看到文章/游戏的 meta 信息
 * 
 * 使用方式：在 layout.tsx 中以 <script dangerouslySetInnerHTML> 方式注入
 * 或者通过 <Script strategy="beforeInteractive"> 注入
 */

export const seoPreloadScript = `
(function() {
  // 1. 从 URL 获取 id 参数
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var pathname = window.location.pathname;
  
  if (!id) return;
  
  // 2. 确定内容类型（articles/detail, games/detail, leaks/detail）
  var type = null;
  if (pathname.includes('/articles/detail')) type = 'articles';
  else if (pathname.includes('/games/detail')) type = 'games';
  else if (pathname.includes('/leaks/detail')) type = 'leaks';
  if (!type) return;
  
  // 3. 构建完整 URL（用于 canonical 和 og:url）
  var fullUrl = window.location.origin + pathname + window.location.search;
  
  // 4. 先设置基础 meta（在数据加载前）
  document.title = '加载中... · 国游爆料';
  setMeta('description', '国游爆料 ' + type.replace('articles','文章').replace('games','游戏') + '详情 — 国产3A游戏深度解析、评测、爆料与行业观察。');
  setLink('canonical', fullUrl);
  setMeta('og:url', fullUrl, 'property');
  
  // 5. 预加载 SEO 数据并注入
  fetch('/seo-data.json', { cache: 'force-cache' })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var seo = null;
      if (type === 'articles') seo = data.articles && data.articles[id];
      else if (type === 'games') seo = data.games && data.games[id];
      
      if (!seo) return;
      
      // 更新 title
      var title = seo.title + ' · 国游爆料';
      document.title = title;
      setMeta('og:title', title, 'property');
      
      // 更新 description
      if (seo.description) {
        setMeta('description', seo.description);
        setMeta('og:description', seo.description, 'property');
      }
      
      // 更新 keywords
      if (seo.keywords) {
        setMeta('keywords', seo.keywords);
      }
      
      // 更新图片
      if (seo.coverImage) {
        setMeta('og:image', seo.coverImage, 'property');
      }
      
      // 注入 JSON-LD
      if (seo.jsonLd) {
        var existing = document.getElementById('seo-preload-jsonld');
        if (existing) existing.remove();
        var script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'seo-preload-jsonld';
        script.textContent = JSON.stringify(seo.jsonLd);
        document.head.appendChild(script);
      }
      
      // 更新页面可见的 fallback 内容
      var fallback = document.getElementById('seo-preload-fallback');
      if (fallback) {
        var h1 = fallback.querySelector('.seo-h1');
        var desc = fallback.querySelector('.seo-desc');
        if (h1) h1.textContent = seo.title;
        if (desc && seo.description) desc.textContent = seo.description;
        fallback.style.display = 'block';
      }
    })
    .catch(function() { /* 静默失败，不影响页面渲染 */ });
  
  // 辅助函数
  function setMeta(name, content, attr) {
    attr = attr || 'name';
    var tag = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (tag) {
      tag.setAttribute('content', content);
    } else {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      tag.setAttribute('content', content);
      document.head.appendChild(tag);
    }
  }
  
  function setLink(rel, href) {
    var tag = document.querySelector('link[rel="' + rel + '"]');
    if (tag) {
      tag.setAttribute('href', href);
    } else {
      tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      tag.setAttribute('href', href);
      document.head.appendChild(tag);
    }
  }
})();
`;
