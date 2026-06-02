"use client";

import { useState, useEffect, useRef } from "react";

const CACHE_PREFIX = "gc:";
const CACHE_TTL = 10 * 60 * 1000; // 10分钟过期

// ── 构建时首页缓存（首访秒开）────────────────────────────
let _homepageCache: Record<string, any> | null = null;
let _homepageLoading = false;
let _homepagePromise: Promise<Record<string, any>> | null = null;

async function fetchHomepageCache(): Promise<Record<string, any>> {
  if (_homepageCache) return _homepageCache;
  if (_homepagePromise) return _homepagePromise;

  _homepagePromise = fetch("/homepage-cache.json")
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then((data) => {
      _homepageCache = data;
      return data;
    });

  return _homepagePromise;
}

/** 从构建时 JSON 缓存中同步读取（如果已加载） */
export function getHomepageCached(key: string): any | undefined {
  return _homepageCache?.[key];
}

/** 预加载 homepage-cache.json（在 layout 中调用一次） */
export function preloadHomepageCache() {
  if (!_homepageCache && !_homepageLoading) {
    _homepageLoading = true;
    fetchHomepageCache();
  }
}

// ── localStorage 读写 ─────────────────────────────────
function lsGet<T>(key: string): { data: T; cacheHit: boolean } {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const entry = JSON.parse(raw);
      if (Date.now() - entry.ts < CACHE_TTL) {
        return { data: entry.data as T, cacheHit: true };
      }
    }
  } catch {}
  return { data: null as unknown as T, cacheHit: false };
}

function lsSet(key: string, data: any) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {}
}

// ── 核心 Hook ────────────────────────────────────────

/**
 * 三层缓存查询 Hook
 * 1. localStorage 缓存 → 毫秒级返回，用于回访用户
 * 2. 构建时 JSON → 秒级返回，用于首访用户
 * 3. Supabase 实时数据 → 后台静默更新
 *
 * @param key     唯一缓存键
 * @param fetcher Supabase 查询函数，返回 Promise<T>
 * @param fallback 兜底数据（MOCK）
 * @param homepageKey 构建时 JSON 中的键名（可选）
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => PromiseLike<T>,
  fallback: T,
  homepageKey?: string
): { data: T; loading: boolean } {
  const initRef = useRef(false);

  // 初始化：localStorage > 构建时缓存 > fallback
  const [data, setData] = useState<T>(() => {
    initRef.current = true;

    // 1. localStorage 缓存（回访用户）
    const ls = lsGet<T>(key);
    if (ls.cacheHit && ls.data) {
      return ls.data;
    }

    // 2. 构建时首页 JSON（首访用户）
    if (homepageKey) {
      const hp = getHomepageCached(homepageKey);
      if (hp) return hp as T;
    }

    return fallback;
  });

  const [loading, setLoading] = useState(() => {
    // 如果有 localStorage 或 homepage 缓存命中，不显示 loading
    const ls = lsGet<T>(key);
    if (ls.cacheHit && ls.data) return false;
    if (homepageKey && getHomepageCached(homepageKey)) return false;
    return true;
  });

  useEffect(() => {
    let cancelled = false;

    // 包装成标准 Promise 以支持 .catch()
    Promise.resolve(fetcher())
      .then((fresh) => {
        if (cancelled) return;
        setData(fresh);
        setLoading(false);
        lsSet(key, fresh);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        // 回退：如果 homepage 有数据但还没加载，尝试异步获取
        if (homepageKey && !getHomepageCached(homepageKey)) {
          fetchHomepageCache().then((cache) => {
            if (!cancelled && cache[homepageKey]) {
              setData(cache[homepageKey] as T);
            }
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { data, loading };
}
