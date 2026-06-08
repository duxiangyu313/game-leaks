"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Users, UserCheck, MessageCircle } from "lucide-react";

function getSessionId(): string {
  const key = "gylb_session";
  let id = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    try { localStorage.setItem(key, id!); } catch {}
  }
  return id!;
}

export default function ForumLiveStats() {
  const [online, setOnline] = useState(0);
  const [members, setMembers] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const sessionId = getSessionId();

    // 心跳：每 60 秒上报一次
    const heartbeat = async () => {
      try {
        // Upsert: update if session exists, insert if new
        const { data: existing } = await supabase
          .from("active_visitors")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existing) {
          await supabase.from("active_visitors").update({ last_seen: new Date().toISOString() }).eq("id", existing.id);
        } else {
          await supabase.from("active_visitors").insert({ session_id: sessionId, last_seen: new Date().toISOString() });
        }
      } catch {
        // table not ready yet
      }
    };

    // 查询在线人数
    const fetchStats = async () => {
      try {
        const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
        const { count: onlineCount } = await supabase
          .from("active_visitors")
          .select("id", { count: "exact", head: true })
          .gte("last_seen", fiveMinAgo);
        if (onlineCount !== null) setOnline(onlineCount);

        const { count: memberCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });
        if (memberCount !== null) setMembers(memberCount);
      } catch {
        // silent
      }
    };

    heartbeat();
    fetchStats();
    intervalRef.current = setInterval(() => { heartbeat(); fetchStats(); }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-[#10B981]" />
        <span>{online} 人在线</span>
      </div>
      <div className="flex items-center gap-1.5">
        <UserCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
        <span>{members} 位会员</span>
      </div>
    </div>
  );
}
