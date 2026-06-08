"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

export default function LiveSignal() {
  const [lastTime, setLastTime] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("leaks")
      .select("published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLastTime(data[0].published_at);
        }
      });
  }, []);

  if (!lastTime) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
      </span>
      <span className="text-xs text-[#64748B]">
        最新爆料 · <span className="text-[#94A3B8]">{timeAgo(lastTime)}</span>
      </span>
    </div>
  );
}
