import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频内容 · 国产3A游戏爆料视频深度解析评测 · 国游爆料",
  description: "国游温度计视频内容专区，聚焦黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料解读、官方实机演示、深度评测、发售日盘点、前瞻解析、行业观察与玩家讨论，以高质量视频形式带你全面看懂国产游戏的玩法特色、技术表现、叙事风格与市场发展趋势。",
  alternates: { canonical: "/videos/" },
  openGraph: {
    title: "视频内容 · 国产3A游戏爆料视频深度解析评测 · 国游爆料",
    description: "国游温度计视频内容专区，聚焦黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料解读、官方实机演示、深度评测、发售日盘点、前瞻解析、行业观察与玩家讨论，以高质量视频形式带你全面看懂国产游戏的玩法特色、技术表现、叙事风格与市场发展趋势。",
    url: "https://news.guoyouwenduji.cc/videos/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "视频内容 · 国产3A游戏爆料视频深度解析评测 · 国游爆料",
    description: "国游温度计视频内容专区，聚焦黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的最新爆料解读、官方实机演示、深度评测、发售日盘点、前瞻解析、行业观察与玩家讨论，以高质量视频形式带你全面看懂国产游戏的玩法特色、技术表现、叙事风格与市场发展趋势。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
