"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// 热门游戏列表供选择
const TRENDING_GAMES = ["归唐", "影之刃零", "黑神话：悟空", "湮灭之潮", "黑神话：钟馗", "失落之魂"];

export default function EmailSubscribe({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggleGame = (g: string) => {
    setSelected((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setMessage("请输入有效的邮箱地址");
      return;
    }
    setStatus("loading");

    const { error } = await supabase.from("email_subscriptions").insert({
      email: email.trim(),
      game_ids: selected,
      send_all: selected.length === 0,
    });

    if (error) {
      if (error.code === "23505") {
        setStatus("done");
        setMessage("你已经订阅过了，有新爆料会通知你！");
      } else {
        setStatus("error");
        setMessage(error.message);
      }
    } else {
      setStatus("done");
      setMessage("订阅成功！有新动态会发邮件通知你。");
      setEmail("");
      setSelected([]);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4] transition-all";

  if (compact) {
    // 紧凑版：首页内嵌
    return (
      <div className="bg-gradient-to-r from-[#1A2332] to-[#1E293B] border border-[rgba(30,41,59,0.6)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-[#06B6D4]" />
          <h3 className="text-base font-semibold text-[#F1F5F9]">不想错过国产3A最新动态？</h3>
        </div>
        <p className="text-sm text-[#94A3B8] mb-4">订阅邮件通知，新爆料、发售日变动、独家解析第一时间送达。</p>

        {status === "done" ? (
          <div className="flex items-center gap-2 text-[#10B981] text-sm py-2">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        ) : status === "error" ? (
          <div className="flex items-center gap-2 text-[#EF4444] text-sm py-2">
            <AlertCircle className="w-4 h-4" /> {message}
            <button onClick={() => setStatus("idle")} className="underline">重试</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="你的邮箱地址"
              className={`${inputClass} flex-1`}
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 py-3 bg-[#06B6D4] hover:bg-[#0891B2] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 shrink-0"
            >
              {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "订阅"}
            </button>
          </form>
        )}
        <p className="text-xs text-[#475569] mt-3">不发送垃圾邮件，随时可退订。</p>
      </div>
    );
  }

  // 完整版：/subscribe 页面
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <Mail className="w-12 h-12 text-[#06B6D4] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">订阅邮件通知</h1>
        <p className="text-[#94A3B8] text-sm">选择你关注的游戏，有新动态时邮件通知你。</p>
      </div>

      {status === "done" ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">订阅成功！</h2>
          <p className="text-[#94A3B8]">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-2">邮箱地址</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#F1F5F9] mb-3">
              关注游戏 <span className="text-[#64748B] font-normal">（可选，不选则接收所有）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TRENDING_GAMES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGame(g)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selected.includes(g)
                      ? "bg-[#06B6D4]/20 border-[#06B6D4] text-[#06B6D4]"
                      : "bg-[#0F172A] border-[rgba(30,41,59,0.6)] text-[#94A3B8] hover:border-[#475569]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-[#EF4444] text-sm">
              <AlertCircle className="w-4 h-4" /> {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {status === "loading" ? "提交中…" : "立即订阅"}
          </button>

          <p className="text-xs text-[#475569] text-center">不发送垃圾邮件，随时可退订。</p>
        </form>
      )}
    </div>
  );
}
