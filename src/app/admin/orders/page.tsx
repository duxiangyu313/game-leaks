"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Search, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"orders" | "refunds">("orders");

  useEffect(() => {
    Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("refunds").select("*").order("created_at", { ascending: false }),
    ]).then(([{ data: o }, { data: r }]) => {
      setOrders(o || []); setRefunds(r || []); setLoading(false);
    });
  }, []);

  const handleRefund = async (refundId: string, approve: boolean) => {
    await supabase.from("refunds").update({
      status: approve ? "approved" : "rejected",
      admin_note: approve ? "已退款" : "拒绝",
      updated_at: new Date().toISOString(),
    }).eq("id", refundId);
    setRefunds((p) => p.map((r) => (r.id === refundId ? { ...r, status: approve ? "approved" : "rejected" } : r)));
    await supabase.from("admin_logs").insert({ action: approve ? "approve_refund" : "reject_refund", detail: refundId, user_id: (await supabase.auth.getUser()).data.user?.id });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">订单管理</h1>
        <p className="text-sm text-[#64748B] mt-1">共 {orders.length} 笔订单，{refunds.length} 笔退款</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={()=>setTab("orders")} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab==="orders"?"bg-[#06B6D4] text-white":"bg-[#1E293B]/40 text-[#94A3B8]"}`}>支付订单</button>
        <button onClick={()=>setTab("refunds")} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab==="refunds"?"bg-[#06B6D4] text-white":"bg-[#1E293B]/40 text-[#94A3B8]"}`}>退款申请 ({refunds.length})</button>
      </div>

      {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl"/>)}</div> : tab==="orders" ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr><th className="text-left p-3 text-[#94A3B8]">订单ID</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">用户</th><th className="text-left p-3 text-[#94A3B8]">金额</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">等级</th><th className="text-left p-3 text-[#94A3B8]">状态</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">时间</th></tr>
            </thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id} className="border-t border-[rgba(30,41,59,0.3)]">
                  <td className="p-3 text-[#64748B] text-xs font-mono">{o.stripe_session_id?.slice(-12)||o.id.slice(0,12)}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell text-xs">{o.user_id?.slice(0,8)}</td>
                  <td className="p-3 text-[#F1F5F9]">¥{(o.amount/100).toFixed(2)}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${o.tier==='diamond'?'bg-[#22D3EE]/10 text-[#22D3EE]':o.tier==='gold'?'bg-[#F59E0B]/10 text-[#F59E0B]':'bg-[#94A3B8]/10 text-[#94A3B8]'}`}>{o.tier}·{o.billing_cycle}</span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full ${o.status==='completed'?'bg-[#10B981]/10 text-[#10B981]':o.status==='refunded'?'bg-[#EF4444]/10 text-[#EF4444]':'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                      {o.status==='completed'?<CheckCircle className="w-3 h-3"/>:o.status==='refunded'?<XCircle className="w-3 h-3"/>:<Clock className="w-3 h-3"/>}
                      {o.status==='completed'?'已完成':o.status==='refunded'?'已退款':'待处理'}
                    </span>
                  </td>
                  <td className="p-3 text-[#64748B] hidden md:table-cell text-xs">{new Date(o.created_at).toLocaleDateString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr><th className="text-left p-3 text-[#94A3B8]">申请ID</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">用户</th><th className="text-left p-3 text-[#94A3B8]">金额</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">原因</th><th className="text-left p-3 text-[#94A3B8]">状态</th><th className="text-right p-3 text-[#94A3B8]">操作</th></tr>
            </thead>
            <tbody>
              {refunds.map(r=>(
                <tr key={r.id} className="border-t border-[rgba(30,41,59,0.3)]">
                  <td className="p-3 text-[#64748B] text-xs font-mono">{r.id.slice(0,12)}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell text-xs">{r.user_id?.slice(0,8)}</td>
                  <td className="p-3 text-[#F1F5F9]">¥{(r.amount/100).toFixed(2)}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell text-xs max-w-[200px] truncate">{r.reason||'-'}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full ${r.status==='approved'?'bg-[#10B981]/10 text-[#10B981]':r.status==='rejected'?'bg-[#EF4444]/10 text-[#EF4444]':'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                      {r.status==='approved'?'已通过':r.status==='rejected'?'已拒绝':'待处理'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status==='pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={()=>handleRefund(r.id,true)} className="px-2 py-1 text-[10px] bg-[#10B981] text-white rounded">通过</button>
                        <button onClick={()=>handleRefund(r.id,false)} className="px-2 py-1 text-[10px] bg-[#EF4444] text-white rounded">拒绝</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
