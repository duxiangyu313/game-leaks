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
  title: { default: "国游爆料 · 国产3A游戏资讯平台 黑神话悟空 影之刃零 归唐 湮灭之潮", template: "%s · 国游爆料" },
  description: "国游爆料是专注国产3A游戏的资讯平台，追踪黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产大作的最新动态。提供深度解析、独家爆料、游戏评测、配置攻略与玩家社区，做有温度的国产游戏观察者。",
  keywords: "国产3A,游戏爆料,黑神话悟空,影之刃零,归唐,湮灭之潮,国产游戏,游戏评测,钟馗,望月,燕云十六声",
  metadataBase: new URL("https://news.guoyouwenduji.cc"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "国游爆料 · 国产3A游戏资讯平台 黑神话悟空 影之刃零 归唐 湮灭之潮",
    description: "国游爆料是专注国产3A游戏的资讯平台，追踪黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产大作的最新动态。提供深度解析、独家爆料、游戏评测、配置攻略与玩家社区，做有温度的国产游戏观察者。",
    url: "https://news.guoyouwenduji.cc",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "国游爆料 · 国产3A游戏资讯平台",
    description: "国游爆料是专注国产3A游戏的资讯平台，追踪黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产大作的最新动态。提供深度解析、独家爆料、游戏评测、配置攻略与玩家社区，做有温度的国产游戏观察者。",
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
        {/* 🌐 SEO: 显式声明 charset（覆盖 Next.js 静态导出可能产生的 charSet 非标准属性） */}
        <meta charset="utf-8" />
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://hm.baidu.com https://www.googletagmanager.com https://zz.bdstatic.com; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https: blob:; " +
          "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://hm.baidu.com https://www.google-analytics.com https://zz.bdstatic.com https://*.baidu.com; " +
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
          <main className="flex-1">
            {/* SEO: h1 必须在 RSC Suspense 边界之外才能被 Bingbot 看到。
                Next.js 静态导出会把 {children} 放入 <div hidden>，
                Bingbot 不执行 JS，只读取可见静态 HTML。 */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-2">
              <h2 className="text-lg md:text-2xl font-bold text-[#F1F5F9] text-center">
                国游爆料 · 国产3A游戏资讯平台
              </h2>
              <p className="text-xs md:text-sm text-[#94A3B8] text-center mt-1">
                追踪黑神话悟空、影之刃零、归唐等国产大作最新动态
              </p>
            </div>
            {children}
          </main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
