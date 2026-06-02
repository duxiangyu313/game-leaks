"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminAuth";
import {
  LayoutDashboard, FileText, Flame, Gamepad2, Users, CreditCard,
  LogOut, ChevronLeft, Menu, X, Gift, Shield
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "控制台", href: "/admin" },
  { icon: FileText, label: "文章管理", href: "/admin/articles" },
  { icon: Flame, label: "爆料管理", href: "/admin/leaks" },
  { icon: Gamepad2, label: "游戏管理", href: "/admin/games" },
  { icon: Users, label: "用户管理", href: "/admin/users" },
  { icon: CreditCard, label: "订单管理", href: "/admin/orders" },
  { icon: Gift, label: "激活码", href: "/admin/codes" },
  { icon: Shield, label: "投稿审核", href: "/admin/submissions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAdmin();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className={`h-full flex flex-col bg-[#0B1120] border-r border-[rgba(30,41,59,0.6)] transition-all ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-[rgba(30,41,59,0.4)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
        {!collapsed && <span className="text-sm font-bold text-[#F1F5F9]">后台管理</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/40"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-[rgba(30,41,59,0.4)]">
        {!collapsed && (
          <p className="text-xs text-[#64748B] px-3 mb-2 truncate">{user?.email}</p>
        )}
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = "/admin/login"; }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#EF4444] hover:bg-[#EF4444]/5 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "退出登录"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex relative">
        {sidebar}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1E293B] border border-[rgba(30,41,59,0.6)] flex items-center justify-center text-[#64748B] hover:text-[#F1F5F9]"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0B1120] border-b border-[rgba(30,41,59,0.6)] flex items-center px-4 z-50">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#94A3B8]">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="ml-3 text-sm font-bold text-[#F1F5F9]">后台管理</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-60 h-full" onClick={() => setMobileOpen(false)}>{sidebar}</div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
