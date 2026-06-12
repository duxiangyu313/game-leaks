"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Search, Crown, Shield, Save } from "lucide-react";

const TIERS = [
  { value: "free", label: "普通用户" },

  { value: "gold", label: "黄金会员" },
  { value: "diamond", label: "钻石会员" },
];

export default function UsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTier, setEditTier] = useState("free");

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setUsers(data || []); setLoading(false);
    });
  }, []);

  const handleUpdate = async (id: string) => {
    await supabase.from("profiles").update({ membership: editTier, updated_at: new Date().toISOString() }).eq("id", id);
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, membership: editTier } : u)));
    setEditingId(null);
    await supabase.from("admin_logs").insert({ action: "update_user_membership", detail: `${id} -> ${editTier}`, user_id: (await supabase.auth.getUser()).data.user?.id });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEdit = (user: any) => { setEditingId(user.id); setEditTier(user.membership); };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">用户管理</h1>
        <p className="text-sm text-[#64748B] mt-1">共 {users.length} 位用户</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] mb-4">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input type="text" placeholder="搜索用户名或邮箱..." value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent text-sm text-[#F1F5F9] outline-none flex-1" />
      </div>
      {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl"/>)}</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr><th className="text-left p-3 text-[#94A3B8]">用户</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">会员等级</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">到期时间</th><th className="text-right p-3 text-[#94A3B8]">操作</th></tr>
            </thead>
            <tbody>
              {users.filter(u=>u.username?.toLowerCase().includes(search.toLowerCase())).map(u=>(
                <tr key={u.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/20">
                  <td className="p-3">
                    <div className="text-[#F1F5F9] font-medium">{u.username || u.id?.slice(0,8)}</div>
                    <div className="text-xs text-[#64748B]">{u.id}</div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {editingId===u.id?(
                      <select value={editTier} onChange={e=>setEditTier(e.target.value)} className="px-2 py-1 rounded bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-xs outline-none">
                        {TIERS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    ):(
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full ${u.membership==='diamond'?'bg-[#3B82F6]/10 text-[#3B82F6]':u.membership==='gold'?'bg-[#F59E0B]/10 text-[#F59E0B]':'bg-[#64748B]/10 text-[#64748B]'}`}>
                        {u.membership==='diamond'?<Crown className="w-3 h-3"/>:<Shield className="w-3 h-3"/>} {TIERS.find(t=>t.value===u.membership)?.label||u.membership}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-[#64748B] hidden md:table-cell text-xs">{u.subscription_end_date?new Date(u.subscription_end_date).toLocaleDateString("zh-CN"):'-'}</td>
                  <td className="p-3 text-right">
                    {editingId===u.id?(
                      <button onClick={()=>handleUpdate(u.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#10B981] text-white rounded-lg"><Save className="w-3 h-3"/> 保存</button>
                    ):(
                      <button onClick={()=>startEdit(u)} className="px-3 py-1.5 text-xs bg-[#1E293B]/40 text-[#94A3B8] rounded-lg hover:text-[#F1F5F9]">修改等级</button>
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
