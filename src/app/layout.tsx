import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";
import { WebsiteSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: { default: "国游爆料 · 国产3A游戏资讯平台", template: "%s · 国游爆料" },
  description: "追踪黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作最新动态。深度解析、独家爆料、游戏评测、玩家社区。",
  keywords: "国产3A,游戏爆料,黑神话悟空,影之刃零,归唐,湮灭之潮,国产游戏,游戏评测,钟馗,望月,燕云十六声",
  metadataBase: new URL("https://news.guoyouwenduji.cc"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "国游爆料 · 国产3A游戏资讯平台",
    description: "追踪国产3A大作最新动态。深度解析、独家爆料、游戏评测。",
    url: "https://news.guoyouwenduji.cc",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <WebsiteSchema />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="min-h-full flex flex-col">
        <ClientLayout>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
