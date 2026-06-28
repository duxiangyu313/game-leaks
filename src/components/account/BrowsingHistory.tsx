"use client";

import { useState, useEffect } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Clock, Eye, Trash2 } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  link: string;
  type: "leak" | "article" | "game";
  time: string;
}

const KEY = "gylb_history";
const MAX = 30;

export function addHistory(item: Omit<HistoryItem, "time">) {
  try {
    const raw = localStorage.getItem(KEY);
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((h) => h.id !== item.id);
    filtered.unshift({ ...item, time: new Date().toISOString() });
    if (filtered.length > MAX) filtered.length = MAX;
    localStorage.setItem(KEY, JSON.stringify(filtered));
  } catch {}
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function BrowsingHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [now, setNow] = useState(0);

  // 每次面板打开（组件挂载）时读取 localStorage
  useEffect(() => {
    setItems(loadHistory());
    setNow(Date.now());
  }, []);

  // 监听其他标签页的 storage 变更
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY) {
        setItems(loadHistory());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const clear = () => {
    localStorage.removeItem(KEY);
    setItems([]);
  };

  const typeBadge = (t: string) => {
    switch (t) {
      case "leak": return { label: "爆料", cls: "bg-[#F59E0B]/10 text-[#F59E0B]" };
      case "article": return { label: "文章", cls: "bg-[#10B981]/10 text-[#10B981]" };
      case "game": return { label: "游戏", cls: "bg-[#06B6D4]/10 text-[#06B6D4]" };
      default: return { label: t, cls: "bg-[#64748B]/10 text-[#64748B]" };
    }
  };

  const timeAgo = (iso: string) => {
    const diff = now - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    return new Date(iso).toLocaleDateString("zh-CN");
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Eye className="w-10 h-10 text-[#334155] mx-auto mb-3" />
        <p className="text-sm text-[#64748B]">暂无浏览记录</p>
        <p className="text-xs text-[#475569] mt-1">浏览文章和爆料时会自动记录</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-[#64748B]">最近 {items.length} 条</span>
        <button onClick={clear} className="flex items-center gap-1 text-xs text-[#EF4444] hover:text-[#FCA5A5] transition-colors">
          <Trash2 className="w-3 h-3" /> 清空
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {items.map((item) => (
          <LinkNoPrefetch key={item.id} href={item.link} className="flex items-center gap-3 p-3 bg-[#0F172A]/60 rounded-lg hover:bg-[#1E293B] transition-colors group">
            <Clock className="w-3.5 h-3.5 text-[#475569] shrink-0" />
            <span className="flex-1 text-sm text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors truncate">{item.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeBadge(item.type).cls}`}>{typeBadge(item.type).label}</span>
            <span className="text-[10px] text-[#475569] w-14 text-right shrink-0">{timeAgo(item.time)}</span>
          </LinkNoPrefetch>
        ))}
      </div>
    </div>
  );
}
