"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { getWithdrawalMin } from "@/lib/auth";
import type { PayoutMethod } from "@/types";
import {
  TrendingUp, Wallet, Users, Copy, Check, ArrowUpRight, Clock, Gift,
  Loader2, DollarSign, FileText, Eye, Heart, MessageSquare,
  AlertCircle, Plus, X
} from "lucide-react";

type Tab = "earnings" | "withdraw" | "invite";

interface ContentRow {
  id: string; title: string; category: string;
  view_count: number; like_count: number; comment_count: number;
  published_at: string; content_level: string;
}
interface WithdrawalForm { amount: string; method: PayoutMethod; account: string; realName: string; }
const EMPTY_WF: WithdrawalForm = { amount: "", method: "alipay", account: "", realName: "" };

export default function CreatorCenterPage() {
  const [tab, setTab] = useState<Tab>("earnings");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // earnings
  const [earnings, setEarnings] = useState({ total: 0, available: 0, pending: 0, settled: 0 });
  const [contents, setContents] = useState<ContentRow[]>([]);

  // withdrawal
  const [wdForm, setWdForm] = useState<WithdrawalForm>(EMPTY_WF);
  const [wdMin, setWdMin] = useState(2000);
  const [wdSubmitting, setWdSubmitting] = useState(false);
  const [wdError, setWdError] = useState("");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // invite
  const [refCode, setRefCode] = useState("");
  const [refCount, setRefCount] = useState(0);
  const [refRecords, setRefRecords] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const loadAll = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { setLoading(false); return; }
    setUser(u);
    const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    setProfile(p);

    // earnings
    const { data: revs } = await supabase.from("revenue_records").select("*").eq("creator_id", u.id).order("created_at", { ascending: false });
    if (revs) {
      let total = 0, available = 0, pending = 0, settled = 0;
      for (const r of revs) {
        const amt = (r as any).amount || 0;
        total += amt;
        if (r.settlement_status === "pending") pending += amt;
        else if (r.settlement_status === "settled") { settled += amt; available += amt; }
        else if (r.settlement_status === "withdrawn") settled += amt;
      }
      setEarnings({ total, available, pending, settled });
    }

    // content performance
    const { data: ugc } = await supabase.from("ugc_content").select("id,title,category,view_count,like_count,comment_count,published_at,content_level").eq("user_id", u.id).order("published_at", { ascending: false });
    if (ugc) setContents(ugc as any[]);

    // withdrawals
    const { data: wds } = await supabase.from("withdrawal_requests").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
    if (wds) setWithdrawals(wds as any[]);

    // referral
    const { data: rc } = await supabase.from("referral_codes").select("code, usage_count").eq("user_id", u.id).maybeSingle();
    if (rc) { setRefCode(rc.code); setRefCount(rc.usage_count); }
    const { data: rrs } = await supabase.from("referral_records").select("*").eq("referrer_id", u.id).order("invited_at", { ascending: false });
    if (rrs) setRefRecords(rrs as any[]);

    // withdrawal min
    const min = await getWithdrawalMin();
    setWdMin(min);

    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── withdrawal submit ───
  const submitWithdrawal = async () => {
    setWdError("");
    const amt = Math.round(parseFloat(wdForm.amount) * 100);
    if (!amt || amt <= 0) { setWdError("请输入有效金额"); return; }
    if (amt < wdMin) { setWdError(`最低提现 ¥${(wdMin / 100).toFixed(0)}`); return; }
    if (amt > earnings.available) { setWdError("余额不足"); return; }
    if (!wdForm.account.trim()) { setWdError("请填写收款账号"); return; }
    setWdSubmitting(true);
    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id, amount: amt, method: wdForm.method,
      account_info: wdForm.account.trim(), real_name: wdForm.realName.trim() || null,
    });
    if (error) { setWdError("提交失败，请重试"); setWdSubmitting(false); return; }
    setWdForm(EMPTY_WF);
    setWdSubmitting(false);
    loadAll();
  };

  // ─── invite copy ───
  const refUrl = `https://news.guoyouwenduji.cc/auth?ref=${refCode}`;
  const copyRef = () => { navigator.clipboard.writeText(refUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return <div className="pt-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" /></div>;
  if (!user) return (
    <div className="pt-20 pb-20 max-w-md mx-auto px-4 text-center">
      <ShieldIcon className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
      <h1 className="text-xl font-bold text-[#F1F5F9] mb-2">请先登录</h1>
      <p className="text-[#64748B] text-sm mb-6">登录后查看创作收益</p>
      <LinkNoPrefetch href="/auth" className="inline-flex px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold">登录 / 注册</LinkNoPrefetch>
    </div>
  );

  const TABS: { key: Tab; icon: typeof TrendingUp; label: string }[] = [
    { key: "earnings", icon: TrendingUp, label: "收益概览" },
    { key: "withdraw", icon: Wallet, label: "提现" },
    { key: "invite", icon: Users, label: "邀请好友" },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[960px] mx-auto px-4">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-[#F1F5F9] mb-2">创作者中心</motion.h1>
        <p className="text-sm text-[#64748B] mb-8">管理你的创作收益、提现和邀请</p>

        {/* tabs */}
        <div className="flex gap-1 mb-8 bg-[#1E293B] rounded-xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key ? "bg-[#3B82F6] text-white shadow-lg" : "text-[#64748B] hover:text-[#F1F5F9]"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "earnings" && <EarningsTab earnings={earnings} contents={contents} />}
        {tab === "withdraw" && <WithdrawTab form={wdForm} setForm={setWdForm} min={wdMin}
          available={earnings.available} error={wdError} submitting={wdSubmitting}
          onSubmit={submitWithdrawal} withdrawals={withdrawals} />}
        {tab === "invite" && <InviteTab code={refCode} url={refUrl} count={refCount}
          copied={copied} onCopy={copyRef} records={refRecords} profile={profile} />}
      </div>
    </div>
  );
}

// ═══ sub-components ═══

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  );
}

