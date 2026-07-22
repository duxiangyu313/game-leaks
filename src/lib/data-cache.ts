/* eslint-disable @typescript-eslint/no-explicit-any -- 泛型缓存层，Record<string, any> 为 JSON 数据的合理类型 */
"use client";

import { useState, useEffect, useRef, startTransition } from "react";

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
 * 1. 构建时 JSON → 秒级返回，用于首访用户（SSR/CSR 一致，避免 hydration mismatch）
 * 2. localStorage 缓存 → 客户端 mount 后异步恢复，用于回访用户
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
  // 保持 fetcher/homepageKey 在 ref 中，避免 deps 变化导致无限请求
  const fetcherRef = useRef(fetcher);
  const homepageKeyRef = useRef(homepageKey);
  // ref 同步必须在 effect 中进行，避免 render 期间修改 ref
  useEffect(() => {
    fetcherRef.current = fetcher;
    homepageKeyRef.current = homepageKey;
  });

  // 初始化：始终使用 fallback，确保 SSR/CSR 首帧完全一致（hydration 安全）
  // 构建时缓存 + localStorage 在 useEffect 中异步恢复
  const [data, setData] = useState<T>(fallback);

  // 始终从 loading:true 开始，确保 SSR/CSR 首帧一致（hydration 安全）
  // 构建时缓存数据已在 data 初始化器中注入，loading 由 useEffect 在客户端关闭
  const [loading, setLoading] = useState(true);

  // 客户端 mount 后：按优先级恢复缓存（homepage 构建缓存 > localStorage > Supabase）
  useEffect(() => {
    let cancelled = false;

    // 1) 构建时首页 JSON 缓存（首访问用户秒开）
    const hk = homepageKeyRef.current;
    if (hk) {
      const hp = getHomepageCached(hk);
      if (hp) {
        setData(hp as T);
        setLoading(false);
        // 有 homepage 缓存仍查 Supabase 保证新鲜度
        Promise.resolve(fetcherRef.current())
          .then((fresh) => { if (!cancelled) { setData(fresh); lsSet(key, fresh); } })
          .catch(() => {});
        return () => { cancelled = true; };
      }
    }

    // 2) localStorage 缓存（回访用户秒开）
    const ls = lsGet<T>(key);
    if (ls.cacheHit && ls.data) {
      startTransition(() => {
        setData(ls.data);
        setLoading(false);
      });
    }

    // 包装成标准 Promise 以支持 .catch()
    Promise.resolve(fetcherRef.current())
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
        if (homepageKeyRef.current && !getHomepageCached(homepageKeyRef.current)) {
          fetchHomepageCache().then((cache) => {
            if (!cancelled && cache[homepageKeyRef.current!]) {
              setData(cache[homepageKeyRef.current!] as T);
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
