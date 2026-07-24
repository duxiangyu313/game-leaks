import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏日历",
  description: "国产3A游戏事件日历 — 发售日、测试、展会、直播等时间节点一目了然。",
  alternates: { canonical: "/calendar/" },
  openGraph: {
    title: "游戏日历 · 国游爆料",
    description: "国产3A游戏事件日历 — 发售日、测试、展会、直播等时间节点一目了然。",
    url: "https://news.guoyouwenduji.cc/calendar/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏日历 · 国游爆料",
    description: "国产3A游戏事件日历 — 发售日、测试、展会、直播等时间节点一目了然。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
