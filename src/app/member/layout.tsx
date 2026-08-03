import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "会员中心 · 国游爆料会员订阅 独家内容高清原画 · 国游爆料",
  description: "国游爆料会员中心，提供黄金¥299/年与钻石¥899/年两档订阅。黄金会员享深度解析、独家攻略、高清原画下载与24小时优先审核。钻石会员额外享全网独家爆料、开发者访谈、40%创作者分成与专属客服。",
  alternates: { canonical: "/member/" },
  openGraph: {
    title: "会员中心 · 国游爆料会员订阅 独家内容高清原画 · 国游爆料",
    description: "国游爆料会员中心，提供黄金¥299/年与钻石¥899/年两档订阅。黄金会员享深度解析、独家攻略、高清原画下载与24小时优先审核。钻石会员额外享全网独家爆料、开发者访谈、40%创作者分成与专属客服。",
    url: "https://news.guoyouwenduji.cc/member/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}