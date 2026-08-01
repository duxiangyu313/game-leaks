const CACHE_NAME = "guoyou-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/homepage-cache.json", "/icons/icon-192.png", "/icons/icon-512.png"];

// 安装：预缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch 策略
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // 跳过 Supabase API 和 Stripe
  const url = new URL(event.request.url);
  if (url.hostname.includes("supabase") || url.hostname.includes("stripe")) return;

  // _next/static/ 用 cache-first（版本化文件名，永不变）
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 其他：network-first，失败回退缓存
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match("/"));
      })
  );
});
