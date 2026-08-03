import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "爆料专区 · 国产3A游戏最新传闻官方确认独家爆料",
  description: "国游爆料专区汇集最新国产3A游戏爆料与传闻，追踪影之刃零、归唐、湮灭之潮、黑神话悟空等大作的开发动态、发售消息、实机演示与官方确认。汇集开发者访谈、行业内部消息与玩家分析，做你追踪国产3A的第一信源。",
  alternates: { canonical: "/leaks/" },
  openGraph: {
    title: "爆料专区 · 国产3A游戏最新传闻官方确认独家爆料 · 国游爆料",
    description: "国游爆料专区汇集最新国产3A游戏爆料与传闻，追踪影之刃零、归唐、湮灭之潮、黑神话悟空等大作的开发动态、发售消息、实机演示与官方确认。汇集开发者访谈、行业内部消息与玩家分析，做你追踪国产3A的第一信源。",
    url: "https://news.guoyouwenduji.cc/leaks/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "爆料专区 · 国产3A游戏最新传闻官方确认独家爆料 · 国游爆料",
    description: "国游爆料专区汇集最新国产3A游戏爆料与传闻，追踪影之刃零、归唐、湮灭之潮、黑神话悟空等大作的开发动态、发售消息、实机演示与官方确认。汇集开发者访谈、行业内部消息与玩家分析，做你追踪国产3A的第一信源。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function LeaksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
