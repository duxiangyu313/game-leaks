import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "全站搜索",
  description: "搜索国游爆料全部内容 — 游戏、爆料、文章、论坛帖子一键搜索。",
  alternates: { canonical: "/search/" },
  openGraph: {
    title: "全站搜索 · 国游爆料",
    description: "搜索国游爆料全部内容 — 游戏、爆料、文章、论坛帖子一键搜索。",
    url: "https://news.guoyouwenduji.cc/search/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "全站搜索 · 国游爆料",
    description: "搜索国游爆料全部内容 — 游戏、爆料、文章、论坛帖子一键搜索。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
