import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Globe, MessageCircle, Mail, Shield, Heart } from "lucide-react";

const FOOTER_LINKS = {
  导航: [
    { label: "首页", href: "/" },
    { label: "游戏库", href: "/games" },
    { label: "爆料专区", href: "/leaks" },
    { label: "深度解析", href: "/analysis" },
    { label: "论坛", href: "/forum" },
    { label: "邮件订阅", href: "/subscribe" },
  ],
  关于: [
    { label: "关于我们", href: "/about" },
    { label: "联系方式", href: "/contact" },
    { label: "加入团队", href: "/join" },
    { label: "广告合作", href: "/advertise" },
  ],
  法律: [
    { label: "用户协议", href: "/agreement" },
    { label: "隐私政策", href: "/privacy" },
    { label: "免责声明", href: "/disclaimer" },
    { label: "版权声明", href: "/copyright" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.04)] bg-[#080A0D]">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#E8960F] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_16px_rgba(245,166,35,0.25)]">
                G
              </div>
              <span className="text-lg font-bold text-[#F1F5F9]">国游爆料</span>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed max-w-xs">
              国产大作游戏最新资讯平台。追踪黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作，提供深度解析与玩家社区。
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://guoyouwenduji.cc" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-[#64748B] hover:text-[#F5A623] hover:bg-[#1E293B]/50 transition-all" title="主站">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://space.bilibili.com/3546857156380947" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-[#64748B] hover:text-[#F5A623] hover:bg-[#1E293B]/50 transition-all" title="B站主页">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="mailto:1852779947@qq.com" className="p-2 rounded-lg text-[#64748B] hover:text-[#F5A623] hover:bg-[#1E293B]/50 transition-all" title="合作联系">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[#F1F5F9] mb-4">{title}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <LinkNoPrefetch
                      href={link.href}
                      className="text-sm text-[#64748B] hover:text-[#F5A623] transition-colors"
                    >
                      {link.label}
                    </LinkNoPrefetch>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[rgba(30,41,59,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            &copy; 2026 国游爆料 · 版权所有
          </p>
          <p className="text-xs text-[#64748B] flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-[#EF4444]" /> by 国产游戏爱好者社区
          </p>
        </div>
      </div>
    </footer>
  );
}
