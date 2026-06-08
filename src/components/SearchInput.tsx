"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, router]);

  // Ctrl+K or / to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInputFocused())) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Compact search trigger — desktop */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-[#64748B] bg-[#1E293B]/50 hover:bg-[#1E293B] border border-[rgba(30,41,59,0.8)] hover:border-[rgba(6,182,212,0.3)] rounded-lg transition-all min-w-[180px]"
      >
        <Search className="w-4 h-4" />
        <span>搜索游戏、爆料…</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#0F172A] text-[#475569] border border-[rgba(30,41,59,0.6)]">/</kbd>
      </button>

      {/* Mobile: just icon */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="sm:hidden p-2 text-[#94A3B8] hover:text-[#F1F5F9]"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Expanded search panel */}
      {open && (
        <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:right-0 sm:w-96">
          {/* backdrop (mobile) */}
          <div className="sm:hidden absolute inset-0 bg-[#0F172A]/95" onClick={() => setOpen(false)} />
          <div className="relative sm:static bg-[#1A2332] border border-[rgba(30,41,59,0.8)] rounded-xl shadow-2xl p-3 mx-4 mt-20 sm:m-0">
            <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg px-3 py-2.5 border border-[rgba(30,41,59,0.6)]">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") doSearch(); if (e.key === "Escape") setOpen(false); }}
                placeholder="搜索游戏、爆料、文章…"
                className="flex-1 bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[#64748B] hover:text-[#F1F5F9] text-xs">✕</button>
              )}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-[#64748B]">搜索游戏库、爆料、深度文章</span>
              <button
                onClick={doSearch}
                disabled={!query.trim()}
                className="px-4 py-1.5 text-xs font-medium bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891B2] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isInputFocused() {
  const tag = document.activeElement?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
