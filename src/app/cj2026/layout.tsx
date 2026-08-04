import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChinaJoy 2026 参展阵容一览 · 国产3A试玩指南 时间地点全收录",
  description: "ChinaJoy 2026 (7/31-8/3 上海新国际博览中心) 参展游戏名单全收录：影之刃零、锦衣卫、猿公剑、抵抗者、归唐、黑神话钟馗等16款国产3A/主机游戏展台位置、现场试玩信息、每日日程与门票攻略一站查。",
  alternates: { canonical: "/cj2026/" },
  openGraph: {
    title: "ChinaJoy 2026 参展阵容一览 · 国产3A试玩指南 · 国游爆料",
    description: "ChinaJoy 2026 (7/31-8/3 上海新国际博览中心) 参展游戏名单全收录：影之刃零、锦衣卫、猿公剑、抵抗者、归唐、黑神话钟馗等16款国产3A/主机游戏展台位置、现场试玩信息、每日日程与门票攻略一站查。",
    url: "https://news.guoyouwenduji.cc/cj2026/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "ChinaJoy 2026 参展阵容 · 国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChinaJoy 2026 参展阵容一览 · 国产3A试玩指南 · 国游爆料",
    description: "ChinaJoy 2026 (7/31-8/3 上海新国际博览中心) 参展游戏名单全收录：影之刃零、锦衣卫、猿公剑、抵抗者、归唐、黑神话钟馗等16款国产3A/主机游戏展台位置、现场试玩信息、每日日程与门票攻略一站查。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function Cj2026Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
