// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFollowedGames } from "../useFollowedGames";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useFollowedGames", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("初始状态为空数组", () => {
    const { result } = renderHook(() => useFollowedGames());
    expect(result.current.followed).toEqual([]);
  });

  it("toggle 添加游戏", () => {
    const { result } = renderHook(() => useFollowedGames());
    act(() => {
      result.current.toggle("game-1");
    });
    expect(result.current.followed).toEqual(["game-1"]);
    expect(result.current.isFollowed("game-1")).toBe(true);
  });

  it("toggle 移除游戏", () => {
    const { result } = renderHook(() => useFollowedGames());
    act(() => {
      result.current.toggle("game-1");
      result.current.toggle("game-1");
    });
    expect(result.current.followed).toEqual([]);
    expect(result.current.isFollowed("game-1")).toBe(false);
  });

  it("持久化到 localStorage", () => {
    const { result } = renderHook(() => useFollowedGames());
    act(() => {
      result.current.toggle("game-1");
    });
    const stored = JSON.parse(localStorage.getItem("gc:followed_games") || "[]");
    expect(stored).toEqual(["game-1"]);
  });

  it("从 localStorage 恢复", () => {
    localStorage.setItem("gc:followed_games", JSON.stringify(["game-2"]));
    const { result } = renderHook(() => useFollowedGames());
    expect(result.current.followed).toEqual(["game-2"]);
  });
});
