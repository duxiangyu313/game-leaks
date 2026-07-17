"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Gift, Crown, Loader2 } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function ClaimPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: p } = await supabase.from("profiles").select("membership").eq("id", user.id).single();
      setProfile(p);

      // 获取可领取和已领取的激活码
      const [{ data: available }, { data: claimed }] = await Promise.all([
        supabase.from("activation_codes").select("*").is("claimed_by", null).limit(10),
        supabase.from("activation_codes").select("*").eq("claimed_by", user.id),
      ]);
      setCodes([...(claimed || []), ...(available || [])]);
      setLoading(false);
    }
    load();
  }, []);

  const handleClaim = async () => {
    if (!profile || profile.membership !== "diamond") return alert("仅钻石会员可领取");
    setClaiming(true);
    // 取一个未领取的激活码
    const { data: code } = await supabase.from("activation_codes").select("*").is("claimed_by", null).limit(1).single();
    if (!code) { alert("暂时没有可领取的激活码"); setClaiming(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("activation_codes").update({ claimed_by: user!.id, claimed_at: new Date().toISOString() }).eq("id", code.id);
    // 刷新列表
    const [{ data: available }, { data: claimed }] = await Promise.all([
      supabase.from("activation_codes").select("*").is("claimed_by", null).limit(10),
      supabase.from("activation_codes").select("*").eq("claimed_by", user!.id),
    ]);
    setCodes([...(claimed || []), ...(available || [])]);
    setClaiming(false);
  };

  const handleRandomDraw = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: allCodes } = await supabase.from("activation_codes").select("*").is("claimed_by", null);
    if (!allCodes || allCodes.length === 0) { alert("没有可抽奖的激活码"); return; }
    const random = allCodes[Math.floor(Math.random() * allCodes.length)];
    await supabase.from("activation_codes").update({ claimed_by: user.id, claimed_at: new Date().toISOString() }).eq("id", random.id);
    alert(`🎉 抽中激活码: ${random.code}`);
    window.location.reload();
  };

  if (loading) return <div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>;
  if (!profile) return <div className="pt-20 pb-20 text-center text-[#64748B]">请先登录</div>;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black text-[#F1F5F9] mb-2 flex items-center gap-3"><Gift className="w-8 h-8 text-[#F59E0B]" /> 激活码领取</h1>
        <p className="text-[#94A3B8] mb-8">
          当前会员: <span className="font-bold text-[#F59E0B]">{profile.membership}</span>
        </p>

        {/* Claim button for diamond */}
        {profile.membership === "diamond" ? (
          <div className="glass-card p-6 mb-6 text-center">
            <Crown className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">钻石会员专属</h3>
            <p className="text-sm text-[#94A3B8] mb-4">每月可领取一个激活码</p>
            <button onClick={handleClaim} disabled={claiming} className="px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50">
              {claiming ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}领取激活码
            </button>
          </div>
        ) : (
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-[#94A3B8]">激活码领取仅限钻石会员</p>
            <LinkNoPrefetch href="/member" className="inline-block mt-3 text-[#06B6D4] hover:text-[#22D3EE] font-medium">升级会员 →</LinkNoPrefetch>
          </div>
        )}

        {/* Random draw */}
        <div className="glass-card p-6 mb-6 text-center">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">随机抽奖</h3>
          <p className="text-sm text-[#94A3B8] mb-4">所有注册用户均可参与，随机获得激活码</p>
          <button onClick={handleRandomDraw} className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-semibold rounded-xl">抽奖</button>
        </div>

        {/* Code history */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40"><tr><th className="text-left p-3 text-[#94A3B8]">激活码</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">游戏</th><th className="text-left p-3 text-[#94A3B8]">状态</th></tr></thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-t border-[rgba(30,41,59,0.3)]">
                  <td className="p-3 font-mono text-xs text-[#F1F5F9]">{c.code}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{c.game_name || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${c.claimed_by ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {c.claimed_by ? "已领取" : "可领取"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
