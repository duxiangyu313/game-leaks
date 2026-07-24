import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频内容",
  description: "国游温度计视频内容 — 国产3A游戏资讯视频、实机演示、深度评测、行业观察。",
  alternates: { canonical: "/videos/" },
  openGraph: {
    title: "视频内容 · 国游爆料",
    description: "国游温度计视频内容 — 国产3A游戏资讯视频、实机演示、深度评测、行业观察。",
    url: "https://news.guoyouwenduji.cc/videos/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "视频内容 · 国游爆料",
    description: "国游温度计视频内容 — 国产3A游戏资讯视频、实机演示、深度评测、行业观察。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
