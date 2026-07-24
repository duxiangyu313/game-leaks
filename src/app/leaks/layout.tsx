import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "爆料专区",
  description: "国产3A游戏最新爆料汇总 — 影之刃零延期、归唐SGF实机、湮灭之潮试玩。追踪国产大作传闻与官方确认消息。",
  alternates: { canonical: "/leaks/" },
  openGraph: {
    title: "爆料专区 · 国游爆料",
    description: "国产3A游戏最新爆料汇总 — 影之刃零延期、归唐SGF实机、湮灭之潮试玩。追踪国产大作传闻与官方确认消息。",
    url: "https://news.guoyouwenduji.cc/leaks/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "爆料专区 · 国游爆料",
    description: "国产3A游戏最新爆料汇总 — 影之刃零延期、归唐SGF实机、湮灭之潮试玩。追踪国产大作传闻与官方确认消息。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function LeaksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
