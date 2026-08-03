"use client";

import { useEffect, useState, useCallback } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Bell, BellRing, ChevronDown, ChevronUp, Mail, X } from "lucide-react";

const COLORS: Record<string, string> = {
  release: "#10B981", beta: "#8B5CF6", livestream: "#06B6D4", conference: "#E94560", demo: "#F59E0B", update: "#22D3EE", other: "#64748B",
};
const LABELS: Record<string, string> = {
  release: "发售", beta: "测试", livestream: "直播", conference: "展会", demo: "试玩", update: "更新", other: "其他",
};

export default function CalendarPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState("all");

  // 订阅相关状态
  const [subscriptions, setSubscriptions] = useState<Record<string, { id: string; notify_days: number }>>({});
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [subscribingEvent, setSubscribingEvent] = useState<string | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [subNotifyDays, setSubNotifyDays] = useState(3);
  const [subError, setSubError] = useState("");
  const [subSuccess, setSubSuccess] = useState("");

  // 获取当前用户邮箱
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setSubEmail(session.user.email);
      }
    }).catch(() => {});
  }, []);

  // 加载事件
  useEffect(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 2 > 12 ? 1 : month + 2).padStart(2, "0")}-01`;
    supabase.from("game_events").select("*, games(title)").gte("event_date", start).lt("event_date", end).order("event_date").then(({ data }) => {
      setEvents(data || []); setLoading(false);
    });
  }, [month, year]);

  // 加载用户已有的订阅
  const loadSubscriptions = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;
    const { data } = await supabase
      .from("event_subscriptions")
      .select("id, event_id, notify_days")
      .eq("email", session.user.email);
    if (data) {
      const map: Record<string, { id: string; notify_days: number }> = {};
      data.forEach(s => { map[s.event_id] = { id: s.id, notify_days: s.notify_days }; });
      setSubscriptions(map);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const filtered = filter === "all" ? events : events.filter(e => e.event_type === filter);

  // 订阅事件
  const handleSubscribe = async (eventId: string) => {
    setSubError("");
    setSubSuccess("");
    if (!subEmail.trim()) {
      setSubError("请输入邮箱地址");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from("event_subscriptions")
      .insert({
        event_id: eventId,
        email: subEmail.trim(),
        user_id: session?.user?.id || null,
        notify_days: subNotifyDays,
        notified: false,
      })
      .select("id, event_id, notify_days")
      .single();
    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        setSubError("你已经订阅过这个事件了");
      } else {
        setSubError("订阅失败：" + error.message);
      }
      return;
    }
    if (data) {
      setSubscriptions(prev => ({ ...prev, [eventId]: { id: data.id, notify_days: data.notify_days } }));
      setSubSuccess("订阅成功！我们会在事件前 " + subNotifyDays + " 天发送邮件提醒你");
      setTimeout(() => { setSubSuccess(""); setSubscribingEvent(null); }, 2500);
    }
  };

  // 取消订阅
  const handleUnsubscribe = async (eventId: string) => {
    const sub = subscriptions[eventId];
    if (!sub) return;
    await supabase.from("event_subscriptions").delete().eq("id", sub.id);
    setSubscriptions(prev => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  };

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <CalendarIcon className="w-7 h-7 text-[#06B6D4]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">发售日历</h1>
        </div>
        <p className="text-[#94A3B8] mb-8">国产3A游戏重要节点一览 · 点击「提醒我」设置邮件通知</p>

        {/* 我的订阅面板（可折叠） */}
        {Object.keys(subscriptions).length > 0 && (
          <div className="mb-6 rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/5 overflow-hidden">
            <button
              onClick={() => setShowSubPanel(!showSubPanel)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-sm font-medium text-[#F1F5F9]">我的订阅（{Object.keys(subscriptions).length}）</span>
              </div>
              {showSubPanel ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
            </button>
            {showSubPanel && (
              <div className="px-4 pb-4 space-y-2">
                {events.filter(e => subscriptions[e.id]).map(e => (
                  <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#0D1117]/50">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: COLORS[e.event_type] || "#64748B" }}>{LABELS[e.event_type] || e.event_type}</span>
                    <span className="text-sm text-[#F1F5F9] flex-1 truncate">{e.title}</span>
                    <span className="text-xs text-[#64748B]">提前{subscriptions[e.id].notify_days}天</span>
                    <button onClick={() => handleUnsubscribe(e.id)} className="text-xs text-[#E94560] hover:text-red-400">取消</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 rounded-lg hover:bg-[#1E293B]/50 text-[#94A3B8]"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-[#F1F5F9]">{year}年{month + 1}月</h2>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 rounded-lg hover:bg-[#1E293B]/50 text-[#94A3B8]"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "release", "beta", "demo", "conference", "livestream"].map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${filter === t ? "bg-[#06B6D4] text-white" : "bg-[#1E293B]/40 text-[#94A3B8] hover:text-[#F1F5F9]"}`}>
                {t === "all" ? "全部" : LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">本月暂无事件</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => (
              <div key={e.id} className="glass-card p-4 flex items-center gap-4 group">
                <LinkNoPrefetch href={e.game_id ? `/games/detail?id=${e.game_id}` : "#"} className="flex items-center gap-4 flex-1 min-w-0 hover:border-[#06B6D4]/20 transition-all">
                  <div className="text-center shrink-0 w-16">
                    <div className="text-2xl font-black text-[#F1F5F9]">{new Date(e.event_date).getDate()}</div>
                    <div className="text-xs text-[#64748B]">{new Date(e.event_date).toLocaleDateString("zh-CN", { weekday: "short" })}</div>
                  </div>
                  <div className="w-1 h-10 rounded" style={{ backgroundColor: COLORS[e.event_type] || "#64748B" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: COLORS[e.event_type] || "#64748B" }}>{LABELS[e.event_type] || e.event_type}</span>
                      {e.games?.title && <span className="text-xs text-[#06B6D4]">{e.games.title}</span>}
                    </div>
                    <h3 className="font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">{e.title}</h3>
                    {e.description && <p className="text-xs text-[#64748B] mt-1">{e.description}</p>}
                  </div>
                  <Clock className="w-4 h-4 text-[#64748B] shrink-0" />
                </LinkNoPrefetch>

                {/* 提醒按钮 */}
                {subscriptions[e.id] ? (
                  <button
                    onClick={() => handleUnsubscribe(e.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#06B6D4]/15 text-[#06B6D4] hover:bg-[#06B6D4]/25 transition-all"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    已订阅
                  </button>
                ) : (
                  <button
                    onClick={() => { setSubscribingEvent(subscribingEvent === e.id ? null : e.id); setSubError(""); setSubSuccess(""); }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#1E293B]/50 text-[#94A3B8] hover:text-[#06B6D4] hover:bg-[#06B6D4]/10 transition-all"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    提醒我
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 订阅弹窗 */}
        {subscribingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSubscribingEvent(null)}>
            <div className="w-full max-w-md mx-4 rounded-2xl border border-[#1E293B] bg-[#0D1117] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/15 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F5F9]">设置邮件提醒</h3>
                </div>
                <button onClick={() => setSubscribingEvent(null)} className="text-[#64748B] hover:text-[#F1F5F9]"><X className="w-5 h-5" /></button>
              </div>

              <p className="text-sm text-[#94A3B8] mb-4">
                输入邮箱，我们会在事件发生前提前通知你
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block">邮箱地址</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="email"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#334155] text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#06B6D4]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#94A3B8] mb-1.5 block">提前几天提醒？</label>
                  <div className="flex gap-2">
                    {[1, 3, 7, 14].map(d => (
                      <button
                        key={d}
                        onClick={() => setSubNotifyDays(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${subNotifyDays === d ? "bg-[#06B6D4] text-white" : "bg-[#1E293B]/50 text-[#94A3B8] hover:text-[#F1F5F9]"}`}
                      >
                        {d}天
                      </button>
                    ))}
                  </div>
                </div>
                {subError && <p className="text-sm text-[#E94560]">{subError}</p>}
                {subSuccess && <p className="text-sm text-[#10B981]">{subSuccess}</p>}
                <button
                  onClick={() => handleSubscribe(subscribingEvent)}
                  className="w-full py-2.5 rounded-lg bg-[#06B6D4] text-white text-sm font-bold hover:bg-[#0891B2] transition-all"
                >
                  确认订阅
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
