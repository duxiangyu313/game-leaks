"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LastUpdated() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase
      .from("auto_update_logs")
      .select("run_at")
      .order("run_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLastUpdate(data[0].run_at);
        }
      });
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";
      await fetch(
        "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/auto-update",
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setLastUpdate(new Date().toISOString());
    } catch {
      // silent
    }
    setRefreshing(false);
  };

  if (!lastUpdate) return null;

  const formatted = new Date(lastUpdate).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-2 text-xs text-[#64748B]">
      <Clock className="w-3 h-3" />
      <span>数据更新于 {formatted}</span>
      <button
        onClick={refresh}
        disabled={refreshing}
        className="ml-1 p-0.5 hover:text-[#06B6D4] transition-colors"
        title="手动刷新"
      >
        <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
