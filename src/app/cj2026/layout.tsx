import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChinaJoy 2026 · 国产3A试玩指南 · 倒计时",
  description: "ChinaJoy 2026 (7/31-8/3 上海) 国产3A参展阵容全收录 — 锦衣卫、猿公剑、抵抗者、坦克世界征程、影之刃零、奔奔王国等16款国产PC/主机游戏。展台号、日程、试玩信息一站查。",
  alternates: { canonical: "/cj2026/" },
  openGraph: {
    title: "ChinaJoy 2026 · 国产3A试玩指南 · 国游爆料",
    description: "ChinaJoy 2026 (7/31-8/3 上海) 国产3A参展阵容全收录 — 锦衣卫、猿公剑、抵抗者、坦克世界征程、影之刃零、奔奔王国等16款国产PC/主机游戏。展台号、日程、试玩信息一站查。",
    url: "https://news.guoyouwenduji.cc/cj2026/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "ChinaJoy 2026 · 国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChinaJoy 2026 · 国产3A试玩指南 · 国游爆料",
    description: "ChinaJoy 2026 (7/31-8/3 上海) 国产3A参展阵容全收录 — 锦衣卫、猿公剑、抵抗者、坦克世界征程、影之刃零、奔奔王国等16款国产PC/主机游戏。展台号、日程、试玩信息一站查。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function Cj2026Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
