"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, TrendingUp, Users, DollarSign, Play } from "lucide-react";

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, creatorCount: 0, pendingPayout: 0 });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    const { data: records } = await supabase.from("revenue_records").select("amount, settlement_status");
    if (records) {
      const total = records.reduce((s: number, r) => s + (r.amount || 0), 0);
      const pending = records.filter((r) => r.settlement_status === "pending").reduce((s: number, r) => s + (r.amount || 0), 0);
      setStats({ totalRevenue: total, creatorCount: 0, pendingPayout: pending });
    }
    // profiles 表已简化（revenue_balance 列已移除），有余额创作者数改由收益记录估算
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadStats(); }, []);

  const runCalculation = async () => {
    setRunning(true); setResult(null);
    const { data, error } = await supabase.rpc("calculate_revenue");
    if (error) { setResult(`错误: ${error.message}`); }
    else if (data) {
      const result = data as { records_created?: number; total_amount?: number };
      setResult(`计算完成！生成 ${result.records_created || 0} 条记录，总金额 ¥${((result.total_amount || 0) / 100).toFixed(2)}`);
    }
    setRunning(false);
    loadStats();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">收益管理</h1><p className="text-sm text-[#64748B] mt-1">创作者收益概览 · 月度结算</p></div>
        <button onClick={runCalculation} disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] text-sm font-semibold hover:bg-[#10B981]/25 disabled:opacity-50 transition-all">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "计算中..." : "运行月度结算"}
        </button>
      </div>
      {result && <div className="mb-4 px-4 py-3 rounded-lg bg-[#10B981]/10 text-sm text-[#10B981]">{result}</div>}
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" /></div> : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[{ icon: DollarSign, color: "text-[#10B981]", label: "累计收益", val: `¥${(stats.totalRevenue / 100).toFixed(2)}` },
              { icon: Users, color: "text-[#3B82F6]", label: "创作者", val: String(stats.creatorCount) },
              { icon: TrendingUp, color: "text-[#F59E0B]", label: "待结算", val: `¥${(stats.pendingPayout / 100).toFixed(2)}` }]
              .map(s => (
                <div key={s.label} className="glass-card p-5">
                  <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1"><s.icon className={`w-4 h-4 ${s.color}`} />{s.label}</div>
                  <div className="text-2xl font-bold text-[#F1F5F9]">{s.val}</div>
                </div>
              ))}
          </div>
          <div className="glass-card p-8 text-center">
            <TrendingUp className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-40" />
            <p className="text-[#64748B] text-sm">点击上方 &ldquo;运行月度结算&rdquo; 手动触发，或配置 Supabase Cron 每月 1 号自动执行。</p>
            <p className="text-[#475569] text-xs mt-1">免费 100%广告 · 黄金 25%会员 · 钻石 40%（分3月）</p>
          </div>
        </>
      )}
    </div>
  );
}
