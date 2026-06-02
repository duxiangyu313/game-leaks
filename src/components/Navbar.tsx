"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, User, Crown } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/games", label: "游戏库" },
  { href: "/leaks", label: "爆料专区" },
  { href: "/analysis", label: "深度解析" },
  { href: "/forum", label: "论坛" },
  { href: "/member", label: "会员中心" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/85 backdrop-blur-xl border-b border-[rgba(30,41,59,0.8)]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_16px_rgba(6,182,212,0.3)]">
            G
          </div>
          <span className="text-lg font-bold text-[#F1F5F9] hidden sm:block group-hover:text-[#06B6D4] transition-colors">
            国游爆料
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search + Auth */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              searchFocused
                ? "border-[#06B6D4]/40 bg-[#1E293B]/60 shadow-[0_0_16px_rgba(6,182,212,0.1)]"
                : "border-[rgba(30,41,59,0.6)] bg-transparent"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="搜索游戏..."
              className="bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-32 focus:w-44 transition-all"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Auth buttons */}
          <Link
            href="/auth"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all"
          >
            <User className="w-4 h-4" />
            登录
          </Link>
          <Link
            href="/member"
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white rounded-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Crown className="w-3.5 h-3.5" />
            加入会员
          </Link>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-[#94A3B8] hover:text-[#F1F5F9]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-[rgba(30,41,59,0.6)] bg-[#0F172A]/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/50 rounded-lg transition-all"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[rgba(30,41,59,0.4)] flex gap-2">
              <Link
                href="/auth"
                className="flex-1 text-center py-2 text-sm text-[#94A3B8] border border-[rgba(30,41,59,0.6)] rounded-lg hover:text-[#F1F5F9] hover:border-[#06B6D4]/30 transition-all"
                onClick={() => setOpen(false)}
              >
                登录
              </Link>
              <Link
                href="/member"
                className="flex-1 text-center py-2 text-sm font-medium bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white rounded-lg"
                onClick={() => setOpen(false)}
              >
                加入会员
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
