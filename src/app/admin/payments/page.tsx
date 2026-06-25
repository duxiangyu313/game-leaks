"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAdmin } from "@/components/admin/AdminAuth";
import { Check, X, Loader2, RefreshCw, Clock, Phone } from "lucide-react";

const APPROVE_FN = "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/approve-payment";

interface Confirmation {
  id: string;
  user_email: string;
  alipay_txn: string;
  tier: string;
  cycle: string;
  amount: number;
  notes: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
}

export default function AdminPaymentsPage() {
  useAdmin();
  const [items, setItems] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_confirmations" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data || []) as unknown as Confirmation[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (conf: Confirmation) => {
    setActionId(conf.id);
    setMsg("");
    try {
      const res = await fetch(APPROVE_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation_id: conf.id }),
      });
      const result = await res.json();
      if (res.ok) {
        setMsg(`✅ ${conf.user_email} 已升级为 ${conf.tier}`);
        load();
      } else {
        setMsg(`❌ ${result.error || "失败"}`);
      }
    } catch {
      setMsg("❌ 网络错误");
    }
    setActionId(null);
    setTimeout(() => setMsg(""), 5000);
  };

  const reject = async (conf: Confirmation) => {
    setActionId(conf.id);
    await supabase.from("payment_confirmations" as any).update({ status: "rejected" }).eq("id", conf.id);
    load();
    setActionId(null);
    setMsg(`已拒绝 ${conf.user_email}`);
    setTimeout(() => setMsg(""), 3000);
  };

  const pending = items.filter((i) => i.status === "pending");
  const processed = items.filter((i) => i.status !== "pending");

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">支付宝付款审核</h1>
          <p className="text-sm text-[#64748B] mt-1">用户付款后在此确认开通会员</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] bg-[#1E293B] rounded-lg transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${msg.startsWith("✅") ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"}`}>
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#06B6D4] mx-auto" /></div>
      ) : (
        <>
          {/* 待审核 */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              待审核
              {pending.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-[#F59E0B]/15 text-[#F59E0B] rounded-full">{pending.length}</span>
              )}
            </h2>
            {pending.length === 0 ? (
              <div className="glass-card p-8 text-center text-sm text-[#64748B]">
                <Phone className="w-8 h-8 text-[#334155] mx-auto mb-2" />
                暂无待审核的付款确认
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((c) => (
                  <div key={c.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#F1F5F9]">{c.user_email}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${c.tier === "diamond" ? "bg-[#3B82F6]/15 text-[#3B82F6]" : "bg-[#F59E0B]/15 text-[#F59E0B]"}`}>
                          {c.tier === "diamond" ? "钻石" : "黄金"} · {c.cycle === "yearly" ? "年付" : "月付"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
                        <span>¥{c.amount}</span>
                        <span className="font-mono">交易号: {c.alipay_txn}</span>
                        <span>{formatTime(c.created_at)}</span>
                        {c.notes && <span className="text-[#94A3B8]">备注: {c.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => approve(c)} disabled={actionId === c.id}
                        className="flex items-center gap-1 px-4 py-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                        {actionId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        批准
                      </button>
                      <button onClick={() => reject(c)} disabled={actionId === c.id}
                        className="flex items-center gap-1 px-4 py-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] text-sm font-medium rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5" />
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 已处理 */}
          {processed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">已处理</h2>
              <div className="space-y-2">
                {processed.slice(0, 20).map((c) => (
                  <div key={c.id} className="glass-card p-3 flex items-center gap-3 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.status === "approved" ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                    <span className="text-[#F1F5F9] flex-1 truncate">{c.user_email}</span>
                    <span className="text-xs text-[#64748B]">{c.tier === "diamond" ? "钻石" : "黄金"} · ¥{c.amount}</span>
                    <span className={`text-xs ${c.status === "approved" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {c.status === "approved" ? "已批准" : "已拒绝"}
                    </span>
                    <span className="text-xs text-[#475569]">{formatTime(c.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
