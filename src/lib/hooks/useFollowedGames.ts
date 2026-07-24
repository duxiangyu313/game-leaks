"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "gc:followed_games";

/**
 * 收藏/关注游戏的自定义 hook。
 * 数据持久化到 localStorage，跨会话保留。
 */
export function useFollowedGames() {
  const [followed, setFollowed] = useState<string[]>([]);

  // 初始化：从 localStorage 读取
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFollowed(parsed);
        }
      }
    } catch {
      // localStorage 不可用或数据损坏，忽略
    }
  }, []);

  // 同步到 localStorage
  const syncToStorage = useCallback((ids: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // 忽略写入失败
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setFollowed((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        syncToStorage(next);
        return next;
      });
    },
    [syncToStorage]
  );

  const isFollowed = useCallback(
    (id: string) => followed.includes(id),
    [followed]
  );

  return { followed, toggle, isFollowed };
}
