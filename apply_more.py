#!/usr/bin/env python3
"""Apply remaining changes: silver cleanup, component updates, etc."""
import os, re

ROOT = r"D:\cc项目\next-game-site-tmp"

def read(path):
    with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
        return f.read()

def write(path, content):
    os.makedirs(os.path.dirname(os.path.join(ROOT, path)), exist_ok=True)
    with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
        f.write(content)

def replace(path, old, new):
    write(path, read(path).replace(old, new))
    return True

# ====== Silver cleanup: simple replacements ======
files_silver = {
    "src/components/article/PaywallBlur.tsx": [
        ("{ free: 0, silver: 1, gold: 2, diamond: 3 }", "{ free: 0, gold: 1, diamond: 2 }"),
    ],
    "src/components/article/SmartPaywallNudge.tsx": [
        ('if (membershipLevel === "free") return "黄金";\n    if (membershipLevel === "silver") return "黄金";\n    return "黄金";',
         'if (membershipLevel === "free") return "黄金";\n    return "钻石";'),
    ],
    "src/components/MemberStatsBar.tsx": [
        ('.in("required_tier", ["silver", "gold", "diamond"])', '.in("required_tier", ["gold", "diamond"])'),
    ],
    "src/app/videos/page.tsx": [
        ('{v.required_tier === "silver" ? "白银" : v.required_tier === "gold" ? "黄金" : "钻石"}可见',
         '{v.required_tier === "gold" ? "黄金" : "钻石"}可见'),
    ],
    "src/app/trial/page.tsx": [
        ('membership: "silver",', 'membership: "gold",'),
    ],
    "src/app/analysis/page.tsx": [
        ("TierFilter[]", "TierFilter[]"),  # no-op placeholder
        (' { key: "silver", label: "白银", color: "text-[#94A3B8]" },', ''),
        ('<PremiumBadge tier={a.required_tier as "gold" | "diamond" | "silver"} />',
         '<PremiumBadge tier={(a.required_tier as "gold" | "diamond") || "gold"} />'),
    ],
    "src/app/admin/users/page.tsx": [
        ('  { value: "silver", label: "白银会员" },', ''),
        ("u.membership==='diamond'?'bg-[#22D3EE]/10 text-[#22D3EE]':u.membership==='gold'?'bg-[#F59E0B]/10 text-[#F59E0B]':u.membership==='silver'?'bg-[#94A3B8]/10 text-[#94A3B8]':'bg-[#64748B]/10 text-[#64748B]'",
         "u.membership==='diamond'?'bg-[#3B82F6]/10 text-[#3B82F6]':u.membership==='gold'?'bg-[#F59E0B]/10 text-[#F59E0B]':'bg-[#64748B]/10 text-[#64748B]'"),
    ],
    "src/app/admin/articles/new/page.tsx": [
        ('  { value: "silver", label: "白银及以上" },', ''),
    ],
    "src/app/admin/articles/edit/page.tsx": [
        ('  { value: "silver", label: "白银及以上" },', ''),
    ],
    "src/components/FeaturedProgress.tsx": [
        ('silver_info', 'diamond_info'),
    ],
    "src/app/admin/games/progress/page.tsx": [
        ('silver_info', 'diamond_info'),
        ('白银会员信息', '钻石会员信息'),
        ('public_info: r.public_info, diamond_info: r.diamond_info, gold_info: r.gold_info,',
         'public_info: r.public_info || "", diamond_info: r.diamond_info || "", gold_info: r.gold_info,'),
    ],
    "src/app/games/progress/detail/page.tsx": [
        ('requiredTier="silver"', 'requiredTier="gold"'),
        ('game.silver_info', 'game.gold_info'),
    ],
}

for filepath, replacements in files_silver.items():
    try:
        c = read(filepath)
        for old, new in replacements:
            if old and old in c:
                c = c.replace(old, new)
            elif old and old not in c:
                print(f"  WARNING: not found in {filepath}: {old[:50]}...")
        write(filepath, c)
        print(f"  {filepath}")
    except FileNotFoundError:
        print(f"  SKIP (not found): {filepath}")

# ====== PremiumBadge: remove silver ======
replace("src/components/cyber/PremiumBadge.tsx",
    'interface Props { tier: "gold" | "diamond" | "silver"; className?: string }',
    'interface Props { tier: "gold" | "diamond"; className?: string }')
replace("src/components/cyber/PremiumBadge.tsx",
    '  silver:  { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.4)", text: "#CBD5E1" },\n',
    '')
replace("src/components/cyber/PremiumBadge.tsx",
    'diamond: { bg: "rgba(6,182,212,0.15)",  border: "rgba(6,182,212,0.5)", text: "#22D3EE" },',
    'diamond: { bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.5)", text: "#60A5FA" },')
replace("src/components/cyber/PremiumBadge.tsx",
    '<span className="relative z-10">🔒 {tier==="gold"?"黄金会员":tier==="diamond"?"钻石会员":"白银会员"}</span>',
    '<span className="relative z-10">🔒 {tier==="gold"?"黄金会员":"钻石会员"}</span>')
print("  PremiumBadge.tsx")

# ====== MemberBadge: remove silver, update diamond color ======
replace("src/components/article/MemberBadge.tsx",
    '  silver: { icon: Shield, label: "白银会员", color: "text-[#94A3B8]", bg: "bg-[#94A3B8]/10", border: "border-[#94A3B8]/20" },\n',
    '')
replace("src/components/article/MemberBadge.tsx",
    'diamond: { icon: Star, label: "钻石会员", color: "text-[#22D3EE]", bg: "bg-[#22D3EE]/10", border: "border-[#22D3EE]/25" },',
    'diamond: { icon: Star, label: "钻石会员", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/25" },')
print("  MemberBadge.tsx")

# ====== Navbar: add submit link ======
replace("src/components/Navbar.tsx",
    '  { href: "/forum", label: "论坛" },\n  { href: "/calendar", label: "日历" },',
    '  { href: "/forum", label: "论坛" },\n  { href: "/submit", label: "投稿" },\n  { href: "/calendar", label: "日历" },')
print("  Navbar.tsx")

# ====== AdminLayout: add UGC nav items ======
replace("src/components/admin/AdminLayout.tsx",
    '  LogOut, ChevronLeft, Menu, X, Gift, Shield',
    '  LogOut, ChevronLeft, Menu, X, Gift, Shield, Send, DollarSign, Wallet')
replace("src/components/admin/AdminLayout.tsx",
    '''  { icon: Flame, label: "爆料管理", href: "/admin/leaks" },
  { icon: Gamepad2, label: "游戏管理", href: "/admin/games" },
  { icon: Users, label: "用户管理", href: "/admin/users" },
  { icon: CreditCard, label: "订单管理", href: "/admin/orders" },''',
    '''  { icon: Flame, label: "爆料管理", href: "/admin/leaks" },
  { icon: Send, label: "UGC 审核", href: "/admin/submissions" },
  { icon: Gamepad2, label: "游戏管理", href: "/admin/games" },
  { icon: Users, label: "用户管理", href: "/admin/users" },
  { icon: CreditCard, label: "订单管理", href: "/admin/orders" },
  { icon: DollarSign, label: "收益管理", href: "/admin/revenue" },
  { icon: Wallet, label: "提现审核", href: "/admin/withdrawals" },''')
print("  AdminLayout.tsx")

print("\n✅ Silver cleanup + component updates done!")
