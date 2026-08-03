"use client";

import Script from "next/script";

/**
 * SEO 预加载脚本
 * 在 React hydration 前运行，为爬虫注入文章/游戏的 SEO 数据
 * 
 * 工作流程：
 * 1. 页面加载时，此脚本立即执行（beforeInteractive）
 * 2. 从 URL 读取 id 参数
 * 3. 异步加载 seo-data.json
 * 4. 更新 title / description / canonical / og:* / JSON-LD
 * 5. 更新 fallback div 的 H1 和描述
 * 6. React hydrates 后接管，用真实内容替换 fallback
 */
export default function SEOPreloadScript() {
  return (
    <Script
      id="seo-preload"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  // 基础设置（同步）
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  var pathname = window.location.pathname;
  
  if (!id) return;
  
  // 确定内容类型
  var type = null;
  if (pathname.indexOf('/articles/detail') !== -1) type = 'articles';
  else if (pathname.indexOf('/games/detail') !== -1) type = 'games';
  else if (pathname.indexOf('/leaks/detail') !== -1) type = 'leaks';
  if (!type) return;
  
  // 构建完整 URL
  var fullUrl = window.location.origin + pathname + window.location.search;
  
  // 先设置基础 meta
  var typeName = type === 'articles' ? '文章' : '游戏';
  var baseDesc = '国游爆料' + typeName + '详情 — 国产3A游戏深度解析、评测、爆料与行业观察。';
  
  // 更新 canonical
  setLink('canonical', fullUrl);
  setMeta('og:url', fullUrl, 'property');
  
  // 异步加载 SEO 数据
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
      var desc = seo.description || baseDesc;
      setMeta('description', desc);
      setMeta('og:description', desc, 'property');
      
      // 更新 keywords
      if (seo.keywords) setMeta('keywords', seo.keywords);
      
      // 更新图片
      if (seo.coverImage) setMeta('og:image', seo.coverImage, 'property');
      
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
      
      // 更新 fallback 内容（给爬虫看）
      var titleEl = document.getElementById('seo-fallback-title');
      var descEl = document.getElementById('seo-fallback-desc');
      if (titleEl) titleEl.textContent = seo.title;
      if (descEl && seo.description) descEl.textContent = seo.description;
    })
    .catch(function() {});
  
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
        `,
      }}
    />
  );
}
