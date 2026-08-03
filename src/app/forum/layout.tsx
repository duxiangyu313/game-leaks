import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "社区论坛 · 国产3A游戏玩家讨论交流社区 · 国游爆料",
  description: "国产3A游戏玩家社区 — 黑神话、影之刃零、归唐、湮灭之潮讨论区。攻略交流、爆料分享、组队交友。",
  alternates: { canonical: "/forum/" },
  openGraph: {
    title: "社区论坛 · 国产3A游戏玩家讨论交流社区 · 国游爆料",
    description: "国产3A游戏玩家社区 — 黑神话、影之刃零、归唐、湮灭之潮讨论区。攻略交流、爆料分享、组队交友。",
    url: "https://news.guoyouwenduji.cc/forum/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "社区论坛 · 国产3A游戏玩家讨论交流社区 · 国游爆料",
    description: "国产3A游戏玩家社区 — 黑神话、影之刃零、归唐、湮灭之潮讨论区。攻略交流、爆料分享、组队交友。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
