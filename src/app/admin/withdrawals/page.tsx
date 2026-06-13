"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, Wallet } from "lucide-react";

export default function WithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [al, setAl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false });
    setRequests(data || []); setLoading(false);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, status: "approved" | "rejected" | "paid") => {
    setAl(id);
    const uid = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from("withdrawal_requests").update({ status, admin_id: uid, processed_at: new Date().toISOString() }).eq("id", id);
    if (status === "paid") {
      const r = requests.find(x => x.id === id);
      if (r) await supabase.from("revenue_records").update({ settlement_status: "withdrawn" }).eq("creator_id", r.user_id);
    }
    await supabase.from("admin_logs").insert({ action: `withdrawal_${status}`, detail: id, user_id: uid });
    setAl(null); load();
  };

  const pending = requests.filter(r => r.status === "pending").length;
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-[#F1F5F9]">提现审核</h1><p className="text-sm text-[#64748B] mt-1">待处理: <span className="text-[#F59E0B] font-semibold">{pending}</span> 笔</p></div>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" /></div>
      : requests.length === 0 ? <div className="glass-card p-8 text-center"><Wallet className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-40" /><p className="text-[#64748B] text-sm">暂无提现申请</p></div>
      : <div className="space-y-3">{requests.map(r => (
        <div key={r.id} className="glass-card p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                r.status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : r.status === "approved" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : r.status === "paid" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                {r.status === "pending" ? "待审核" : r.status === "approved" ? "已批准" : r.status === "paid" ? "已打款" : "已拒绝"}</span>
              <span className="text-sm text-[#94A3B8]">{r.method === "alipay" ? "支付宝" : "微信"}</span>
            </div>
            <div className="flex items-baseline gap-2"><span className="text-xl font-bold text-[#F1F5F9]">¥{(r.amount / 100).toFixed(2)}</span><span className="text-xs text-[#64748B]">{new Date(r.created_at).toLocaleDateString("zh-CN")}</span></div>
          </div>
          <div className="flex gap-2">
            {r.status === "pending" && <>
              <button onClick={() => act(r.id, "approved")} disabled={al === r.id} className="px-4 py-2 rounded-lg bg-[#10B981]/15 text-[#10B981] text-sm font-semibold hover:bg-[#10B981]/25"><CheckCircle className="w-3.5 h-3.5 inline mr-1" />批准</button>
              <button onClick={() => act(r.id, "rejected")} disabled={al === r.id} className="px-4 py-2 rounded-lg bg-[#EF4444]/15 text-[#EF4444] text-sm font-semibold hover:bg-[#EF4444]/25"><XCircle className="w-3.5 h-3.5 inline mr-1" />拒绝</button>
            </>}
            {r.status === "approved" && <button onClick={() => act(r.id, "paid")} disabled={al === r.id} className="px-4 py-2 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] text-sm font-semibold hover:bg-[#3B82F6]/25">{al === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "标记已打款"}</button>}
          </div>
        </div>
      ))}</div>}
    </div>
  );
}
