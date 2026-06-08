"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { CreditCard, Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  membership_tier?: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase
        .from("payments")
        .select("id, amount, currency, status, created_at, membership_tier")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setPayments(data);
          setLoading(false);
        });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="w-10 h-10 text-[#334155] mx-auto mb-3" />
        <p className="text-sm text-[#64748B]">暂无支付记录</p>
        <p className="text-xs text-[#475569] mt-1">购买会员后支付记录会显示在这里</p>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case "succeeded":
      case "completed": return "bg-[#10B981]/10 text-[#10B981]";
      case "refunded": return "bg-[#F59E0B]/10 text-[#F59E0B]";
      case "failed": return "bg-[#EF4444]/10 text-[#EF4444]";
      default: return "bg-[#64748B]/10 text-[#64748B]";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "succeeded":
      case "completed": return "成功";
      case "refunded": return "已退款";
      case "failed": return "失败";
      default: return s;
    }
  };

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {payments.map((p) => (
        <div key={p.id} className="flex items-center gap-3 p-3 bg-[#0F172A]/60 rounded-lg">
          <CreditCard className="w-4 h-4 text-[#475569] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#F1F5F9]">
                ¥{(p.amount / 100).toFixed(2)}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge(p.status)}`}>
                {statusLabel(p.status)}
              </span>
            </div>
            <p className="text-[10px] text-[#475569] mt-0.5">
              {new Date(p.created_at).toLocaleDateString("zh-CN")}
              {p.membership_tier ? ` · ${p.membership_tier}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
