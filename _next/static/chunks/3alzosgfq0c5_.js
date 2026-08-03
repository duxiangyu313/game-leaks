(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,8341,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={cancelIdleCallback:function(){return l},requestIdleCallback:function(){return i}};for(var a in n)Object.defineProperty(r,a,{enumerable:!0,get:n[a]});let i="u">typeof self&&self.requestIdleCallback&&self.requestIdleCallback.bind(window)||function(e){let t=Date.now();return self.setTimeout(function(){e({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-t))}})},1)},l="u">typeof self&&self.cancelIdleCallback&&self.cancelIdleCallback.bind(window)||function(e){return clearTimeout(e)};("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},19083,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={ESCAPE_REGEX:function(){return l},htmlEscapeAttributeString:function(){return d},htmlEscapeJsonString:function(){return c}};for(var a in n)Object.defineProperty(r,a,{enumerable:!0,get:n[a]});let i={"&":"\\u0026",">":"\\u003e","<":"\\u003c","\u2028":"\\u2028","\u2029":"\\u2029"},l=/[&><\u2028\u2029]/g,o={"&":"&amp;",'"':"&quot;","'":"&#39;","<":"&lt;",">":"&gt;"},s=/[&"'<>]/g;function c(e){return e.replace(l,e=>i[e])}function d(e){return e.replace(s,e=>o[e])}},79520,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={default:function(){return _},handleClientScriptLoad:function(){return h},initScriptLoader:function(){return b}};for(var a in n)Object.defineProperty(r,a,{enumerable:!0,get:n[a]});let i=e.r(55682),l=e.r(90809),o=e.r(18050),s=i._(e.r(74080)),c=l._(e.r(71645)),d=e.r(42732),u=e.r(22737),f=e.r(8341),p=e.r(19083),g=new Map,m=new Set,y=e=>{let{src:t,id:r,onLoad:n=()=>{},onReady:a=null,dangerouslySetInnerHTML:i,children:l="",strategy:o="afterInteractive",onError:c,stylesheets:d}=e,f=r||t;if(f&&m.has(f))return;if(g.has(t)){m.add(f),g.get(t).then(n,c);return}let p=()=>{a&&a(),m.add(f)},y=document.createElement("script"),h=new Promise((e,t)=>{y.addEventListener("load",function(t){e(),n&&n.call(this,t),p()}),y.addEventListener("error",function(e){t(e)})}).catch(function(e){c&&c(e)});i?(y.innerHTML=i.__html||"",p()):l?(y.textContent="string"==typeof l?l:Array.isArray(l)?l.join(""):"",p()):t&&(y.src=t,g.set(t,h)),(0,u.setAttributesFromProps)(y,e),"worker"===o&&y.setAttribute("type","text/partytown"),y.setAttribute("data-nscript",o),d&&(e=>{if(s.default.preinit)return e.forEach(e=>{s.default.preinit(e,{as:"style"})});if("u">typeof window){let t=document.head;e.forEach(e=>{let r=document.createElement("link");r.type="text/css",r.rel="stylesheet",r.href=e,t.appendChild(r)})}})(d),document.body.appendChild(y)};function h(e){let{strategy:t="afterInteractive"}=e;"lazyOnload"===t?window.addEventListener("load",()=>{(0,f.requestIdleCallback)(()=>y(e))}):y(e)}function b(e){e.forEach(h),[...document.querySelectorAll('[data-nscript="beforeInteractive"]'),...document.querySelectorAll('[data-nscript="beforePageRender"]')].forEach(e=>{let t=e.id||e.getAttribute("src");m.add(t)})}function v(e){let{id:t,src:r="",onLoad:n=()=>{},onReady:a=null,strategy:i="afterInteractive",onError:l,stylesheets:u,...g}=e,{updateScripts:h,scripts:b,getIsSsr:v,appDir:_,nonce:E}=(0,c.useContext)(d.HeadManagerContext);E=g.nonce||E;let w=(0,c.useRef)(!1);(0,c.useEffect)(()=>{let e=t||r;w.current||(a&&e&&m.has(e)&&a(),w.current=!0)},[a,t,r]);let O=(0,c.useRef)(!1);if((0,c.useEffect)(()=>{if(!O.current){if("afterInteractive"===i)y(e);else"lazyOnload"===i&&("complete"===document.readyState?(0,f.requestIdleCallback)(()=>y(e)):window.addEventListener("load",()=>{(0,f.requestIdleCallback)(()=>y(e))}));O.current=!0}},[e,i]),("beforeInteractive"===i||"worker"===i)&&(h?(b[i]=(b[i]||[]).concat([{id:t,src:r,onLoad:n,onReady:a,onError:l,...g,nonce:E}]),h(b)):v&&v()?m.add(t||r):v&&!v()&&y({...e,nonce:E})),_){if(u&&u.forEach(e=>{s.default.preinit(e,{as:"style"})}),"beforeInteractive"===i)if(!r)return g.dangerouslySetInnerHTML&&(g.children=g.dangerouslySetInnerHTML.__html,delete g.dangerouslySetInnerHTML),(0,o.jsx)("script",{nonce:E,dangerouslySetInnerHTML:{__html:`(self.__next_s=self.__next_s||[]).push(${(0,p.htmlEscapeJsonString)(JSON.stringify([0,{...g,id:t}]))})`}});else return s.default.preload(r,g.integrity?{as:"script",integrity:g.integrity,nonce:E,crossOrigin:g.crossOrigin}:{as:"script",nonce:E,crossOrigin:g.crossOrigin}),(0,o.jsx)("script",{nonce:E,dangerouslySetInnerHTML:{__html:`(self.__next_s=self.__next_s||[]).push(${(0,p.htmlEscapeJsonString)(JSON.stringify([r,{...g,id:t}]))})`}});"afterInteractive"===i&&r&&s.default.preload(r,g.integrity?{as:"script",integrity:g.integrity,nonce:E,crossOrigin:g.crossOrigin}:{as:"script",nonce:E,crossOrigin:g.crossOrigin})}return null}Object.defineProperty(v,"__nextScript",{value:!0});let _=v;("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},3303,(e,t,r)=>{t.exports=e.r(79520)},91612,e=>{"use strict";var t=e.i(18050),r=e.i(3303);e.s(["default",0,function(){return(0,t.jsx)(r.default,{id:"seo-preload",strategy:"beforeInteractive",dangerouslySetInnerHTML:{__html:`
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
      var title = seo.title + ' \xb7 国游爆料';
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
        `}})}])}]);