// ── Earnings Tab ──
function EarningsTab({ earnings, contents }: { earnings: any; contents: ContentRow[] }) {
  const cards = [
    { icon: DollarSign, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", label: "累计收益", val: `¥${(earnings.total / 100).toFixed(2)}` },
    { icon: Wallet, color: "text-[#10B981]", bg: "bg-[#10B981]/10", label: "可提现余额", val: `¥${(earnings.available / 100).toFixed(2)}` },
    { icon: Clock, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", label: "待结算", val: `¥${(earnings.pending / 100).toFixed(2)}` },
    { icon: TrendingUp, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", label: "已结算", val: `¥${(earnings.settled / 100).toFixed(2)}` },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
            <p className="text-xs text-[#64748B] mb-1">{c.label}</p>
            <p className="text-xl font-bold text-[#F1F5F9]">{c.val}</p>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-bold text-[#F1F5F9] mb-4">内容表现</h2>
      {contents.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileText className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-40" />
          <p className="text-[#64748B] text-sm">还没有发布内容。去 <LinkNoPrefetch href="/submit" className="text-[#3B82F6] underline">投稿</LinkNoPrefetch> 开始创作吧！</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map((c: ContentRow) => (
            <div key={c.id} className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#F1F5F9] truncate">{c.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.content_level === "diamond" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : c.content_level === "gold" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-gray-500/10 text-gray-400"}`}>{c.content_level === "diamond" ? "钻石" : c.content_level === "gold" ? "黄金" : "免费"}</span>
                  <span>{new Date(c.published_at).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{c.view_count}</span>
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{c.like_count}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{c.comment_count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Withdraw Tab ──
function WithdrawTab({ form, setForm, min, available, error, submitting, onSubmit, withdrawals }: {
  form: WithdrawalForm; setForm: (f: WithdrawalForm) => void; min: number;
  available: number; error: string; submitting: boolean; onSubmit: () => void;
  withdrawals: any[];
}) {
  const set = (k: keyof WithdrawalForm, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-1">申请提现</h2>
        <p className="text-xs text-[#64748B] mb-4">可提现余额：<span className="text-[#10B981] font-semibold">¥{(available / 100).toFixed(2)}</span> · 最低提现 ¥{(min / 100).toFixed(0)}</p>
        <div className="glass-card p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">金额（元）</label>
            <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)}
              placeholder={`最低 ¥${(min / 100).toFixed(0)}`}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] focus:border-[#3B82F6] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">收款方式</label>
            <div className="flex gap-2">
              {(["alipay", "wechat"] as PayoutMethod[]).map(m => (
                <button key={m} onClick={() => set("method", m)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all ${
                    form.method === m ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]" : "border-[#334155] text-[#64748B] hover:border-[#475569]"}`}>
                  {m === "alipay" ? "支付宝" : "微信支付"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">{form.method === "alipay" ? "支付宝账号" : "微信账号"}</label>
            <input type="text" value={form.account} onChange={e => set("account", e.target.value)}
              placeholder={form.method === "alipay" ? "手机号或邮箱" : "微信号"}
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] focus:border-[#3B82F6] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">真实姓名 <span className="text-[#475569]">（选填）</span></label>
            <input type="text" value={form.realName} onChange={e => set("realName", e.target.value)}
              placeholder="与收款账号实名一致"
              className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#475569] focus:border-[#3B82F6] outline-none" />
          </div>
          {error && <div className="flex items-center gap-2 text-xs text-[#EF4444] bg-[#EF4444]/10 rounded-lg px-4 py-3"><AlertCircle className="w-4 h-4" />{error}</div>}
          <button onClick={onSubmit} disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-bold text-sm hover:shadow-lg hover:shadow-[#3B82F6]/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}提交提现申请
          </button>
          <p className="text-[10px] text-[#475569] text-center">审核通过后 1-3 个工作日内到账</p>
        </div>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-4">提现记录</h2>
        {withdrawals.length === 0 ? (
          <div className="glass-card p-6 text-center"><Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-40" /><p className="text-xs text-[#64748B]">暂无提现记录</p></div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w: any) => (
              <div key={w.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#F1F5F9]">¥{(w.amount / 100).toFixed(2)}</p>
                  <p className="text-[10px] text-[#64748B]">{w.method === "alipay" ? "支付宝" : "微信"} · {new Date(w.created_at).toLocaleDateString("zh-CN")}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                  w.status === "paid" ? "bg-[#10B981]/10 text-[#10B981]" : w.status === "approved" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : w.status === "rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                  {w.status === "pending" ? "审核中" : w.status === "approved" ? "已批准" : w.status === "paid" ? "已到账" : "已拒绝"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Invite Tab ──
function InviteTab({ code, url, count, copied, onCopy, records, profile }: {
  code: string; url: string; count: number; copied: boolean; onCopy: () => void;
  records: any[]; profile: any;
}) {
  return (
    <div className="grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-1">邀请好友</h2>
        <p className="text-xs text-[#64748B] mb-4">每邀请一位好友加入会员，你获得 <span className="text-[#F59E0B] font-semibold">7天会员延期</span></p>
        <div className="glass-card p-5 mb-6">
          <p className="text-xs text-[#94A3B8] mb-2">你的专属邀请链接</p>
          <div className="flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 mb-3">
            <code className="text-sm text-[#06B6D4] flex-1 break-all select-all">{url}</code>
            <button onClick={onCopy} className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] text-xs font-semibold hover:bg-[#06B6D4]/25 flex items-center gap-1 shrink-0">
              {copied ? <><Check className="w-3 h-3" />已复制</> : <><Copy className="w-3 h-3" />复制</>}
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#64748B]">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#3B82F6]" />已邀请 <span className="text-[#F1F5F9] font-semibold">{count}</span> 人</span>
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-[#F59E0B]" />邀请奖励</h3>
          <ul className="space-y-2 text-xs text-[#94A3B8]">
            <li className="flex items-start gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />好友通过你的链接注册 → 双方获得 7 天免费黄金体验</li>
            <li className="flex items-start gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />好友升级会员 → 你获得 7 天同等级会员延期</li>
            <li className="flex items-start gap-2"><ArrowUpRight className="w-3.5 h-3.5 text-[#10B981] mt-0.5 shrink-0" />钻石邀请人会员延长翻倍 → 14 天/人</li>
          </ul>
        </div>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-4">邀请记录</h2>
        {records.length === 0 ? (
          <div className="glass-card p-6 text-center"><Users className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-40" /><p className="text-xs text-[#64748B]">尚无邀请记录</p></div>
        ) : (
          <div className="space-y-2">
            {records.map((r: any) => (
              <div key={r.id} className="glass-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#F1F5F9]">{r.referral_code}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${r.reward_applied ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                    {r.reward_applied ? "已生效" : "待激活"}
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B]">邀请于 {new Date(r.invited_at).toLocaleDateString("zh-CN")} · {r.reward_days}天奖励</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
