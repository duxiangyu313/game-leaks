"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Users, UserCheck, MessageCircle } from "lucide-react";

const MOCK_STATS = { online: 186, members: 3421, todayPosts: 47 };

function getSessionId(): string {
  const key = "gylb_session";
  let id = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    try { localStorage.setItem(key, id!); } catch {}
  }
  return id!;
}

export default function ForumLiveStats({ large }: { large?: boolean }) {
  const [online, setOnline] = useState(MOCK_STATS.online);
  const [members, setMembers] = useState(MOCK_STATS.members);
  const [todayPosts, setTodayPosts] = useState(MOCK_STATS.todayPosts);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const sessionId = getSessionId();

    const heartbeat = async () => {
      try {
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
      } catch { /* table not ready */ }
    };

    const fetchStats = async () => {
      try {
        const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
        const today = new Date().toISOString().split("T")[0];

        const [{ count: o }, { count: m }, { count: tp }] = await Promise.all([
          supabase.from("active_visitors").select("id", { count: "exact", head: true }).gte("last_seen", fiveMinAgo),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("forum_posts").select("id", { count: "exact", head: true }).gte("created_at", today),
        ]);
        if (o !== null) setOnline(o);
        if (m !== null) setMembers(m);
        if (tp !== null) setTodayPosts(tp);
      } catch {
        setOnline(MOCK_STATS.online);
        setMembers(MOCK_STATS.members);
        setTodayPosts(MOCK_STATS.todayPosts);
      }
    };

    heartbeat();
    fetchStats();
    intervalRef.current = setInterval(() => { heartbeat(); fetchStats(); }, 60000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (large) {
    const stats = [
      { icon: Users, label: "在线用户", count: online, color: "text-[#10B981]", bg: "from-[#10B981]/10 to-[#059669]/5" },
      { icon: UserCheck, label: "注册会员", count: members, color: "text-[#06B6D4]", bg: "from-[#06B6D4]/10 to-[#0891B2]/5" },
      { icon: MessageCircle, label: "今日帖子", count: todayPosts, color: "text-[#F59E0B]", bg: "from-[#F59E0B]/10 to-[#D97706]/5" },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-6 flex items-center gap-4 bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}>
            <div className={`w-12 h-12 rounded-xl bg-[#1E293B]/60 flex items-center justify-center`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#F1F5F9] tabular-nums">{s.count.toLocaleString()}</div>
              <div className="text-sm text-[#94A3B8]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
