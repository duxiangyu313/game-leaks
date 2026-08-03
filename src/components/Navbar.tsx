"use client";

import { useState, useEffect } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { useRouter } from "next/navigation";
import { Menu, X, User, Crown, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import SearchInput from "@/components/SearchInput";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/games", label: "游戏库" },
  { href: "/games/progress", label: "开发进度" },
  { href: "/leaks", label: "爆料" },
  { href: "/analysis", label: "解析" },
  { href: "/forum", label: "论坛" },
  { href: "/submit", label: "投稿" },
  { href: "/calendar", label: "日历" },
  { href: "/videos", label: "视频" },
  { href: "/tools", label: "工具" },
  { href: "/member", label: "会员" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    }).catch(() => {
      setLoading(false); // Supabase 不可用时确保 loading 状态结束
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080A]/80 backdrop-blur-2xl border-b border-[rgba(245,166,35,0.06)] shadow-[0_1px_0_rgba(245,166,35,0.03)]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <LinkNoPrefetch href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#D4891A] flex items-center justify-center text-[#0A0A0A] font-bold text-sm shadow-[0_0_20px_rgba(245,166,35,0.3)] group-hover:shadow-[0_0_32px_rgba(245,166,35,0.5)] transition-shadow">
            G
          </div>
          <span className="text-lg font-bold text-[#F1F5F9] hidden sm:block group-hover:text-[#F5A623] transition-colors">
            国游爆料
          </span>
        </LinkNoPrefetch>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <LinkNoPrefetch
              key={link.href}
              href={link.href}
              prefetch={false}
              className="px-3 py-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all"
            >
              {link.label}
            </LinkNoPrefetch>
          ))}
          <LinkNoPrefetch
            href="/cj2026"
            prefetch={false}
            className="ml-1 px-3 py-2 text-sm font-bold text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/30 hover:bg-[#E94560]/20 hover:border-[#E94560]/50 rounded-lg transition-all animate-pulse"
          >
            🔥 CJ2026
          </LinkNoPrefetch>
        </div>

        {/* Search + Auth */}
        <div className="flex items-center gap-3">
          <SearchInput />
          {/* 投稿按钮 — 醒目位置 */}
          <LinkNoPrefetch
            href="/submit"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#F59E0B] border border-[#F59E0B]/30 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]/50 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            投稿
          </LinkNoPrefetch>
          {/* Auth buttons */}
          {loading ? null : user ? (
            <>
              <LinkNoPrefetch href="/account" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#10B981] hover:bg-[#1E293B]/50 rounded-lg transition-all">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </LinkNoPrefetch>
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#1E293B]/50 rounded-lg transition-all">
                <LogOut className="w-4 h-4" /> 退出
              </button>
            </>
          ) : (
            <>
              <LinkNoPrefetch href="/auth" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all">
                <User className="w-4 h-4" /> 登录
              </LinkNoPrefetch>
              <LinkNoPrefetch href="/member" className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-[#F5A623] to-[#D4891A] text-white rounded-lg hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all">
                <Crown className="w-3.5 h-3.5" /> 加入会员
              </LinkNoPrefetch>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 text-[#94A3B8] hover:text-[#F1F5F9]" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-[rgba(255,255,255,0.04)] bg-[#080A0D]/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <LinkNoPrefetch key={link.href} href={link.href}
              prefetch={false} className="px-3 py-2.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all" onClick={() => setOpen(false)}>
                {link.label}
              </LinkNoPrefetch>
            ))}
            <LinkNoPrefetch href="/cj2026" prefetch={false} className="px-3 py-2.5 text-sm font-bold text-[#E94560] bg-[#E94560]/10 border border-[#E94560]/20 rounded-lg animate-pulse" onClick={() => setOpen(false)}>
              🔥 ChinaJoy 2026
            </LinkNoPrefetch>
            <div className="mt-3 pt-3 border-t border-[rgba(30,41,59,0.4)] flex gap-2">
              {user ? (
                <>
                  <span className="flex-1 text-center py-2 text-xs text-[#10B981] truncate">{user.email}</span>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="px-3 py-2 text-sm text-[#EF4444] border border-[rgba(239,68,68,0.3)] rounded-lg">
                    退出
                  </button>
                </>
              ) : (
                <>
                  <LinkNoPrefetch href="/auth" className="flex-1 text-center py-2 text-sm text-[#94A3B8] border border-[rgba(30,41,59,0.6)] rounded-lg" onClick={() => setOpen(false)}>登录</LinkNoPrefetch>
                  <LinkNoPrefetch href="/member" className="flex-1 text-center py-2 text-sm font-medium bg-gradient-to-r from-[#F5A623] to-[#D4891A] text-white rounded-lg" onClick={() => setOpen(false)}>加入会员</LinkNoPrefetch>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
