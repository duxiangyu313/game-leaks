"use client";

/**
 * 管理后台 — CJ2026 订单管理
 * 查看所有云逛展陪伴团订单，手动确认支付宝订单
 */
import { useEffect, useState } from "react";
import { supabase, db } from "@/lib/supabase/client";
import { CheckCircle, Clock, XCircle, RefreshCw, TrendingUp } from "lucide-react";
import type { Cj2026Purchase } from "@/types";

export default function AdminCj2026OrdersPage() {
  const [orders, setOrders] = useState<Cj2026Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await db
      .from("cj2026_purchases")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data || []) as Cj2026Purchase[]);
    setLoading(false);
  }

  async function handleConfirm(orderId: string) {
    setConfirming(orderId);
    const { data: { user } } = await supabase.auth.getUser();
    await db
      .from("cj2026_purchases")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: user?.email || "admin",
      })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "confirmed", confirmed_at: new Date().toISOString(), confirmed_by: user?.email || "admin" }
          : o
      )
    );
    setConfirming(null);

    // 写入管理日志
    await supabase.from("admin_logs").insert({
      action: "confirm_cj2026_order",
      detail: orderId,
      user_id: user?.id,
    });
  }

  const stats = {
    total: orders.length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    totalRevenue: orders
      .filter((o) => o.status === "confirmed")
      .reduce((sum, o) => sum + Number(o.amount), 0),
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    confirmed: { icon: CheckCircle, color: "text-[#10B981] bg-[#10B981]/10", label: "已确认" },
    pending: { icon: Clock, color: "text-[#F5A623] bg-[#F5A623]/10", label: "待确认" },
    refunded: { icon: XCircle, color: "text-[#EF4444] bg-[#EF4444]/10", label: "已退款" },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">CJ2026 订单管理</h1>
        <p className="text-sm text-[#64748B] mt-1">云逛展陪伴团 · 购买记录</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="总订单" value={stats.total} icon={<TrendingUp className="w-4 h-4" />} color="#06B6D4" />
        <StatCard label="已确认" value={stats.confirmed} icon={<CheckCircle className="w-4 h-4" />} color="#10B981" />
        <StatCard label="待确认" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="#F5A623" />
        <StatCard label="总收入" value={`¥${stats.totalRevenue.toFixed(2)}`} icon={<TrendingUp className="w-4 h-4" />} color="#E94560" />
      </div>

      {/* 刷新按钮 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#64748B]">共 {orders.length} 条记录</p>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] bg-[#1E293B]/40 rounded-lg transition-all"
        >
          <RefreshCw className="w-3 h-3" /> 刷新
        </button>
      </div>

      {/* 订单表格 */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <p className="text-[#64748B]">暂无订单</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1E293B]/40">
                <tr>
                  <th className="text-left p-3 text-[#94A3B8] text-xs">邮箱</th>
                  <th className="text-left p-3 text-[#94A3B8] text-xs">金额</th>
                  <th className="text-left p-3 text-[#94A3B8] text-xs hidden md:table-cell">支付方式</th>
                  <th className="text-left p-3 text-[#94A3B8] text-xs">状态</th>
                  <th className="text-left p-3 text-[#94A3B8] text-xs hidden md:table-cell">时间</th>
                  <th className="text-right p-3 text-[#94A3B8] text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const sc = statusConfig[o.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={o.id} className="border-t border-[rgba(30,41,59,0.3)]">
                      <td className="p-3 text-[#F1F5F9] text-xs">{o.email}</td>
                      <td className="p-3 text-[#F1F5F9] font-semibold">¥{Number(o.amount).toFixed(2)}</td>
                      <td className="p-3 text-[#94A3B8] text-xs hidden md:table-cell">
                        {o.payment_method === "stripe" ? "Stripe" : "支付宝"}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" /> {sc.label}
                        </span>
                      </td>
                      <td className="p-3 text-[#64748B] text-xs hidden md:table-cell">
                        {new Date(o.created_at).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="p-3 text-right">
                        {o.status === "pending" && o.payment_method === "alipay" && (
                          <button
                            onClick={() => handleConfirm(o.id)}
                            disabled={confirming === o.id}
                            className="px-3 py-1.5 text-[10px] bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 transition-all"
                          >
                            {confirming === o.id ? "确认中..." : "确认开通"}
                          </button>
                        )}
                        {o.alipay_transaction_id && (
                          <div className="text-[10px] text-[#475569] mt-1 font-mono hidden md:block">
                            {o.alipay_transaction_id.slice(0, 16)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <span className="text-xs text-[#64748B]">{label}</span>
      </div>
      <div className="text-xl font-black text-[#F1F5F9]">{value}</div>
    </div>
  );
}
