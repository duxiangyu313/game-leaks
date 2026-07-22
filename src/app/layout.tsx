import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";
import RecoveryRedirect from "@/components/RecoveryRedirect";
import { WebsiteSchema } from "@/components/StructuredData";
import { OrganizationSchema } from "@/components/StructuredData";
import { Analytics } from "@/components/Analytics";

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
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "国游爆料 · 国产3A游戏资讯平台",
    description: "追踪国产3A大作最新动态。深度解析、独家爆料、游戏评测。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <head>
        {/* 🔗 预连接关键源 — 省去 DNS+SSL 握手延迟 (~200ms) */}
        <link rel="dns-prefetch" href="https://gumpxfxbxxyljikaizsh.supabase.co" />
        <link rel="preconnect" href="https://gumpxfxbxxyljikaizsh.supabase.co" crossOrigin="anonymous" />
        {/* 🖼️ 预加载首页数据 — 让 LCP 更快 */}
        <link rel="prefetch" href="/homepage-cache.json" as="fetch" crossOrigin="anonymous" />
        {/* 📱 移动端 viewport 优化 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#0F172A" />
        <WebsiteSchema />
        <OrganizationSchema />
        <Analytics />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="baidu-site-verification" content="codeva-E9bFTKckBU" />
        <meta name="msvalidate.01" content="09B719C5C652DCD06D86E1EC550A1FE4" />
        {/* 🔒 CSP — 防 XSS，静态导出用 meta 标签实现 */}
        <meta httpEquiv="Content-Security-Policy" content={
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://hm.baidu.com https://www.googletagmanager.com; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https: blob:; " +
          "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://hm.baidu.com https://www.google-analytics.com; " +
          "frame-src 'self' https://www.youtube.com https://player.bilibili.com https://js.stripe.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "object-src 'none'; " +
          "base-uri 'self'; " +
          "form-action 'self' https://api.stripe.com;"
        } />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <RecoveryRedirect />
        <ClientLayout>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
