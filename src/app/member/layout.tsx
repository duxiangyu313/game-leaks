import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "会员中心",
  description: "国游爆料会员 — 黄金¥299/年、钻石¥899/年，独家爆料优先查看、深度解析、创作者收益分成、无广告纯净浏览。",
  alternates: { canonical: "/member/" },
  openGraph: {
    title: "加入国游爆料会员",
    description: "黄金¥299/年、钻石¥899/年 — 独家爆料、深度解析、创作者收益、无广告体验。",
    url: "https://news.guoyouwenduji.cc/member/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}